// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./LuckyDrawPool.sol";
import "./PlatformTokenV2.sol";

/**
 * @title LuckyDrawFactory
 * @dev Factory contract for deploying individual Lucky Draw pool contracts
 */
contract LuckyDrawFactory {
    address public immutable usdtToken;
    address public immutable tlootToken;
    address public immutable supraRouter;
    address public admin;
    
    address[] public allPools;
    mapping(address => address[]) public userCreatedPools;
    mapping(address => bool) public isPool;
    
    event PoolCreated(
        address indexed poolAddress,
        address indexed creator,
        string eventName,
        uint256 ticketPrice,
        uint256 entryAmount,
        uint256 maxParticipants
    );
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }
    
    constructor(
        address _usdtToken,
        address _tlootToken,
        address _supraRouter,
        address _admin
    ) {
        usdtToken = _usdtToken;
        tlootToken = _tlootToken;
        supraRouter = _supraRouter;
        admin = _admin;
    }
    
    /**
     * @dev Create a new Lucky Draw pool
     */
    function createPool(
        address creator,
        string memory eventName,
        uint256 eventDate,
        uint256 ticketPrice,
        uint256 entryAmount,
        uint256 maxParticipants,
        uint256 poolDeadline
    ) external returns (address) {
        // Deploy new pool contract
        LuckyDrawPool pool = new LuckyDrawPool(
            usdtToken,
            tlootToken,
            supraRouter,
            admin,
            eventName,
            eventDate,
            ticketPrice,
            entryAmount,
            maxParticipants,
            poolDeadline
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
            entryAmount,
            maxParticipants
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
