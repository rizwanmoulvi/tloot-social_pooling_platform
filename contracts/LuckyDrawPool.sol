// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./PlatformTokenV2.sol";

interface ISupraRouter {
    function generateRequest(
        string memory _functionSig,
        uint8 _rngCount,
        uint256 _numConfirmations,
        address _clientWalletAddress
    ) external returns (uint256);
}

/**
 * @title LuckyDrawPool
 * @dev Individual Lucky Draw pool contract with Supra dVRF integration
 */
contract LuckyDrawPool is Ownable, ReentrancyGuard {
    IERC20 public immutable usdtToken;
    PlatformTokenV2 public immutable tlootToken;
    ISupraRouter public immutable supraRouter;
    
    address public immutable factory;
    address public immutable admin;
    
    // Pool details
    string public eventName;
    uint256 public eventDate;
    uint256 public ticketPrice;
    uint256 public entryAmount;
    uint256 public maxParticipants;
    uint256 public poolDeadline;
    uint256 public createdAt;
    
    // Pool state
    address[] public participants;
    mapping(address => uint256) public contributions;
    mapping(address => bool) public hasJoined;
    
    address public winner;
    bool public isFinalized;
    bool public isCancelled;
    uint256 public totalPooled;
    
    // Supra VRF
    uint256 public vrfRequestId;
    uint256 public randomNumber;
    bool public randomnessRequested;
    
    // Events
    event ParticipantJoined(address indexed user, uint256 amount, uint256 tlootReward);
    event RandomnessRequested(uint256 indexed requestId);
    event WinnerSelected(address indexed winner, uint256 randomNumber);
    event PoolFinalized(address indexed winner, uint256 totalAmount);
    event PoolCancelled(uint256 totalRefunded);
    event Refunded(address indexed user, uint256 amount);
    event AdminWithdrawal(uint256 amount);
    
    modifier onlyFactory() {
        require(msg.sender == factory, "Only factory");
        _;
    }
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }
    
    modifier onlySupraRouter() {
        require(msg.sender == address(supraRouter), "Only Supra Router");
        _;
    }
    
    constructor(
        address _usdtToken,
        address _tlootToken,
        address _supraRouter,
        address _admin,
        string memory _eventName,
        uint256 _eventDate,
        uint256 _ticketPrice,
        uint256 _entryAmount,
        uint256 _maxParticipants,
        uint256 _poolDeadline
    ) Ownable(msg.sender) {
        factory = msg.sender;
        admin = _admin;
        usdtToken = IERC20(_usdtToken);
        tlootToken = PlatformTokenV2(_tlootToken);
        supraRouter = ISupraRouter(_supraRouter);
        
        eventName = _eventName;
        eventDate = _eventDate;
        ticketPrice = _ticketPrice;
        entryAmount = _entryAmount;
        maxParticipants = _maxParticipants;
        poolDeadline = _poolDeadline;
        createdAt = block.timestamp;
    }
    
    /**
     * @dev Join the lucky draw pool
     */
    function joinPool() external nonReentrant {
        require(!isCancelled, "Pool cancelled");
        require(!isFinalized, "Pool finalized");
        require(block.timestamp < poolDeadline, "Pool expired");
        require(!hasJoined[msg.sender], "Already joined");
        require(participants.length < maxParticipants, "Pool full");
        
        // Transfer USDT from user
        require(
            usdtToken.transferFrom(msg.sender, address(this), entryAmount),
            "USDT transfer failed"
        );
        
        // Add participant
        participants.push(msg.sender);
        contributions[msg.sender] = entryAmount;
        hasJoined[msg.sender] = true;
        totalPooled += entryAmount;
        
        // Mint TLOOT tokens as immediate reward (1:1 with contribution)
        uint256 tlootReward = entryAmount * 10**12; // Convert USDT (6 decimals) to TLOOT (18 decimals)
        tlootToken.mint(msg.sender, tlootReward, "Lucky draw participation");
        
        emit ParticipantJoined(msg.sender, entryAmount, tlootReward);
    }
    
    /**
     * @dev Request randomness from Supra dVRF
     */
    function requestRandomness() external onlyAdmin {
        require(!isCancelled, "Pool cancelled");
        require(!isFinalized, "Already finalized");
        require(block.timestamp >= poolDeadline, "Pool not ended");
        require(participants.length > 0, "No participants");
        require(!randomnessRequested, "Already requested");
        
        // Check if target reached
        if (totalPooled < ticketPrice) {
            // Target not reached, cancel and refund
            _cancelAndRefund();
            return;
        }
        
        randomnessRequested = true;
        
        // Request randomness from Supra
        vrfRequestId = supraRouter.generateRequest(
            "callback(uint256,uint256[])",
            1, // request 1 random number
            1, // number of confirmations
            address(this)
        );
        
        emit RandomnessRequested(vrfRequestId);
    }
    
    /**
     * @dev Callback function for Supra dVRF
     * @param _requestId The request ID
     * @param _rngList Array of random numbers
     */
    function callback(uint256 _requestId, uint256[] memory _rngList) external onlySupraRouter {
        require(_requestId == vrfRequestId, "Invalid request ID");
        require(_rngList.length > 0, "No random number");
        
        randomNumber = _rngList[0];
        
        // Select winner using modulo
        uint256 winnerIndex = randomNumber % participants.length;
        winner = participants[winnerIndex];
        
        emit WinnerSelected(winner, randomNumber);
    }
    
    /**
     * @dev Finalize the pool and transfer funds to admin (after winner selected)
     */
    function finalizePool() external onlyAdmin {
        require(!isCancelled, "Pool cancelled");
        require(!isFinalized, "Already finalized");
        require(winner != address(0), "Winner not selected");
        
        isFinalized = true;
        
        // Transfer all USDT to admin (platform will handle ticket purchase)
        uint256 balance = usdtToken.balanceOf(address(this));
        require(usdtToken.transfer(admin, balance), "Transfer failed");
        
        emit PoolFinalized(winner, balance);
    }
    
    /**
     * @dev Cancel pool and refund all participants (if target not reached)
     */
    function _cancelAndRefund() private {
        isCancelled = true;
        
        uint256 totalRefunded = 0;
        for (uint256 i = 0; i < participants.length; i++) {
            address participant = participants[i];
            uint256 amount = contributions[participant];
            
            if (amount > 0) {
                contributions[participant] = 0;
                require(usdtToken.transfer(participant, amount), "Refund failed");
                totalRefunded += amount;
                emit Refunded(participant, amount);
            }
        }
        
        emit PoolCancelled(totalRefunded);
    }
    
    /**
     * @dev Manual cancel by admin (before deadline)
     */
    function cancelPool() external onlyAdmin {
        require(!isFinalized, "Already finalized");
        require(!isCancelled, "Already cancelled");
        
        _cancelAndRefund();
    }
    
    /**
     * @dev Emergency withdrawal by admin
     */
    function emergencyWithdraw() external onlyAdmin {
        uint256 balance = usdtToken.balanceOf(address(this));
        require(balance > 0, "No balance");
        require(usdtToken.transfer(admin, balance), "Transfer failed");
        emit AdminWithdrawal(balance);
    }
    
    // View functions
    function getParticipants() external view returns (address[] memory) {
        return participants;
    }
    
    function getParticipantCount() external view returns (uint256) {
        return participants.length;
    }
    
    function isTargetReached() external view returns (bool) {
        return totalPooled >= ticketPrice;
    }
    
    function getPoolInfo() external view returns (
        string memory _eventName,
        uint256 _eventDate,
        uint256 _ticketPrice,
        uint256 _entryAmount,
        uint256 _maxParticipants,
        uint256 _currentParticipants,
        uint256 _totalPooled,
        uint256 _poolDeadline,
        address _winner,
        bool _isFinalized,
        bool _isCancelled
    ) {
        return (
            eventName,
            eventDate,
            ticketPrice,
            entryAmount,
            maxParticipants,
            participants.length,
            totalPooled,
            poolDeadline,
            winner,
            isFinalized,
            isCancelled
        );
    }
}
