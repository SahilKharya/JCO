// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title SampleERC20
 * @dev Create a sample ERC20 standard token
 */
contract JCO is ERC20 {
    constructor(string memory tokenName, string memory tokenSymbol) ERC20(tokenName, tokenSymbol) {
        _mint(msg.sender, 250000000 * (10 ** uint256(decimals())));
    }
}

//jco: 0x1b272bed337C479872E35A715dDb1745d9dC5000

// user: 0xEFDde7da96fA5F491AfEB6F3Cc60b72F2B831804