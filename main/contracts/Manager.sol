// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0 <0.9.0;

import "./JCO.sol";
import "./MultiSig_Treasury.sol";
import "./1_Fundraising.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// 0x617F2E2fD72FD9D5503197092aC168c91465E7f2
contract JCO_Manager {
    address sender;
    IERC20 tokenContract;
    MultiSig_Treasury treasuryContract;
    Fundraising fundContract;
    address[] public owners_TGW;
    address[] public owners_Fund;
    mapping(address => bool) public isOwner_TGW;
    mapping(address => bool) public isOwner_Fund;

    constructor(address _token, address payable multi, address payable funding) {
        sender = msg.sender;
        tokenContract = IERC20(_token);

        treasuryContract = MultiSig_Treasury(multi);
        owners_TGW = getOwners_TGW();

        for (uint256 i = 0; i < owners_TGW.length; i++) {
            address owner = owners_TGW[i];

            require(owner != address(0), "invalid owner");
            require(!isOwner_TGW[owner], "owner not unique");

            isOwner_TGW[owner] = true;
        }

        fundContract = Fundraising(funding);
        owners_Fund = getOwners_Fund();

        for (uint256 i = 0; i < owners_Fund.length; i++) {
            address owner = owners_Fund[i];

            require(owner != address(0), "invalid owner");
            require(!isOwner_Fund[owner], "owner not unique");

            isOwner_Fund[owner] = true;
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
        return treasuryContract.getOwners();
    }

    function submitTxn__TGW(
        address _to,
        uint256 _value,
        bytes memory _data
    ) public onlyOwner_TGW {
        return treasuryContract.submitTransaction(_to, _value, _data);
    }

    function confirmTxn_TGW(uint256 _txIndex) public onlyOwner_TGW {
        return treasuryContract.confirmTransaction(_txIndex, msg.sender);
    }

    function executeTxn_TGW(uint256 _txIndex) public onlyOwner_TGW {
        return treasuryContract.executeTransaction(_txIndex);
    }

    function revokeConfirmation_TGW(uint256 _txIndex) public onlyOwner_TGW {
        return treasuryContract.revokeConfirmation(_txIndex, msg.sender);
    }

    function getTransactionCount_TGW() public view returns (uint256) {
        return treasuryContract.getTransactionCount();
    }

    function getTxn_TGW(uint256 _txIndex)
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
        return treasuryContract.getTransaction(_txIndex);
    }


    // Fundraising Wallet functions

    modifier onlyOwner_Fund() {
        require(isOwner_Fund[msg.sender], "not owner");
        _;
    }

    function getOwners_Fund() public view returns (address[] memory) {
        return fundContract.getOwners();
    }

    function submitTxn__Fund(
        address _to,
        uint256 _value,
        bytes memory _data
    ) public onlyOwner_Fund {
        return fundContract.submitTransaction(_to, _value, _data);
    }

    function confirmTxn_Fund(uint256 _txIndex) public onlyOwner_Fund {
        return fundContract.confirmTransaction(_txIndex, msg.sender);
    }

    function executeTxn_Fund(uint256 _txIndex) public onlyOwner_Fund {
        return fundContract.executeTransaction(_txIndex);
    }

    function revokeConfirmation_Fund(uint256 _txIndex) public onlyOwner_Fund {
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



    function getsender()
        public
        view
        returns (address)
    {
        return msg.sender;
    }
}
