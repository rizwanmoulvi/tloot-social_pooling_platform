// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./PlatformToken.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PoolManager
 * @dev Manages Lucky Draw pools for event ticket access with USDT payments
 */
contract PoolManager is Ownable, ReentrancyGuard {
    PlatformToken public platformToken;
    IERC20 public paymentToken; // USDT for payments
    
    enum PoolType { LUCKY_DRAW, COMMIT_TO_CLAIM }
    enum PoolStatus { ACTIVE, FILLING, COMPLETED, EXPIRED, CANCELLED }
    
    struct Pool {
        uint256 id;
        string eventName;
        uint256 eventDate;
        uint256 ticketPrice; // in USDT (6 decimals)
        uint256 entryAmount; // in USDT (6 decimals)
        uint256 maxParticipants;
        uint256 totalParticipants;
        uint256 winnerCount;
        uint256 poolDeadline;
        uint256 claimDeadline;
        PoolType poolType;
        PoolStatus status;
        uint256 totalPooled; // in USDT
        bool finalized;
        uint256[] winnerIndices;
        uint256 createdAt;
    }
    
    struct Participation {
        address participant;
        uint256 poolId;
        uint256 amount; // in USDT
        bool isWinner;
        bool hasClaimed;
        bool hasReceivedReward;
        uint256 joinedAt;
    }
    
    // State variables
    uint256 public nextPoolId = 1;
    uint256 public claimFeePercentage = 20; // 20% claim fee
    uint256 public platformFeePercentage = 50; // 50% of claim fee goes to platform
    uint256 public participationReward = 10 * 10**18; // 10 TKT for joining
    uint256 public yieldMultiplier = 5; // 5% yield bonus
    
    mapping(uint256 => Pool) public pools;
    mapping(uint256 => address[]) public poolParticipants;
    mapping(uint256 => mapping(address => bool)) public hasJoined;
    mapping(address => uint256[]) public userPools;
    mapping(uint256 => mapping(address => Participation)) public participations;
    
    // Events
    event PoolCreated(
        uint256 indexed poolId,
        string eventName,
        uint256 ticketPrice,
        uint256 entryAmount,
        uint256 maxParticipants,
        uint256 winnerCount
    );
    event UserJoinedPool(
        uint256 indexed poolId,
        address indexed user,
        uint256 amount,
        uint256 totalParticipants
    );
    event PoolFinalized(
        uint256 indexed poolId,
        uint256 totalPooled,
        uint256 winnerCount
    );
    event WinnerSelected(
        uint256 indexed poolId,
        address indexed winner,
        uint256 winnerIndex
    );
    event TicketClaimed(
        uint256 indexed poolId,
        address indexed winner,
        uint256 claimFee
    );
    event RewardsDistributed(
        uint256 indexed poolId,
        address indexed recipient,
        uint256 amount,
        string reason
    );
    event PoolCancelled(uint256 indexed poolId, uint256 refundAmount);
    
    constructor(address _platformToken, address _paymentToken) Ownable(msg.sender) {
        platformToken = PlatformToken(_platformToken);
        paymentToken = IERC20(_paymentToken);
    }
    
    /**
     * @dev Create a new Lucky Draw pool
     */
    function createPool(
        string memory eventName,
        uint256 eventDate,
        uint256 ticketPrice,
        uint256 entryAmount,
        uint256 maxParticipants,
        uint256 winnerCount,
        uint256 daysUntilDeadline
    ) external onlyOwner returns (uint256) {
        require(bytes(eventName).length > 0, "Event name required");
        require(eventDate > block.timestamp, "Event must be in future");
        require(ticketPrice > 0, "Ticket price must be > 0");
        require(entryAmount > 0, "Entry amount must be > 0");
        require(maxParticipants > 0, "Max participants must be > 0");
        require(winnerCount > 0 && winnerCount <= maxParticipants, "Invalid winner count");
        
        uint256 poolId = nextPoolId++;
        uint256 poolDeadline = block.timestamp + (daysUntilDeadline * 1 days);
        uint256 claimDeadline = eventDate - 1 days;
        
        Pool storage pool = pools[poolId];
        pool.id = poolId;
        pool.eventName = eventName;
        pool.eventDate = eventDate;
        pool.ticketPrice = ticketPrice;
        pool.entryAmount = entryAmount;
        pool.maxParticipants = maxParticipants;
        pool.winnerCount = winnerCount;
        pool.poolDeadline = poolDeadline;
        pool.claimDeadline = claimDeadline;
        pool.poolType = PoolType.LUCKY_DRAW;
        pool.status = PoolStatus.ACTIVE;
        pool.createdAt = block.timestamp;
        
        emit PoolCreated(
            poolId,
            eventName,
            ticketPrice,
            entryAmount,
            maxParticipants,
            winnerCount
        );
        
        return poolId;
    }
    
    /**
     * @dev Join a pool by paying USDT
     */
    function joinPool(uint256 poolId) external nonReentrant {
        Pool storage pool = pools[poolId];
        
        require(pool.id != 0, "Pool does not exist");
        require(pool.status == PoolStatus.ACTIVE || pool.status == PoolStatus.FILLING, "Pool not accepting participants");
        require(!hasJoined[poolId][msg.sender], "Already joined this pool");
        require(pool.totalParticipants < pool.maxParticipants, "Pool is full");
        require(block.timestamp < pool.poolDeadline, "Pool deadline passed");
        
        // Transfer USDT from user to contract
        require(
            paymentToken.transferFrom(msg.sender, address(this), pool.entryAmount),
            "USDT transfer failed"
        );
        
        // Record participation
        hasJoined[poolId][msg.sender] = true;
        poolParticipants[poolId].push(msg.sender);
        userPools[msg.sender].push(poolId);
        
        participations[poolId][msg.sender] = Participation({
            participant: msg.sender,
            poolId: poolId,
            amount: pool.entryAmount,
            isWinner: false,
            hasClaimed: false,
            hasReceivedReward: false,
            joinedAt: block.timestamp
        });
        
        pool.totalParticipants++;
        pool.totalPooled += pool.entryAmount;
        
        // Update status if pool is full
        if (pool.totalParticipants == pool.maxParticipants) {
            pool.status = PoolStatus.FILLING;
        }
        
        // Mint participation reward tokens
        try platformToken.mint(msg.sender, participationReward, "Pool participation") {
            participations[poolId][msg.sender].hasReceivedReward = true;
            emit RewardsDistributed(poolId, msg.sender, participationReward, "Participation");
        } catch {
            // Continue even if minting fails
        }
        
        emit UserJoinedPool(poolId, msg.sender, pool.entryAmount, pool.totalParticipants);
    }
    
    /**
     * @dev Finalize pool and select winners
     */
    function finalizePool(uint256 poolId) external onlyOwner nonReentrant {
        Pool storage pool = pools[poolId];
        
        require(pool.id != 0, "Pool does not exist");
        require(!pool.finalized, "Pool already finalized");
        require(
            pool.totalParticipants == pool.maxParticipants || 
            block.timestamp >= pool.poolDeadline,
            "Pool not ready to finalize"
        );
        
        pool.finalized = true;
        pool.status = PoolStatus.COMPLETED;
        
        // Select winners (pseudo-random for MVP)
        uint256 participantCount = poolParticipants[poolId].length;
        require(participantCount > 0, "No participants");
        
        uint256 winnersToSelect = pool.winnerCount < participantCount ? pool.winnerCount : participantCount;
        
        // Simple pseudo-random selection
        for (uint256 i = 0; i < winnersToSelect; i++) {
            uint256 randomIndex = uint256(keccak256(abi.encodePacked(
                block.timestamp,
                block.prevrandao,
                poolId,
                i
            ))) % participantCount;
            
            // Avoid duplicate winners
            bool isDuplicate = false;
            for (uint256 j = 0; j < pool.winnerIndices.length; j++) {
                if (pool.winnerIndices[j] == randomIndex) {
                    isDuplicate = true;
                    break;
                }
            }
            
            if (!isDuplicate) {
                pool.winnerIndices.push(randomIndex);
                address winner = poolParticipants[poolId][randomIndex];
                participations[poolId][winner].isWinner = true;
                emit WinnerSelected(poolId, winner, randomIndex);
            }
        }
        
        // Distribute yield rewards to all participants
        _distributeYieldRewards(poolId);
        
        emit PoolFinalized(poolId, pool.totalPooled, pool.winnerIndices.length);
    }
    
    /**
     * @dev Winner claims ticket by paying 20% claim fee in USDT
     */
    function claimTicket(uint256 poolId) external nonReentrant {
        Pool storage pool = pools[poolId];
        Participation storage participation = participations[poolId][msg.sender];
        
        require(pool.finalized, "Pool not finalized");
        require(participation.isWinner, "Not a winner");
        require(!participation.hasClaimed, "Already claimed");
        require(block.timestamp < pool.claimDeadline, "Claim deadline passed");
        
        uint256 claimFee = (pool.ticketPrice * claimFeePercentage) / 100;
        
        // Transfer claim fee from winner to contract
        require(
            paymentToken.transferFrom(msg.sender, address(this), claimFee),
            "Claim fee payment failed"
        );
        
        participation.hasClaimed = true;
        
        // Split claim fee: 50% to platform, 50% distributed as rewards
        uint256 platformFee = (claimFee * platformFeePercentage) / 100;
        uint256 rewardPool = claimFee - platformFee;
        
        // Transfer platform fee to owner
        paymentToken.transfer(owner(), platformFee);
        
        // Distribute reward pool to all participants as TKT tokens
        _distributeClaimFeeRewards(poolId, rewardPool);
        
        emit TicketClaimed(poolId, msg.sender, claimFee);
    }
    
    /**
     * @dev Cancel pool and refund all participants
     */
    function cancelPool(uint256 poolId) external onlyOwner nonReentrant {
        Pool storage pool = pools[poolId];
        
        require(pool.id != 0, "Pool does not exist");
        require(!pool.finalized, "Cannot cancel finalized pool");
        require(pool.status != PoolStatus.CANCELLED, "Already cancelled");
        
        pool.status = PoolStatus.CANCELLED;
        
        // Refund all participants
        address[] memory participants = poolParticipants[poolId];
        for (uint256 i = 0; i < participants.length; i++) {
            address participant = participants[i];
            uint256 refundAmount = participations[poolId][participant].amount;
            
            if (refundAmount > 0) {
                paymentToken.transfer(participant, refundAmount);
            }
        }
        
        emit PoolCancelled(poolId, pool.totalPooled);
    }
    
    /**
     * @dev Distribute yield rewards to all participants
     */
    function _distributeYieldRewards(uint256 poolId) internal {
        Pool storage pool = pools[poolId];
        address[] memory participants = poolParticipants[poolId];
        
        for (uint256 i = 0; i < participants.length; i++) {
            address participant = participants[i];
            Participation storage participation = participations[poolId][participant];
            
            // Calculate yield: 5% of entry amount in TKT tokens
            uint256 yieldAmount = (participation.amount * yieldMultiplier * 10**18) / 100 / 10**6; // Convert USDT to TKT
            
            try platformToken.mint(participant, yieldAmount, "Yield reward") {
                emit RewardsDistributed(poolId, participant, yieldAmount, "Yield");
            } catch {
                // Continue even if minting fails
            }
        }
    }
    
    /**
     * @dev Distribute claim fee as TKT rewards to participants
     */
    function _distributeClaimFeeRewards(uint256 poolId, uint256 rewardPool) internal {
        address[] memory participants = poolParticipants[poolId];
        uint256 rewardPerParticipant = (rewardPool * 10**18) / participants.length / 10**6; // Convert USDT to TKT
        
        for (uint256 i = 0; i < participants.length; i++) {
            try platformToken.mint(participants[i], rewardPerParticipant, "Claim fee reward") {
                emit RewardsDistributed(poolId, participants[i], rewardPerParticipant, "ClaimFee");
            } catch {
                // Continue even if minting fails
            }
        }
    }
    
    // View functions
    function getPool(uint256 poolId) external view returns (Pool memory) {
        return pools[poolId];
    }
    
    function getPoolParticipants(uint256 poolId) external view returns (address[] memory) {
        return poolParticipants[poolId];
    }
    
    function getPoolWinners(uint256 poolId) external view returns (address[] memory) {
        Pool memory pool = pools[poolId];
        address[] memory winners = new address[](pool.winnerIndices.length);
        
        for (uint256 i = 0; i < pool.winnerIndices.length; i++) {
            winners[i] = poolParticipants[poolId][pool.winnerIndices[i]];
        }
        
        return winners;
    }
    
    function getUserPools(address user) external view returns (uint256[] memory) {
        return userPools[user];
    }
    
    function getParticipation(uint256 poolId, address user) external view returns (Participation memory) {
        return participations[poolId][user];
    }
    
    function isWinner(uint256 poolId, address user) external view returns (bool) {
        return participations[poolId][user].isWinner;
    }
    
    // Admin functions
    function updateRewardParameters(
        uint256 _claimFeePercentage,
        uint256 _platformFeePercentage,
        uint256 _participationReward,
        uint256 _yieldMultiplier
    ) external onlyOwner {
        require(_claimFeePercentage <= 100, "Invalid claim fee");
        require(_platformFeePercentage <= 100, "Invalid platform fee");
        
        claimFeePercentage = _claimFeePercentage;
        platformFeePercentage = _platformFeePercentage;
        participationReward = _participationReward;
        yieldMultiplier = _yieldMultiplier;
    }
    
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        require(IERC20(token).transfer(owner(), amount), "Withdraw failed");
    }
}
