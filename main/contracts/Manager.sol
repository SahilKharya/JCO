// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0 <0.9.0;

import "./JCO.sol";
import "./MultiSig_Treasury.sol";
import "./1_Fundraising.sol";
import "./2_Rewards.sol";
import "./3_Team.sol";
import "./4_Advisors.sol";
import "./5_Marketing.sol";
import "./6_Exchange.sol";
import "./7_Foundation.sol";
import "./8_Staking.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// 0x617F2E2fD72FD9D5503197092aC168c91465E7f2
contract JCO_Manager {
    address sender;
    address treasury;
    IERC20 private tokenContract;
    MultiSig_Treasury multi_treasuryContract;
    Fundraising fundContract;
    Rewards rewardsContract;
    Team teamContract;
    Advisors advisorContract;
    Marketing marketingContract;
    Exchange exchangeContract;
    Foundation foundationContract;
    Staking stakingContract;

    address[] public owners_TGW;
    address[] public owners_OW;
    mapping(address => bool) public isOwner_TGW;
    mapping(address => bool) public isOwner_OW;

    constructor(
        address _token,
        address _treasury,
        address payable _multi,
        address payable _funding,
        address payable _rewards,
        address payable _team,
        address payable _advisors,
        address payable _marketing,
        address payable _exchange,
        address payable _foundation,
        address payable _staking
    ) {
        sender = msg.sender;
        tokenContract = IERC20(_token);
        treasury = _treasury;

        multi_treasuryContract = MultiSig_Treasury(_multi);
        owners_TGW = getOwners_TGW();

        for (uint256 i = 0; i < owners_TGW.length; i++) {
            address owner = owners_TGW[i];

            require(owner != address(0), "invalid owner");
            require(!isOwner_TGW[owner], "owner not unique");

            isOwner_TGW[owner] = true;
        }

        fundContract = Fundraising(_funding);
        rewardsContract = Rewards(_rewards);
        teamContract = Team(_team);
        advisorContract = Advisors(_advisors);
        marketingContract = Marketing(_marketing);
        exchangeContract = Exchange(_exchange);
        foundationContract = Foundation(_foundation);
        stakingContract = Staking(_staking);
        owners_OW = getOwners_OW();

        for (uint256 i = 0; i < owners_OW.length; i++) {
            address owner = owners_OW[i];

            require(owner != address(0), "invalid owner");
            require(!isOwner_OW[owner], "owner not unique");

            isOwner_OW[owner] = true;
        }
    }

    // ****     ERC20 Contract Functions  *****

    // function buyNFT(uint256 price) external {
    //     tokenContract.transferFrom(msg.sender, msg.sender, price);
    // }

    // ****     Multi Sig Contract Functions  *****

    // TGW - Token Generation Wallet functions
    modifier onlyOwner_TGW() {
        require(isOwner_TGW[msg.sender], "not owner");
        _;
    }

    function getOwners_TGW() public view returns (address[] memory) {
        return multi_treasuryContract.getOwners();
    }

    // function submitTxn_TGW(
    //     address _to,
    //     uint256 _value,
    //     bytes memory _data
    // ) public onlyOwner_TGW {
    //     return multi_treasuryContract.submitTransaction(_to, _value, _data);
    // }

    function confirmTxn_TGW(address _beneficiary, uint256 _txIndex) public onlyOwner_TGW {
        return multi_treasuryContract.confirmTransaction(_beneficiary, _txIndex, msg.sender);
    }

    function executeTxn_TGW(address _beneficiary, uint256 _txIndex) public onlyOwner_TGW {
        return multi_treasuryContract.executeTransaction(_beneficiary, _txIndex, msg.sender);
    }

    function revokeConfirmation_TGW(address _beneficiary, uint256 _txIndex) public onlyOwner_TGW {
        return multi_treasuryContract.revokeConfirmation(_beneficiary, _txIndex, msg.sender);
    }

    function getTransactionCount_TGW(address _beneficiary) public view returns (uint256) {
        return multi_treasuryContract.getTransactionCount(_beneficiary);
    }

    function getVestingSchedule_TGW(address _beneficiary, uint256 _txIndex)
        public
        view
        returns (
            uint256 releaseTime,
            uint256 releaseAmount,
            bool released,
            uint256 numConfirmations
        )
    {
        return multi_treasuryContract.getVestingSchedule(_beneficiary, _txIndex);
    }

    // function addVestingSchedule(
    //     address beneficiary,
    //     uint256 releaseTime,
    //     uint256 releaseAmount
    // ) internal onlyOwner_TGW {
    //     // require(msg.sender == msg.owner, "Only owner can add vesting schedule");
    //     // IERC20 token = IERC20(tokenAddress);
    //     uint256 amount = releaseAmount * (10**18);
    //     require(
    //         tokenContract.balanceOf(treasury) >= amount,
    //         "Insufficient balance to add vesting schedule"
    //     );
    //     // require(token.transferFrom(treasury, address(this), amount), "Transfer failed");
    //     vestingSchedules[beneficiary].push(
    //         VestingSchedule(releaseTime, amount, false)
    //     );
    // }

    // function release(address beneficiary, uint256 index)
    //     external
    //     onlyOwner_TGW
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

    // function releaseFunds(address _beneficiary, uint256 index)
    //     public
    //     onlyOwner_TGW
    //     returns (bool)
    // {
    //     return multi_treasuryContract.release(_beneficiary, index);
    // }

    // Fundraising/ Seed-IDO Wallet functions

    // OP - Operation Wallets
    modifier onlyOwner_OW() {
        require(isOwner_OW[msg.sender], "not owner");
        _;
    }

    function getOwners_OW() public view returns (address[] memory) {
        return fundContract.getOwners();
    }

    function submitTxn_Fund(
        address _to,
        uint256 _value,
        bytes memory _data
    ) public onlyOwner_OW {
        return fundContract.submitTransaction(_to, _value, _data);
    }

    function confirmTxn_Fund(uint256 _txIndex) public onlyOwner_OW {
        return fundContract.confirmTransaction(_txIndex, msg.sender);
    }

    function executeTxn_Fund(uint256 _txIndex) public onlyOwner_OW {
        return fundContract.executeTransaction(_txIndex);
    }

    function revokeConfirmation_Fund(uint256 _txIndex) public onlyOwner_OW {
        return fundContract.revokeConfirmation(_txIndex, msg.sender);
    }

    function getTransactionCount_Fund() public view returns (uint256) {
        return fundContract.getTransactionCount();
    }

    function getTxn_Fund(uint256 _txIndex)
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
        return fundContract.getTransaction(_txIndex);
    }

    // Rewards Wallet functions

    function submitTxn_Rewards(
        address _to,
        uint256 _value,
        bytes memory _data
    ) public onlyOwner_OW {
        return rewardsContract.submitTransaction(_to, _value, _data);
    }

    function confirmTxn_Rewards(uint256 _txIndex) public onlyOwner_OW {
        return rewardsContract.confirmTransaction(_txIndex, msg.sender);
    }

    function executeTxn_Rewards(uint256 _txIndex) public onlyOwner_OW {
        return rewardsContract.executeTransaction(_txIndex);
    }

    function revokeConfirmation_Rewards(uint256 _txIndex) public onlyOwner_OW {
        return rewardsContract.revokeConfirmation(_txIndex, msg.sender);
    }

    function getTransactionCount_Rewards() public view returns (uint256) {
        return rewardsContract.getTransactionCount();
    }

    function getTxn_Rewards(uint256 _txIndex)
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
        return rewardsContract.getTransaction(_txIndex);
    }

    // Team Wallet functions

    function submitTxn_Team(
        address _to,
        uint256 _value,
        bytes memory _data
    ) public onlyOwner_OW {
        return teamContract.submitTransaction(_to, _value, _data);
    }

    function confirmTxn_Team(uint256 _txIndex) public onlyOwner_OW {
        return teamContract.confirmTransaction(_txIndex, msg.sender);
    }

    function executeTxn_Team(uint256 _txIndex) public onlyOwner_OW {
        return teamContract.executeTransaction(_txIndex);
    }

    function revokeConfirmation_Team(uint256 _txIndex) public onlyOwner_OW {
        return teamContract.revokeConfirmation(_txIndex, msg.sender);
    }

    function getTransactionCount_Team() public view returns (uint256) {
        return teamContract.getTransactionCount();
    }

    function getTxn_Team(uint256 _txIndex)
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
        return teamContract.getTransaction(_txIndex);
    }

    // Advisor Wallet functions

    function submitTxn_Advisor(
        address _to,
        uint256 _value,
        bytes memory _data
    ) public onlyOwner_OW {
        return advisorContract.submitTransaction(_to, _value, _data);
    }

    function confirmTxn_Advisor(uint256 _txIndex) public onlyOwner_OW {
        return advisorContract.confirmTransaction(_txIndex, msg.sender);
    }

    function executeTxn_Advisor(uint256 _txIndex) public onlyOwner_OW {
        return advisorContract.executeTransaction(_txIndex);
    }

    function revokeConfirmation_Advisor(uint256 _txIndex) public onlyOwner_OW {
        return advisorContract.revokeConfirmation(_txIndex, msg.sender);
    }

    function getTransactionCount_Advisor() public view returns (uint256) {
        return advisorContract.getTransactionCount();
    }

    function getTxn_Advisor(uint256 _txIndex)
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
        return advisorContract.getTransaction(_txIndex);
    }

    // Marketing Wallet functions

    function submitTxn_Marketing(
        address _to,
        uint256 _value,
        bytes memory _data
    ) public onlyOwner_OW {
        return marketingContract.submitTransaction(_to, _value, _data);
    }

    function confirmTxn_Marketing(uint256 _txIndex) public onlyOwner_OW {
        return marketingContract.confirmTransaction(_txIndex, msg.sender);
    }

    function executeTxn_Marketing(uint256 _txIndex) public onlyOwner_OW {
        return marketingContract.executeTransaction(_txIndex);
    }

    function revokeConfirmation_Marketing(uint256 _txIndex)
        public
        onlyOwner_OW
    {
        return marketingContract.revokeConfirmation(_txIndex, msg.sender);
    }

    function getTransactionCount_Marketing() public view returns (uint256) {
        return marketingContract.getTransactionCount();
    }

    function getTxn_Marketing(uint256 _txIndex)
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
        return marketingContract.getTransaction(_txIndex);
    }

    // Exchange Wallet functions

    function submitTxn_Exchange(
        address _to,
        uint256 _value,
        bytes memory _data
    ) public onlyOwner_OW {
        return exchangeContract.submitTransaction(_to, _value, _data);
    }

    function confirmTxn_Exchange(uint256 _txIndex) public onlyOwner_OW {
        return exchangeContract.confirmTransaction(_txIndex, msg.sender);
    }

    function executeTxn_Exchange(uint256 _txIndex) public onlyOwner_OW {
        return exchangeContract.executeTransaction(_txIndex);
    }

    function revokeConfirmation_Exchange(uint256 _txIndex) public onlyOwner_OW {
        return exchangeContract.revokeConfirmation(_txIndex, msg.sender);
    }

    function getTransactionCount_Exchange() public view returns (uint256) {
        return exchangeContract.getTransactionCount();
    }

    function getTxn_Exchange(uint256 _txIndex)
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
        return exchangeContract.getTransaction(_txIndex);
    }

    // Foundation Wallet functions

    function submitTxn_Foundation(
        address _to,
        uint256 _value,
        bytes memory _data
    ) public onlyOwner_OW {
        return foundationContract.submitTransaction(_to, _value, _data);
    }

    function confirmTxn_Foundation(uint256 _txIndex) public onlyOwner_OW {
        return foundationContract.confirmTransaction(_txIndex, msg.sender);
    }

    function executeTxn_Foundation(uint256 _txIndex) public onlyOwner_OW {
        return foundationContract.executeTransaction(_txIndex);
    }

    function revokeConfirmation_Foundation(uint256 _txIndex)
        public
        onlyOwner_OW
    {
        return foundationContract.revokeConfirmation(_txIndex, msg.sender);
    }

    function getTransactionCount_Foundation() public view returns (uint256) {
        return foundationContract.getTransactionCount();
    }

    function getTxn_Foundation(uint256 _txIndex)
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
        return foundationContract.getTransaction(_txIndex);
    }

    // Staking Wallet functions
    function submitTxn_Staking(
        address _to,
        uint256 _value,
        bytes memory _data
    ) public onlyOwner_OW {
        return stakingContract.submitTransaction(_to, _value, _data);
    }

    function confirmTxn_Staking(uint256 _txIndex) public onlyOwner_OW {
        return stakingContract.confirmTransaction(_txIndex, msg.sender);
    }

    function executeTxn_Staking(uint256 _txIndex) public onlyOwner_OW {
        return stakingContract.executeTransaction(_txIndex);
    }

    function revokeConfirmation_Staking(uint256 _txIndex) public onlyOwner_OW {
        return stakingContract.revokeConfirmation(_txIndex, msg.sender);
    }

    function getTransactionCount_Staking() public view returns (uint256) {
        return stakingContract.getTransactionCount();
    }

    function getTxn_Staking(uint256 _txIndex)
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
        return stakingContract.getTransaction(_txIndex);
    }

    function getsender() public view returns (address) {
        return msg.sender;
    }
}

// time -> adress array
// address -> amount to be transferred
