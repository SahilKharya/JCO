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
    struct VestingSchedule {
        uint256 releaseTime;
        uint256 releaseAmount;
        bool released;
    }
    struct OperationalWallets {
        address payable _funding;
        address payable _rewards;
        address payable _team;
        address payable _advisors;
        address payable _marketing;
        address payable _exchange;
        address payable _foundation;
        address payable _staking;
    }
    struct Time {
        uint256 current_time;
        uint256 month3;
        uint256 month6;
        uint256 month9;
        uint256 month12;
        uint256 month15;
        uint256 month18;
        uint256 month24;
        uint256 month36;
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
        
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }

    function submitTransaction(
        address _to,
        uint256 _value,
        bytes memory _data
    ) external {
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
        external
        txExists(_txIndex)
        notExecuted(_txIndex)
        notConfirmed(_txIndex, msg_sender)
    {
        Transaction storage transaction = transactions[_txIndex];
        transaction.numConfirmations += 1;
        isConfirmed[_txIndex][msg_sender] = true;

        emit ConfirmTransaction(msg_sender, _txIndex);
    }

    // function release(address beneficiary, uint256 index)
    //     external
    //     returns (bool)
    // {
    //     // require(msg.sender == owner, "Only owner can release tokens");
    //     // IERC20 token = IERC20(tokenAddress);
    //     uint256 numSchedules = vestingSchedules[beneficiary].length;
    //     require(index < numSchedules, "Invalid index");
    //     VestingSchedule storage schedule = vestingSchedules[beneficiary][index];
    //     require(!schedule.released, "Tokens already released");
    //     require(
    //         block.timestamp >= schedule.releaseTime,
    //         "Release time not reached"
    //     );
    //     require(
    //         tokenContract.transferFrom(
    //             treasury,
    //             beneficiary,
    //             schedule.releaseAmount
    //         ),
    //         "Transfer failed"
    //     );
    //     schedule.released = true;
    //     return true;
    // }
    function executeTransaction(uint256 _txIndex)
        external
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
        external
        txExists(_txIndex)
        notExecuted(_txIndex)
    {
        Transaction storage transaction = transactions[_txIndex];

        require(isConfirmed[_txIndex][msg_sender], "tx not confirmed");

        transaction.numConfirmations -= 1;
        isConfirmed[_txIndex][msg_sender] = false;

        emit RevokeConfirmation(msg_sender, _txIndex);
    }

    function getOwners() external view returns (address[] memory) {
        return owners;
    }

    function getTransactionCount() external view returns (uint256) {
        return transactions.length;
    }

    function getTransaction(uint256 _txIndex)
        external
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
