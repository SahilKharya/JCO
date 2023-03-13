// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;
/**
 * @title Treasury MultiSignature Contract
 * @dev Will call the functions from the treasury
 * -- #3 -- Deployed after the token contract
 */

import "./JCO.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// ["0xf8e81D47203A594245E36C48e151709F0C19fBe8", "0xD7ACd2a9FD159E69Bb102A1ca21C9a3e3A5F771B","0x7EF2e0048f5bAeDe046f6BF797943daF4ED8CB47","0xDA0bab807633f07f013f94DD0E6A4F96F8742B53","0x358AA13c52544ECCEF6B0ADD0f801012ADAD5eE3","0x9D7f74d0C41E726EC95884E0e97Fa6129e3b5E99","0x9D7f74d0C41E726EC95884E0e97Fa6129e3b5E99","0xddaAd340b0f1Ef65169Ae5E41A8b10776a75482d"]

// ["0x5B38Da6a701c568545dCfcB03FcB875f56beddC4", "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2", "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db"]
contract MultiSig_Treasury {
    IERC20 private token;
    address treasury;
    address public manager;

    event Transfer_JCO(address from, address to, uint256 amount);
    event Deposit(address indexed sender, uint256 amount, uint256 balance);
    event ConfirmTransaction(address indexed owner, uint256 indexed txIndex);
    event RevokeConfirmation(address indexed owner, uint256 indexed txIndex);
    event ExecuteTransaction(address indexed owner, uint256 indexed txIndex);

    address[] owners;
    mapping(address => bool) isOwner;
    uint256 numConfirmationsRequired;

    struct VestingSchedule {
        uint256 releaseTime;
        uint256 releaseAmount;
        bool released;
        uint256 numConfirmations;
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
    mapping(address => mapping(uint256 => mapping(address => bool)))
        public isConfirmed;

    mapping(address => VestingSchedule[]) vestingSchedules;

    modifier txExists(address _beneficiary, uint256 _txIndex) {
        require(
            _txIndex < vestingSchedules[_beneficiary].length,
            "tx does not exist"
        );
        _;
    }

    modifier notExecuted(address _beneficiary, uint256 _txIndex) {
        require(
            !vestingSchedules[_beneficiary][_txIndex].released,
            "tx already executed"
        );
        _;
    }

    modifier notConfirmed(
        address _beneficiary,
        uint256 _txIndex,
        address msg_sender
    ) {
        require(
            !isConfirmed[_beneficiary][_txIndex][msg_sender],
            "tx already confirmed"
        );
        _;
    }
    modifier onlyManager() {
        require(msg.sender == manager, "Not owner");
        _;
    }
    struct Wallets {
        address payable _funding;
        address payable _rewards;
        address payable _team;
        address payable _advisors;
        address payable _marketing;
        address payable _exchange;
        address payable _foundation;
        address payable _staking;
    }

    constructor(
        address[] memory _owners,
        uint256 _numConfirmationsRequired,
        address _token,
        address _treasury,
        address _manager,
        Wallets memory _wallets
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
        manager = _manager;
        Time memory time;

        // Timestamps

        // For testing with shorter time
        time.current_time = block.timestamp;
        time.month3 = block.timestamp + 90 days;
        time.month6 = block.timestamp + 182 days;
        time.month9 = block.timestamp + 273 days;
        time.month12 = block.timestamp + 365 days;
        time.month15 = block.timestamp + 456 days;
        time.month18 = block.timestamp + 547 days;
        time.month24 = block.timestamp + 730 days;
        time.month36 = block.timestamp + 1095 days;

        // function addVestingSchedule(address beneficiary, uint256 releaseTime, uint256 releaseAmount) external{
        addVestingSchedule(_wallets._funding, time.current_time, 5960000);
        addVestingSchedule(_wallets._funding, time.month3, 3960000);
        addVestingSchedule(_wallets._funding, time.month6, 5710000);
        addVestingSchedule(_wallets._funding, time.month9, 5710000);
        addVestingSchedule(_wallets._funding, time.month12, 3960000);
        addVestingSchedule(_wallets._funding, time.month15, 5710000);
        addVestingSchedule(_wallets._funding, time.month18, 4390000);

        addVestingSchedule(_wallets._rewards, time.current_time, 1150000);
        addVestingSchedule(_wallets._rewards, time.month3, 1150000);
        addVestingSchedule(_wallets._rewards, time.month6, 1150000);
        addVestingSchedule(_wallets._rewards, time.month9, 1150000);

        addVestingSchedule(_wallets._team, time.month12, 6000000);
        addVestingSchedule(_wallets._team, time.month18, 6000000);
        addVestingSchedule(_wallets._team, time.month24, 8000000);

        addVestingSchedule(_wallets._advisors, time.month12, 5000000);
        addVestingSchedule(_wallets._advisors, time.month24, 5000000);
        addVestingSchedule(_wallets._advisors, time.month36, 2500000);

        addVestingSchedule(_wallets._marketing, time.current_time, 15000000);
        addVestingSchedule(_wallets._marketing, time.month6, 15000000);
        addVestingSchedule(_wallets._marketing, time.month18, 12500000);

        addVestingSchedule(_wallets._staking, time.current_time, 12500000);
        addVestingSchedule(_wallets._staking, time.month3, 12500000);
        addVestingSchedule(_wallets._staking, time.month6, 12500000);
        addVestingSchedule(_wallets._staking, time.month9, 12500000);
        addVestingSchedule(_wallets._staking, time.month12, 12500000);
        addVestingSchedule(_wallets._staking, time.month18, 12500000);
        addVestingSchedule(_wallets._staking, time.month24, 12500000);

        addVestingSchedule(_wallets._exchange, time.current_time, 25000000);

        addVestingSchedule(_wallets._foundation, time.month6, 7500000);
        addVestingSchedule(_wallets._foundation, time.month12, 7500000);
        addVestingSchedule(_wallets._foundation, time.month18, 7500000);
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }

    function addVestingSchedule(
        address beneficiary,
        uint256 releaseTime,
        uint256 releaseAmount
    ) internal {
        // require(msg.sender == msg.owner, "Only owner can add vesting schedule");
        // IERC20 token = IERC20(tokenAddress);
        uint256 amount = releaseAmount * (10**18);
        require(
            token.balanceOf(treasury) >= amount,
            "Insufficient balance to add vesting schedule"
        );
        // require(token.transferFrom(treasury, address(this), amount), "Transfer failed");
        vestingSchedules[beneficiary].push(
            VestingSchedule(releaseTime, amount, false, 0)
        );
    }

    function confirmTransaction(
        address _beneficiary,
        uint256 _txIndex,
        address msg_sender
    )
        external onlyManager
        txExists(_beneficiary, _txIndex)
        notExecuted(_beneficiary, _txIndex)
        notConfirmed(_beneficiary, _txIndex, msg_sender)
    {
        VestingSchedule storage schedule = vestingSchedules[_beneficiary][
            _txIndex
        ];

        require(
            block.timestamp >= schedule.releaseTime,
            "Release time not reached"
        );
        // Transaction storage transaction = transactions[_txIndex];
        schedule.numConfirmations += 1;
        isConfirmed[_beneficiary][_txIndex][msg_sender] = true;
        emit ConfirmTransaction(msg_sender, _txIndex);
    }

    function executeTransaction(
        address _beneficiary,
        uint256 _txIndex,
        address msg_sender
    )
        external onlyManager
        txExists(_beneficiary, _txIndex)
        notExecuted(_beneficiary, _txIndex)
    {
        VestingSchedule storage schedule = vestingSchedules[_beneficiary][
            _txIndex
        ];

        // Transaction storage transaction = transactions[_txIndex];

        require(
            schedule.numConfirmations >= numConfirmationsRequired,
            "cannot execute tx"
        );
        uint256 amount = schedule.releaseAmount;
        uint256 token_balance = token.balanceOf(treasury);
        require(amount <= token_balance, "token balance is low");

        address from = treasury;
        address to = _beneficiary;

        // bool success = token.transferFrom(from, transaction.to, amount);
        // require(success, "tx failed");
        require(token.transferFrom(from, to, amount), "tx failed");
        schedule.released = true;

        emit Transfer_JCO(from, to, amount);
        emit ExecuteTransaction(msg_sender, _txIndex);
    }

    function revokeConfirmation(
        address _beneficiary,
        uint256 _txIndex,
        address msg_sender
    )
        external onlyManager
        txExists(_beneficiary, _txIndex)
        notExecuted(_beneficiary, _txIndex)
    {
        VestingSchedule storage schedule = vestingSchedules[_beneficiary][
            _txIndex
        ];
        // Transaction storage transaction = transactions[_txIndex];

        require(
            isConfirmed[_beneficiary][_txIndex][msg_sender],
            "tx not confirmed"
        );

        schedule.numConfirmations += 1;
        isConfirmed[_beneficiary][_txIndex][msg_sender] = false;
        emit RevokeConfirmation(msg_sender, _txIndex);
    }

    function getOwners() onlyManager external view returns (address[] memory) {
        return owners;
    }

    function getTransactionCount(address _beneficiary)
        external
        view onlyManager
        returns (uint256)
    {
        return vestingSchedules[_beneficiary].length;
    }

    function getVestingSchedule(address _beneficiary, uint256 _txIndex)
        external onlyManager
        view
        returns (
            uint256 releaseTime,
            uint256 releaseAmount,
            bool released,
            uint256 numConfirmations
        )
    {
        VestingSchedule storage schedule = vestingSchedules[_beneficiary][
            _txIndex
        ];
        // Transaction storage transaction = transactions[_txIndex];

        return (
            schedule.releaseTime,
            schedule.releaseAmount / 10**18,
            schedule.released,
            schedule.numConfirmations
        );
    }
}
