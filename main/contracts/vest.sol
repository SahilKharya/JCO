// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract TwistedVesting {
    address public tokenAddress;
    uint256 public totalTokens;
    uint256 public vestingStartTime;
    uint256 public vestingDuration;
    uint256 public releasePercentage;
    uint256 public releaseInterval;
    mapping (address => uint256) public balances;
    mapping (address => uint256) public lastReleased;
    mapping (address => bool) public conditionsMet;
    
    constructor(
        address _tokenAddress,
        uint256 _totalTokens,
        uint256 _vestingStartTime,
        uint256 _vestingDuration,
        uint256 _releasePercentage,
        uint256 _releaseInterval
    ) {
        require(_vestingStartTime > block.timestamp, "Vesting start time must be in the future");
        require(_releasePercentage > 0 && _releasePercentage <= 100, "Release percentage must be between 1 and 100");
        tokenAddress = _tokenAddress;
        totalTokens = _totalTokens;
        vestingStartTime = _vestingStartTime;
        vestingDuration = _vestingDuration;
        releasePercentage = _releasePercentage;
        releaseInterval = _releaseInterval;
    }
    
    function deposit(address beneficiary, uint256 amount) public {
        require(msg.sender == tokenAddress, "Only the token contract can call this function");
        require(balances[beneficiary] == 0, "Beneficiary already has a balance");
        balances[beneficiary] = amount;
    }
    
    function release(address beneficiary) public {
        require(block.timestamp >= vestingStartTime, "Vesting period has not yet started");
        require(balances[beneficiary] > 0, "Beneficiary does not have a balance");
        require(!conditionsMet[beneficiary], "Beneficiary has already met the release conditions");
        uint256 elapsed = block.timestamp - vestingStartTime;
        uint256 periods = elapsed / releaseInterval;
        uint256 tokensToRelease = (totalTokens * releasePercentage / 100) * periods / ((vestingDuration / releaseInterval) + 1);
        uint256 tokensReleased = tokensToRelease - (balances[beneficiary] * lastReleased[beneficiary] / totalTokens);
        require(tokensReleased > 0, "No tokens to release");
        lastReleased[beneficiary] = tokensToRelease;
        conditionsMet[beneficiary] = true;
        // transfer tokens to beneficiary
        // require(token.transfer(beneficiary, tokensReleased), "Token transfer failed");
    }
    
    function checkCondition(address beneficiary) public {
        // check if beneficiary meets the condition for releasing tokens
        // if so, set conditionsMet[beneficiary] to true
    }
}