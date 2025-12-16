// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSDT
 * @dev Mock USDT token for hackathon testing (6 decimals like real USDT)
 */
contract MockUSDT is ERC20, Ownable {
    uint8 private constant _decimals = 6; // USDT uses 6 decimals
    
    constructor() ERC20("Mock Tether USD", "USDT") Ownable(msg.sender) {
        // Mint 1 million USDT to deployer for testing
        _mint(msg.sender, 1_000_000 * 10**_decimals);
    }
    
    function decimals() public pure override returns (uint8) {
        return _decimals;
    }
    
    /**
     * @dev Faucet function - anyone can mint 1000 USDT for testing
     */
    function faucet() external {
        _mint(msg.sender, 1000 * 10**_decimals);
    }
    
    /**
     * @dev Mint tokens (only owner for initial distribution)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
