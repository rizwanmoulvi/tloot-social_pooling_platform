// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./PlatformTokenV2.sol";

/**
 * @title CommitToClaimPool
 * @dev Individual Commit-to-Claim pool contract where creator owns the ticket
 */
contract CommitToClaimPool is Ownable, ReentrancyGuard {
    IERC20 public immutable usdtToken;
    PlatformTokenV2 public immutable tlootToken;
    
    address public immutable factory;
    address public immutable admin;
    address public immutable poolCreator;
    
    // Pool details
    string public eventName;
    uint256 public eventDate;
    uint256 public ticketPrice;
    uint256 public upfrontAmount; // 20% of ticket price
    uint256 public remainingAmount; // 80% of ticket price
    uint256 public paymentDeadline;
    uint256 public createdAt;
    
    // Pool state
    bool public upfrontPaid;
    bool public remainingPaid;
    bool public isFinalized;
    bool public isCancelled;
    
    // Events
    event UpfrontPaid(address indexed creator, uint256 amount, uint256 tlootReward);
    event RemainingPaid(address indexed creator, uint256 amount);
    event PoolFinalized(uint256 totalAmount);
    event PoolCancelled(uint256 refundAmount);
    event AdminWithdrawal(uint256 amount);
    
    modifier onlyFactory() {
        require(msg.sender == factory, "Only factory");
        _;
    }
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }
    
    modifier onlyCreator() {
        require(msg.sender == poolCreator, "Only creator");
        _;
    }
    
    constructor(
        address _usdtToken,
        address _tlootToken,
        address _admin,
        address _creator,
        string memory _eventName,
        uint256 _eventDate,
        uint256 _ticketPrice,
        uint256 _paymentDeadline
    ) Ownable(msg.sender) {
        factory = msg.sender;
        admin = _admin;
        poolCreator = _creator;
        usdtToken = IERC20(_usdtToken);
        tlootToken = PlatformTokenV2(_tlootToken);
        
        eventName = _eventName;
        eventDate = _eventDate;
        ticketPrice = _ticketPrice;
        upfrontAmount = (_ticketPrice * 20) / 100; // 20%
        remainingAmount = ticketPrice - upfrontAmount; // 80%
        paymentDeadline = _paymentDeadline;
        createdAt = block.timestamp;
    }
    
    /**
     * @dev Pay upfront 20% commitment
     */
    function payUpfront() external onlyCreator nonReentrant {
        require(!isCancelled, "Pool cancelled");
        require(!upfrontPaid, "Already paid upfront");
        require(block.timestamp < paymentDeadline, "Payment deadline passed");
        
        // Transfer USDT from creator
        require(
            usdtToken.transferFrom(msg.sender, address(this), upfrontAmount),
            "USDT transfer failed"
        );
        
        upfrontPaid = true;
        
        // Mint TLOOT tokens as immediate reward (1:1 with contribution)
        uint256 tlootReward = upfrontAmount * 10**12; // Convert USDT (6 decimals) to TLOOT (18 decimals)
        tlootToken.mint(msg.sender, tlootReward, "Commit-to-claim upfront");
        
        emit UpfrontPaid(msg.sender, upfrontAmount, tlootReward);
    }
    
    /**
     * @dev Pay remaining 80% before deadline
     */
    function payRemaining() external onlyCreator nonReentrant {
        require(!isCancelled, "Pool cancelled");
        require(upfrontPaid, "Must pay upfront first");
        require(!remainingPaid, "Already paid remaining");
        require(block.timestamp < paymentDeadline, "Payment deadline passed");
        
        // Transfer USDT from creator
        require(
            usdtToken.transferFrom(msg.sender, address(this), remainingAmount),
            "USDT transfer failed"
        );
        
        remainingPaid = true;
        
        // Mint TLOOT tokens as immediate reward (1:1 with contribution)
        uint256 tlootReward = remainingAmount * 10**12; // Convert USDT (6 decimals) to TLOOT (18 decimals)
        tlootToken.mint(msg.sender, tlootReward, "Commit-to-claim completion");
        
        emit RemainingPaid(msg.sender, remainingAmount);
    }
    
    /**
     * @dev Finalize pool and transfer funds to admin (after full payment)
     */
    function finalizePool() external onlyAdmin {
        require(!isCancelled, "Pool cancelled");
        require(!isFinalized, "Already finalized");
        require(upfrontPaid && remainingPaid, "Payment not complete");
        
        isFinalized = true;
        
        // Transfer all USDT to admin (platform will handle ticket purchase and delivery)
        uint256 balance = usdtToken.balanceOf(address(this));
        require(usdtToken.transfer(admin, balance), "Transfer failed");
        
        emit PoolFinalized(balance);
    }
    
    /**
     * @dev Cancel pool if creator doesn't pay before deadline
     */
    function cancelPool() external onlyAdmin {
        require(!isFinalized, "Already finalized");
        require(block.timestamp >= paymentDeadline, "Deadline not reached");
        require(!remainingPaid, "Payment completed");
        
        isCancelled = true;
        
        // If upfront was paid, it stays with platform (penalty for not completing)
        // Admin can withdraw it
        
        emit PoolCancelled(upfrontPaid ? upfrontAmount : 0);
    }
    
    /**
     * @dev Refund upfront payment (only before deadline, if creator requests)
     */
    function refundUpfront() external onlyCreator nonReentrant {
        require(!isCancelled, "Pool cancelled");
        require(upfrontPaid, "No upfront payment");
        require(!remainingPaid, "Cannot refund after full payment");
        require(block.timestamp < paymentDeadline - 7 days, "Too close to deadline");
        
        uint256 refundAmount = upfrontAmount;
        upfrontPaid = false;
        isCancelled = true;
        
        require(usdtToken.transfer(msg.sender, refundAmount), "Refund failed");
        
        emit PoolCancelled(refundAmount);
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
    function getPaymentStatus() external view returns (
        bool _upfrontPaid,
        bool _remainingPaid,
        uint256 _upfrontAmount,
        uint256 _remainingAmount,
        uint256 _totalPaid
    ) {
        uint256 totalPaid = 0;
        if (upfrontPaid) totalPaid += upfrontAmount;
        if (remainingPaid) totalPaid += remainingAmount;
        
        return (
            upfrontPaid,
            remainingPaid,
            upfrontAmount,
            remainingAmount,
            totalPaid
        );
    }
    
    function getPoolInfo() external view returns (
        string memory _eventName,
        uint256 _eventDate,
        uint256 _ticketPrice,
        uint256 _paymentDeadline,
        address _creator,
        bool _upfrontPaid,
        bool _remainingPaid,
        bool _isFinalized,
        bool _isCancelled
    ) {
        return (
            eventName,
            eventDate,
            ticketPrice,
            paymentDeadline,
            poolCreator,
            upfrontPaid,
            remainingPaid,
            isFinalized,
            isCancelled
        );
    }
    
    function isPaymentComplete() external view returns (bool) {
        return upfrontPaid && remainingPaid;
    }
}
