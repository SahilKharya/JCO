// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title JCO Token
 * @dev JennyCO ERC20 standard token contract
 * -- #2 -- To be deployed after the treasury contract
 */

/**
 * Pass three arguments while deploying
 */
contract JCO is ERC20 {
    constructor(address _treasury, string memory tokenName, string memory tokenSymbol) ERC20(tokenName, tokenSymbol) {
        _mint(_treasury, 250000000 * (10 ** uint256(decimals())));
    }
}
