// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;
/**
 * @title Treasury MultiSignature Contract
 * @dev Will call the functions from the treasury
 * -- #3 -- Deployed after the token contract
 */

import "./JCO.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// ["0x5B38Da6a701c568545dCfcB03FcB875f56beddC4", "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2", "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db"]
contract MultiSig_Treasury {
    IERC20 private token;
    address treasury;
    event Transfer_JCO(address from, address to, uint256 amount);

    event Deposit(address indexed sender, uint256 amount, uint256 balance);
    event SubmitTransaction(
        address indexed owner,
        uint256 indexed txIndex,
        address indexed to,
        uint256 value,
        bytes data
    );
    event ConfirmTransaction(address indexed owner, uint256 indexed txIndex);
    event RevokeConfirmation(address indexed owner, uint256 indexed txIndex);
    event ExecuteTransaction(address indexed owner, uint256 indexed txIndex);

    address[] public owners;
    mapping(address => bool) public isOwner;
    uint256 public numConfirmationsRequired;

    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 numConfirmations;
    }

    // mapping from tx index => owner => bool
    mapping(uint256 => mapping(address => bool)) public isConfirmed;

    Transaction[] public transactions;

    modifier txExists(uint256 _txIndex) {
        require(_txIndex < transactions.length, "tx does not exist");
        _;
    }

    modifier notExecuted(uint256 _txIndex) {
        require(!transactions[_txIndex].executed, "tx already executed");
        _;
    }

    modifier notConfirmed(uint256 _txIndex, address msg_sender) {
        require(!isConfirmed[_txIndex][msg_sender], "tx already confirmed");
        _;
    }

    address public beneficiary;
    uint256 public releaseTime;
    uint256 public interval;
    uint256 public releasedIntervals;

    IERC20 public token;

    constructor(
        address _beneficiary,
        uint256 _releaseTime,
        uint256 _interval,
        address _token
    ) {
        require(
            _beneficiary != address(0),
            "TokenTimelock: beneficiary is the zero address"
        );
        require(
            _releaseTime > block.timestamp,
            "TokenTimelock: release time is before current time"
        );
        require(
            _interval > 0,
            "TokenTimelock: interval must be greater than 0"
        );

        beneficiary = _beneficiary;
        releaseTime = _releaseTime;
        interval = _interval;
        token = IERC20(_token);
    }

    uint256 public vesting_start_time;
    uint256 public releaseInterval;

    address[] public release1 = [];
    address[] public owners;

    constructor(
        address[] memory _owners,
        uint256 _numConfirmationsRequired,
        address _token,
        address _treasury
    ) {
        require(_owners.length > 0, "owners required");
        require(
            _numConfirmationsRequired > 0 &&
                _numConfirmationsRequired <= _owners.length,
            "invalid number of required confirmations"
        );

        for (uint256 i = 0; i < _owners.length; i++) {
            address owner = _owners[i];

            require(owner != address(0), "invalid owner");
            require(!isOwner[owner], "owner not unique");

            isOwner[owner] = true;
            owners.push(owner);
        }

        numConfirmationsRequired = _numConfirmationsRequired;
        token = IERC20(_token);
        treasury = _treasury;

        // Vesting values
        vesting_start_time = block.timestamp;
        vesting_start_time = block.timestamp;
        vesting_start_time = block.timestamp;
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }

    function release(address beneficiary) public {
        require(
            block.timestamp >= vestingStartTime,
            "Vesting period has not yet started"
        );
        require(
            balances[beneficiary] > 0,
            "Beneficiary does not have a balance"
        );
        require(
            !conditionsMet[beneficiary],
            "Beneficiary has already met the release conditions"
        );
        uint256 elapsed = block.timestamp - vestingStartTime;
        uint256 periods = elapsed / releaseInterval;
        uint256 tokensToRelease = (((totalTokens * releasePercentage) / 100) *
            periods) / ((vestingDuration / releaseInterval) + 1);
        uint256 tokensReleased = tokensToRelease -
            ((balances[beneficiary] * lastReleased[beneficiary]) / totalTokens);
        require(tokensReleased > 0, "No tokens to release");
        lastReleased[beneficiary] = tokensToRelease;
        conditionsMet[beneficiary] = true;
        // transfer tokens to beneficiary
        // require(token.transfer(beneficiary, tokensReleased), "Token transfer failed");
    }

    function submitTransaction(
        address _to,
        uint256 _value,
        bytes memory _data
    ) public {
        uint256 txIndex = transactions.length;

        transactions.push(
            Transaction({
                to: _to,
                value: _value,
                data: _data,
                executed: false,
                numConfirmations: 0
            })
        );

        emit SubmitTransaction(msg.sender, txIndex, _to, _value, _data);
    }

    function confirmTransaction(uint256 _txIndex, address msg_sender)
        public
        txExists(_txIndex)
        notExecuted(_txIndex)
        notConfirmed(_txIndex, msg_sender)
    {
        Transaction storage transaction = transactions[_txIndex];
        transaction.numConfirmations += 1;
        isConfirmed[_txIndex][msg_sender] = true;

        emit ConfirmTransaction(msg_sender, _txIndex);
    }

    function executeTransaction(uint256 _txIndex)
        public
        txExists(_txIndex)
        notExecuted(_txIndex)
    {
        Transaction storage transaction = transactions[_txIndex];

        require(
            transaction.numConfirmations >= numConfirmationsRequired,
            "cannot execute tx"
        );
        uint256 amount = transaction.value * (10**18);
        uint256 token_balance = token.balanceOf(treasury);
        require(amount <= token_balance, "token balance is low");

        address from = treasury;
        address to = transaction.to;

        // bool success = token.transferFrom(from, transaction.to, amount);
        // require(success, "tx failed");
        require(token.transferFrom(from, transaction.to, amount), "tx failed");
        transaction.executed = true;

        emit Transfer_JCO(from, to, amount);
        emit ExecuteTransaction(msg.sender, _txIndex);
    }

    function revokeConfirmation(uint256 _txIndex, address msg_sender)
        public
        txExists(_txIndex)
        notExecuted(_txIndex)
    {
        Transaction storage transaction = transactions[_txIndex];

        require(isConfirmed[_txIndex][msg_sender], "tx not confirmed");

        transaction.numConfirmations -= 1;
        isConfirmed[_txIndex][msg_sender] = false;

        emit RevokeConfirmation(msg_sender, _txIndex);
    }

    function getOwners() public view returns (address[] memory) {
        return owners;
    }

    function getTransactionCount() public view returns (uint256) {
        return transactions.length;
    }

    function getTransaction(uint256 _txIndex)
        public
        view
        returns (
            address to,
            uint256 value,
            bytes memory data,
            bool executed,
            uint256 numConfirmations
        )
    {
        Transaction storage transaction = transactions[_txIndex];

        return (
            transaction.to,
            transaction.value,
            transaction.data,
            transaction.executed,
            transaction.numConfirmations
        );
    }
}
