// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title PlatformTokenV2
 * @dev Platform reward token with role-based minting (TLOOT)
 * Uses AccessControl instead of Ownable for flexible permission management
 */
contract PlatformTokenV2 is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    
    event TokensMinted(address indexed to, uint256 amount, string reason);
    event MinterAdded(address indexed account);
    event MinterRemoved(address indexed account);

    constructor() ERC20("TLOOT Token", "TLOOT") {
        // Grant roles to deployer
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        
        // Set ADMIN_ROLE as the admin of MINTER_ROLE
        // This allows ADMIN_ROLE holders to grant/revoke MINTER_ROLE
        _setRoleAdmin(MINTER_ROLE, ADMIN_ROLE);
        
        // Mint initial supply to deployer (10% of max supply for initial rewards)
        uint256 initialSupply = MAX_SUPPLY / 10;
        _mint(msg.sender, initialSupply);
        emit TokensMinted(msg.sender, initialSupply, "Initial supply");
    }

    /**
     * @dev Mint tokens to a single address
     * Can be called by any account with MINTER_ROLE
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     * @param reason Reason for minting (for tracking)
     */
    function mint(address to, uint256 amount, string memory reason) external onlyRole(MINTER_ROLE) {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        require(to != address(0), "Cannot mint to zero address");
        
        _mint(to, amount);
        emit TokensMinted(to, amount, reason);
    }

    /**
     * @dev Batch mint tokens to multiple addresses (gas efficient)
     * @param recipients Array of addresses to mint tokens to
     * @param amounts Array of amounts to mint to each address
     * @param reason Reason for minting (for tracking)
     */
    function batchMint(
        address[] calldata recipients,
        uint256[] calldata amounts,
        string memory reason
    ) external onlyRole(MINTER_ROLE) {
        require(recipients.length == amounts.length, "Array length mismatch");
        require(recipients.length > 0, "Empty arrays");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        
        require(totalSupply() + totalAmount <= MAX_SUPPLY, "Exceeds max supply");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Cannot mint to zero address");
            _mint(recipients[i], amounts[i]);
            emit TokensMinted(recipients[i], amounts[i], reason);
        }
    }

    /**
     * @dev Add minter role to an address (called by factory contracts)
     * @param account Address to grant minter role
     */
    function addMinter(address account) external onlyRole(ADMIN_ROLE) {
        require(account != address(0), "Cannot add zero address");
        grantRole(MINTER_ROLE, account);
        emit MinterAdded(account);
    }

    /**
     * @dev Remove minter role from an address
     * @param account Address to revoke minter role
     */
    function removeMinter(address account) external onlyRole(ADMIN_ROLE) {
        revokeRole(MINTER_ROLE, account);
        emit MinterRemoved(account);
    }

    /**
     * @dev Check if an address has minter role
     */
    function isMinter(address account) external view returns (bool) {
        return hasRole(MINTER_ROLE, account);
    }

    /**
     * @dev Get remaining mintable supply
     */
    function remainingSupply() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }
}
