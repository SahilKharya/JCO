pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Treasury {

    function approveOtherContract(IERC20 token, address _to_approve, uint _value) public {
        token.approve(_to_approve, _value);
    }

}