// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IERC20Simple {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

/**
 * @title SimplePoolManager
 * @dev Single contract that manages all pools and mints TLOOT tokens (like Aave)
 */
contract SimplePoolManager is ERC20, Ownable, ReentrancyGuard {
    IERC20Simple public immutable usdtToken;
    
    uint256 public poolCount;
    uint256 public constant MAX_TLOOT_SUPPLY = 1_000_000_000 * 10**18;
    
    enum PoolType { LuckyDraw, CommitToClaim }
    enum PoolStatus { Active, Finalized, Cancelled }
    
    struct Pool {
        uint256 id;
        PoolType poolType;
        PoolStatus status;
        address creator;
        string eventName;
        uint256 entryAmount;        // Commitment amount for CommitToClaim, entry for LuckyDraw
        uint256 ticketPrice;        // Full ticket price for CommitToClaim
        uint256 maxParticipants;
        uint256 deadline;           // Deadline for joining (LuckyDraw) or payment completion (CommitToClaim)
        uint256 totalPooled;
        address winner;
        address[] participants;
    }
    
    mapping(uint256 => Pool) public pools;
    mapping(uint256 => mapping(address => bool)) public hasJoined;
    mapping(uint256 => mapping(address => uint256)) public contributions;
    mapping(uint256 => mapping(address => bool)) public hasCompletedPayment; // For CommitToClaim payment tracking
    
    event PoolCreated(uint256 indexed poolId, PoolType poolType, address creator, string eventName);
    event UserJoined(uint256 indexed poolId, address indexed user, uint256 amount, uint256 tlootMinted);
    event PaymentCompleted(uint256 indexed poolId, address indexed user, uint256 remainingAmount);
    event WinnerSelected(uint256 indexed poolId, address indexed winner);
    event PoolFinalized(uint256 indexed poolId);
    event PoolCancelled(uint256 indexed poolId);
    
    constructor(address _usdtToken) ERC20("TLOOT Token", "TLOOT") Ownable(msg.sender) {
        usdtToken = IERC20Simple(_usdtToken);
        
        // Mint initial 10% supply to owner
        _mint(msg.sender, MAX_TLOOT_SUPPLY / 10);
    }
    
    /**
     * @dev Create a new pool
     */
    function createPool(
        PoolType poolType,
        string memory eventName,
        uint256 entryAmount,
        uint256 ticketPrice,
        uint256 maxParticipants,
        uint256 deadline
    ) external returns (uint256) {
        poolCount++;
        uint256 poolId = poolCount;
        
        Pool storage pool = pools[poolId];
        pool.id = poolId;
        pool.poolType = poolType;
        pool.status = PoolStatus.Active;
        pool.creator = msg.sender;
        pool.eventName = eventName;
        pool.entryAmount = entryAmount;
        pool.ticketPrice = ticketPrice;
        pool.maxParticipants = maxParticipants;
        pool.deadline = deadline;
        
        emit PoolCreated(poolId, poolType, msg.sender, eventName);
        return poolId;
    }
    
    /**
     * @dev Join a pool with commitment payment
     * For both pool types, users pay the fixed entryAmount
     * For CommitToClaim, this is just the commitment - full payment comes later
     */
    function joinPool(uint256 poolId) external nonReentrant {
        Pool storage pool = pools[poolId];
        
        require(pool.id != 0, "Pool does not exist");
        require(pool.status == PoolStatus.Active, "Pool not active");
        require(block.timestamp < pool.deadline, "Pool expired");
        require(!hasJoined[poolId][msg.sender], "Already joined");
        
        // For both pool types: check participant limit
        if (pool.participants.length >= pool.maxParticipants) {
            revert("Pool full");
        }
        
        uint256 contributionAmount = pool.entryAmount;
        
        // Transfer USDT from user
        require(
            usdtToken.transferFrom(msg.sender, address(this), contributionAmount),
            "USDT transfer failed"
        );
        
        // Add participant
        pool.participants.push(msg.sender);
        hasJoined[poolId][msg.sender] = true;
        contributions[poolId][msg.sender] = contributionAmount;
        pool.totalPooled += contributionAmount;
        
        // Mint TLOOT tokens 1:1 with USDT (accounting for decimals: USDT=6, TLOOT=18)
        uint256 tlootAmount = contributionAmount * 10**12;
        require(totalSupply() + tlootAmount <= MAX_TLOOT_SUPPLY, "Max supply exceeded");
        _mint(msg.sender, tlootAmount);
        
        emit UserJoined(poolId, msg.sender, contributionAmount, tlootAmount);
    }
    
    /**
     * @dev Complete payment for CommitToClaim pool (pay remaining amount after initial commitment)
     * @param poolId The ID of the pool
     */
    function completePayment(uint256 poolId) external nonReentrant {
        Pool storage pool = pools[poolId];
        
        require(pool.poolType == PoolType.CommitToClaim, "Only for CommitToClaim pools");
        require(pool.status == PoolStatus.Finalized, "Pool not finalized yet");
        require(hasJoined[poolId][msg.sender], "Not a participant");
        require(!hasCompletedPayment[poolId][msg.sender], "Payment already completed");
        require(block.timestamp < pool.deadline, "Payment deadline passed");
        
        // Calculate remaining amount to pay
        uint256 remainingAmount = pool.ticketPrice - pool.entryAmount;
        
        // Transfer remaining USDT from user
        require(
            usdtToken.transferFrom(msg.sender, address(this), remainingAmount),
            "USDT transfer failed"
        );
        
        // Mark payment as completed
        hasCompletedPayment[poolId][msg.sender] = true;
        contributions[poolId][msg.sender] += remainingAmount;
        pool.totalPooled += remainingAmount;
        
        // Mint additional TLOOT for remaining payment
        uint256 tlootAmount = remainingAmount * 10**12;
        require(totalSupply() + tlootAmount <= MAX_TLOOT_SUPPLY, "Max supply exceeded");
        _mint(msg.sender, tlootAmount);
        
        emit PaymentCompleted(poolId, msg.sender, remainingAmount);
    }
    
    /**
     * @dev Select winner randomly (simplified - use Supra VRF in production)
     */
    function selectWinner(uint256 poolId, uint256 randomSeed) external onlyOwner {
        Pool storage pool = pools[poolId];
        
        require(pool.status == PoolStatus.Active, "Pool not active");
        require(block.timestamp >= pool.deadline, "Pool not ended");
        require(pool.participants.length > 0, "No participants");
        
        // Check if target reached
        if (pool.totalPooled < pool.ticketPrice) {
            // Refund all participants
            _refundPool(poolId);
            return;
        }
        
        // Select winner
        uint256 winnerIndex = randomSeed % pool.participants.length;
        pool.winner = pool.participants[winnerIndex];
        
        emit WinnerSelected(poolId, pool.winner);
    }
    
    /**
     * @dev Finalize pool and withdraw funds
     */
    function finalizePool(uint256 poolId) external onlyOwner {
        Pool storage pool = pools[poolId];
        
        require(pool.status == PoolStatus.Active, "Pool not active");
        require(pool.winner != address(0), "No winner selected");
        
        pool.status = PoolStatus.Finalized;
        
        // Transfer all USDT to owner
        require(
            usdtToken.transfer(owner(), pool.totalPooled),
            "Transfer failed"
        );
        
        emit PoolFinalized(poolId);
    }
    
    /**
     * @dev Refund all participants
     */
    function _refundPool(uint256 poolId) private {
        Pool storage pool = pools[poolId];
        pool.status = PoolStatus.Cancelled;
        
        for (uint256 i = 0; i < pool.participants.length; i++) {
            address participant = pool.participants[i];
            uint256 amount = contributions[poolId][participant];
            
            if (amount > 0) {
                contributions[poolId][participant] = 0;
                usdtToken.transfer(participant, amount);
            }
        }
        
        emit PoolCancelled(poolId);
    }
    
    /**
     * @dev Cancel pool manually
     */
    function cancelPool(uint256 poolId) external onlyOwner {
        Pool storage pool = pools[poolId];
        require(pool.status == PoolStatus.Active, "Pool not active");
        
        _refundPool(poolId);
    }
    
    // View functions
    function getPool(uint256 poolId) external view returns (Pool memory) {
        return pools[poolId];
    }
    
    function getParticipants(uint256 poolId) external view returns (address[] memory) {
        return pools[poolId].participants;
    }
    
    function getParticipantCount(uint256 poolId) external view returns (uint256) {
        return pools[poolId].participants.length;
    }
}
