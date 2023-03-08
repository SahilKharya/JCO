// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * -- #1 -- Deployed first 
 */
 
contract Treasury is Ownable{

    function approveOtherContract(IERC20 token, address _to_approve, uint _value) public onlyOwner {
        token.approve(_to_approve, _value * (10 ** 18));
    }
}