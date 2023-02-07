// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0 <0.9.0;

import "./JCO.sol";
import "./MultiSig_Treasury.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// 0x617F2E2fD72FD9D5503197092aC168c91465E7f2
contract JCO_Manager {
    IERC20 tokenContract;
    MultiSig_Treasury signContract;
    address sender;
    address[] public owners;
    mapping(address => bool) public isOwner;

    constructor(address _token, address payable multi) {
        sender = msg.sender;
        signContract = MultiSig_Treasury(multi);
        tokenContract = IERC20(_token);
        owners = getOwners();

        for (uint256 i = 0; i < owners.length; i++) {
            address owner = owners[i];

            require(owner != address(0), "invalid owner");
            require(!isOwner[owner], "owner not unique");

            isOwner[owner] = true;
        }
    }

    // ****     ERC20 Contract Functions  *****

    function buyNFT(uint256 price) external {
        tokenContract.transferFrom(msg.sender, msg.sender, price);
    }

    // ****     Multi Sig Contract Functions  *****

    // TGW - Token Generation Wallet functions
    modifier onlyOwner() {
        require(isOwner[msg.sender], "not owner");
        _;
    }

    function getOwners() public view returns (address[] memory) {
        return signContract.getOwners();
    }

    function Owner() public view returns (bool) {
        return isOwner[0x5B38Da6a701c568545dCfcB03FcB875f56beddC4];
    }

    function submitTxn__TGW(
        address _to,
        uint256 _value,
        bytes memory _data
    ) public onlyOwner {
        return signContract.submitTransaction(_to, _value, _data);
    }

    function confirmTxn_TGW(uint256 _txIndex) public onlyOwner {
        return signContract.confirmTransaction(_txIndex, msg.sender);
    }

    function executeTxn_TGW(uint256 _txIndex) public onlyOwner {
        return signContract.executeTransaction(_txIndex);
    }

    function revokeConfirmation_TGW(uint256 _txIndex) public onlyOwner {
        return signContract.revokeConfirmation(_txIndex, msg.sender);
    }

    function getTransactionCount_TGW() public view returns (uint256) {
        return signContract.getTransactionCount();
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
        return signContract.getTransaction(_txIndex);
    }

    function getsender()
        public
        view
        returns (address)
    {
        return msg.sender;
    }
}
