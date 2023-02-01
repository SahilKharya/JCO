pragma solidity >=0.7.0 <0.9.0;

// import "./JCO.sol";
import "./JCO.sol";
import "./MultiSig.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract JCO_Manager {
    ERC20 token;
    MultiSigWallet sig;
    address owner;

    constructor(address _token, address payable multi){
        owner = msg.sender;
        sig = MultiSigWallet(multi);
    }

    function getOwners() public view returns (address[] memory) {
        return sig.getOwners();
    }
}