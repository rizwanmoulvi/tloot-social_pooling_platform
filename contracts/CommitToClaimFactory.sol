// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./CommitToClaimPool.sol";
import "./PlatformTokenV2.sol";

/**
 * @title CommitToClaimFactory
 * @dev Factory contract for deploying individual Commit-to-Claim pool contracts
 */
contract CommitToClaimFactory {
    address public immutable usdtToken;
    address public immutable tlootToken;
    address public admin;
    
    address[] public allPools;
    mapping(address => address[]) public userCreatedPools;
    mapping(address => bool) public isPool;
    
    event PoolCreated(
        address indexed poolAddress,
        address indexed creator,
        string eventName,
        uint256 ticketPrice,
        uint256 paymentDeadline
    );
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }
    
    constructor(
        address _usdtToken,
        address _tlootToken,
        address _admin
    ) {
        usdtToken = _usdtToken;
        tlootToken = _tlootToken;
        admin = _admin;
    }
    
    /**
     * @dev Create a new Commit-to-Claim pool
     */
    function createPool(
        address creator,
        string memory eventName,
        uint256 eventDate,
        uint256 ticketPrice,
        uint256 paymentDeadline
    ) external returns (address) {
        // Deploy new pool contract
        CommitToClaimPool pool = new CommitToClaimPool(
            usdtToken,
            tlootToken,
            admin,
            creator,
            eventName,
            eventDate,
            ticketPrice,
            paymentDeadline
        );
        
        address poolAddress = address(pool);
        
        // Grant MINTER_ROLE to the pool so it can mint TLOOT rewards
        PlatformTokenV2 tloot = PlatformTokenV2(tlootToken);
        bytes32 MINTER_ROLE = tloot.MINTER_ROLE();
        tloot.grantRole(MINTER_ROLE, poolAddress);
        
        // Register pool
        allPools.push(poolAddress);
        userCreatedPools[creator].push(poolAddress);
        isPool[poolAddress] = true;
        
        emit PoolCreated(
            poolAddress,
            creator,
            eventName,
            ticketPrice,
            paymentDeadline
        );
        
        return poolAddress;
    }
    
    /**
     * @dev Update admin address
     */
    function setAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid address");
        admin = newAdmin;
    }
    
    // View functions
    function getAllPools() external view returns (address[] memory) {
        return allPools;
    }
    
    function getUserCreatedPools(address user) external view returns (address[] memory) {
        return userCreatedPools[user];
    }
    
    function getPoolCount() external view returns (uint256) {
        return allPools.length;
    }
}
