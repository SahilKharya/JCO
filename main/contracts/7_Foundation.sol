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
contract Foundation {
    IERC20 private token;
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

    constructor(
        address[] memory _owners,
        uint256 _numConfirmationsRequired,
        address _token
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
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value, address(this).balance);
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
        uint256 token_balance = token.balanceOf(address(this));
        require(amount <= token_balance, "token balance is low");

        address from = address(this);
        address to = transaction.to;

        // bool success = token.transferFrom(from, transaction.to, amount);
        // require(success, "tx failed");
        require(token.transfer(transaction.to, amount), "tx failed");
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
