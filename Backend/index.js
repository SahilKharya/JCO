const express = require('express');
const app = express();
// const abi = require('./abi/JCO_Manager.js');
const asyncHandler = require('express-async-handler');
const { check, validationResult } = require('express-validator');

const bodyParser = require("body-parser");
app.use(bodyParser.json());

const { ethers } = require('ethers');
require('dotenv').config()

const port = process.env.PORT || 3001;


// Create a new web3 instance
let web3Provider;

// // Check if a web3 instance is already available in the window object
// if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
//     // Use the web3 instance provided by the window object
// web3Provider = new ethers.providers.Web3Provider(window.ethereum)
// web3Provider = new AlchemyProvider("maticmum", apiKey);


// const loadWeb3 = () => {
//     provider = new ethers.providers.Web3Provider(window.ethereum)
//     window.ethereum.enable()
//     signer = provider.getSigner()

//     console.log('signer', signer);
// }


// } else {
// Connect to a local node or any other provider
web3Provider = new ethers.providers.JsonRpcProvider(process.env.API_URL);
// }

const signer = new ethers.Wallet(process.env.PRIVATE_KEY, web3Provider);
// const signer = wallet.provider.getSigner(wallet.address);
console.log(signer.getAddress())
const user_address = signer.getAddress();

const signer2 = new ethers.Wallet(process.env.PRIVATE_KEY2, web3Provider);
console.log(signer2.getAddress())

const signer3 = new ethers.Wallet(process.env.PRIVATE_KEY3, web3Provider);
console.log(signer3.getAddress())

const signer4 = new ethers.Wallet(process.env.PRIVATE_KEY4, web3Provider);
console.log(signer4.getAddress())
// Set up contract instance
const JCO_Address = process.env.JCO_CONTRACT;
const managerContractAddress = process.env.MANAGER_CONTRACT;
const manager = require("../main/artifacts/contracts/Manager.sol/JCO_Manager.json");
const managerContract = new ethers.Contract(managerContractAddress, manager.abi, signer);

const treasuryContractAddress = process.env.TREASURY_CONTRACT;
const treasury = require("../main/artifacts/contracts/Treasury.sol/Treasury.json");
const treasuryContract = new ethers.Contract(treasuryContractAddress, treasury.abi, signer);

const multiTreasuryContractAddress = process.env.MULTI_CONTRACT;
const multiTreasury = require("../main/artifacts/contracts/Treasury.sol/Treasury.json");
const multiTreasuryContract = new ethers.Contract(multiTreasuryContractAddress, multiTreasury.abi, signer);

// signer.getAddress().then((add) => {
//     console.log(add)
// })


web3Provider.getNetwork().then((network) => {
    if (network.chainId == 137) {
        console.log('Connected to Polygon network');
    } else if (network.chainId == 80001) {
        console.log('Connected to Polygon Mumbai Network');
    } else {
        console.log('Connected to a different network');
    }
}).catch((error) => {
    console.log('Error getting network ID:', error);
});

// Checking matic balance
app.get('/balance/:address', async (req, res) => {
    const { address } = req.params;

    try {
        const balance = await web3Provider.getBalance(address);
        res.json({ balance: ethers.utils.formatEther(balance) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Approve multiSig treasury balance
app.post('/approve', asyncHandler(async (req, res, next) => {
    // Approve the transfer of tokens from your account to another address
    const amount = req.body.approve_amount;
    const spenderAddress = req.body.multi_address
    try {
        const tx = await treasuryContract.approveOtherContract(JCO_Address, spenderAddress, amount);
        // Wait for the transaction to be confirmed
        await tx.wait();
        console.log(tx)
        res.status(200).json({ message: "Transaction Successful" });
    } catch (error) {
        // Use a centralized error handler to handle errors
        next(error);
    }
}));

// Calling manager addWallets function
app.post('/addWallets', asyncHandler(async (req, res, next) => {
    // Approve the transfer of tokens from your account to another address

    try {
        const tx = await managerContract.addWallets(process.env.TREASURY_CONTRACT, process.env.MULTI_CONTRACT, process.env.FUND_CONTRACT, process.env.REWARDS_CONTRACT, process.env.TEAM_CONTRACT, process.env.ADVISORS_CONTRACT, process.env.MARKETING_CONTRACT, process.env.EXCHANGE_CONTRACT, process.env.FOUNDATION_CONTRACT, process.env.STAKING_CONTRACT);
        // Wait for the transaction to be confirmed
        await tx.wait();
        console.log(tx)
        res.status(200).json({ message: "Transaction Successful" });
    } catch (error) {
        // Use a centralized error handler to handle errors
        next(error);
    }
}));


// Multi Sig Treasury 

// Calling Treasury Confirm Vesting Schedule function
app.post('/confirmTokenRelease', asyncHandler(async (req, res, next) => {
    const beneficiary = req.body.beneficiary;
    const index = req.body.release_number;

    try {
        const tx = await managerContract.confirmTxn_TGW(beneficiary, index);
        // Wait for the transaction to be confirmed
        await tx.wait();
        console.log(tx)
        res.status(200).json({ message: "Transaction Successful", release_number: index, beneficiary: beneficiary });
    } catch (error) {
        // Use a centralized error handler to handle errors
        next(error);
    }
}));

// Executing Treasury Vesting Schedule function
app.post('/executeTokenRelease', asyncHandler(async (req, res, next) => {
    const beneficiary = req.body.beneficiary;
    const index = req.body.release_number;

    try {
        const tx = await managerContract.executeTxn_TGW(beneficiary, index);
        // Wait for the transaction to be confirmed
        await tx.wait();
        console.log(tx)
        res.status(200).json({ message: "Transaction Successful", release_number: index, beneficiary: beneficiary });
    } catch (error) {
        // Use a centralized error handler to handle errors
        next(error);
    }
}));
// Calling Treasury to revoke a confirmation of token release
app.post('/revokeTokenRelease', asyncHandler(async (req, res, next) => {
    const beneficiary = req.body.beneficiary;
    const index = req.body.release_number;

    try {
        const tx = await managerContract.revokeConfirmation_TGW(beneficiary, index);
        // Wait for the transaction to be confirmed
        await tx.wait();
        console.log(tx)
        res.status(200).json({ message: "Transaction Successful", release_number: index, beneficiary: beneficiary });
    } catch (error) {
        // Use a centralized error handler to handle errors
        next(error);
    }
}));

// Checking TGE owners
app.get('/getOwners/Treasury', async (req, res, next) => {
    try {
        const owners_list = await managerContract.getOwners_TGW();
        console.log(owners_list)
        res.status(200).json({ message: "Transaction Successful", results: owners_list });
    } catch (error) {
        next(error);
    }
});

// Checking Total timelocks for beneficiary
app.get('/getTotalTokenReleaseCount/:address', async (req, res, next) => {
    const { address } = req.params;
    try {
        const result = await managerContract.getTransactionCount_TGW(address);
        const release_number = parseInt(result, 16);
        res.status(200).json({ message: "Transaction Successful", results: release_number });
    } catch (error) {
        next(error);
    }
});

// Checking timelock schedule info for beneficiary
app.get('/getVestingSchedule_TGW/', async (req, res, next) => {
    const beneficiary = req.body.beneficiary;
    const index = req.body.release_number;
    try {
        const tx = await managerContract.getVestingSchedule_TGW(beneficiary, index);
        const result = {}
        result.releaseTime = parseInt(tx.releaseTime._hex, 16)
        result.releaseAmount = parseInt(tx.releaseAmount._hex, 16)
        result.numConfirmations = parseInt(tx.numConfirmations._hex, 16)
        result.released = tx.released
        res.status(200).json({ message: "Transaction Successful", results: result });
    } catch (error) {
        next(error);
    }
});



// *************   Operational Wallets Start here   ****************

// Checking Operational Wallet owners
app.get('/getOwners/Wallets', async (req, res, next) => {
    try {
        const owners_list = await managerContract.getOwners_OW();
        console.log(owners_list)
        res.status(200).json({ message: "Transaction Successful", results: owners_list });
    } catch (error) {
        next(error);
    }
});

// ***     Seed Contract     ***
// Checking total transactions for SEED IDO wallet
app.get('/getTransactionsCount/Seed', async (req, res, next) => {
    try {
        const response = await managerContract.getTransactionCount_Fund();
        console.log(response)
        const result = {}
        result.transactions_count = parseInt(response._hex, 16);
        res.status(200).json({ message: "Transaction Successful", result: result });
    } catch (error) {
        next(error);
    }
});

// Checking timelock schedule info for beneficiary
app.get('/getTransactionInfo/Seed', async (req, res, next) => {
    const index = req.body.transaction_number;
    try {
        const tx = await managerContract.getTxn_Fund(index);
        const result = {}
        console.log(tx)
        result.to = tx.to
        result.value = parseInt(tx.value._hex, 16)
        result.data = parseInt(tx.data._hex, 16)
        result.executed = tx.executed
        result.numberOfConfirmations = parseInt(tx.numConfirmations._hex, 16)
        res.status(200).json({ message: "Transaction Successful", results: result });
    } catch (error) {
        next(error);
    }
});

// Submit a new Txn for Seed IDO /Fund Wallet
app.post('/submitTransaction/Seed', asyncHandler(async (req, res, next) => {
    const beneficiary = req.body.beneficiary;
    const amount = req.body.amount;
    const data = '0x00'     // Input some meesage/notes for the txn
    try {
        const tx = await managerContract.submitTxn_Fund(beneficiary, amount, data);
        // Wait for the transaction to be confirmed
        await tx.wait();
        console.log(tx)

        // Getting the total txns so as to get the index value of current txn
        const getTransactions = await managerContract.getTransactionCount_Fund();

        const result = {}
        result.to = beneficiary
        result.amount = amount
        result.transaction_index = parseInt(getTransactions._hex, 16) - 1;
        result.numConfirmations = tx.confirmations
        result.data = data
        result.type = "submit transaction"
        res.status(200).json({ message: "Transaction Successful", results: result });
    } catch (error) {
        // Use a centralized error handler to handle errors
        next(error);
    }
}));

// Confirming a Txn for Seed IDO /Fund Wallet
app.post('/confirmTransfer/Seed', asyncHandler(async (req, res, next) => {
    const index = req.body.transaction_number;

    try {
        const tx = await managerContract.confirmTxn_Fund(index);
        // Wait for the transaction to be confirmed
        await tx.wait();
        console.log(tx)
        const result = {}
        result.transaction_number = index
        result.type = "confirm"
        res.status(200).json({ message: "Transaction Successful", results: result });
    } catch (error) {
        // Use a centralized error handler to handle errors
        next(error);
    }
}));

// Executing the Confirmed transaction
app.post('/executeTransfer/Seed', asyncHandler(async (req, res, next) => {
    const index = req.body.transaction_number;

    try {
        const tx = await managerContract.executeTxn_Fund(index);
        // Wait for the transaction to be confirmed
        await tx.wait();
        const result = {}
        result.transaction_number = index
        result.type = "execute"
        res.status(200).json({ message: "Transaction Successful", results: result });
    } catch (error) {
        next(error);
    }
}));
// Calling Treasury to revoke a confirmation of token release
app.post('/revokeConfirmation/Seed', asyncHandler(async (req, res, next) => {
    const index = req.body.transaction_number;
    try {
        const tx = await managerContract.revokeConfirmation_Fund(index);
        // Wait for the transaction to be confirmed
        await tx.wait();
        console.log(tx)
        const result = {}
        result.transaction_number = index
        result.type = "revoke"
        res.status(200).json({ message: "Transaction Successful", results: result });
    } catch (error) {
        next(error);
    }
}));


// ****     Rewards Contract     ***
// Checking total transactions for Rewards wallet
app.get('/getTransactionsCount/Rewards', async (req, res, next) => {
    try {
        const response = await managerContract.getTransactionCount_Rewards();
        console.log(response)
        const result = {}
        result.transactions_count = parseInt(response._hex, 16);
        res.status(200).json({ message: "Transaction Successful", result: result });
    } catch (error) {
        next(error);
    }
});

// Checking timelock schedule info for beneficiary
app.get('/getTransactionInfo/Rewards', async (req, res, next) => {
    const index = req.body.transaction_number;
    try {
        const tx = await managerContract.getTxn_Rewards(index);
        const result = {}
        // console.log(tx)
        result.to = tx.to
        result.value = parseInt(tx.value._hex, 16)
        result.data = parseInt(tx.data._hex, 16)
        result.executed = tx.executed
        result.numberOfConfirmations = parseInt(tx.numConfirmations._hex, 16)
        res.status(200).json({ message: "Transaction Successful", results: result });
    } catch (error) {
        next(error);
    }
})

// Submit a new Txn for Rewards  Wallet
app.post('/submitTransaction/Rewards', asyncHandler(async (req, res, next) => {
    const beneficiary = req.body.beneficiary;
    const amount = req.body.amount;
    const data = '0x00'     // Input some meesage/notes for the txn
    try {
        const tx = await managerContract.submitTxn_Rewards(beneficiary, amount, data);
        // Wait for the transaction to be confirmed
        await tx.wait();
        // console.log(tx)

        // Getting the total txns so as to get the index value of current txn
        const getTransactions = await managerContract.getTransactionCount_Rewards();

        const result = {}
        result.to = beneficiary
        result.amount = amount
        result.transaction_index = parseInt(getTransactions._hex, 16) - 1;
        result.numConfirmations = tx.confirmations
        result.data = data
        result.type = "submit transaction"
        res.status(200).json({ message: "Transaction Successful", results: result });
    } catch (error) {
        // Use a centralized error handler to handle errors
        next(error);
    }
}));

// Confirming a Txn for Rewards  Wallet
app.post('/confirmTransfer/Rewards', asyncHandler(async (req, res, next) => {
    const index = req.body.transaction_number;

    try {
        const tx = await managerContract.confirmTxn_Rewards(index);
        // Wait for the transaction to be confirmed
        await tx.wait();
        console.log(tx)
        const result = {}
        result.transaction_number = index
        result.type = "confirm"
        res.status(200).json({ message: "Transaction Successful", results: result });
    } catch (error) {
        // Use a centralized error handler to handle errors
        next(error);
    }
}));

// Executing the Confirmed transaction
app.post('/executeTransfer/Rewards', asyncHandler(async (req, res, next) => {
    const index = req.body.transaction_number;

    try {
        const tx = await managerContract.executeTxn_Rewards(index);
        // Wait for the transaction to be confirmed
        await tx.wait();
        const result = {}
        result.transaction_number = index
        result.type = "execute"
        res.status(200).json({ message: "Transaction Successful", results: result });
    } catch (error) {
        next(error);
    }
}));
// Calling Treasury to revoke a confirmation of token release
app.post('/revokeConfirmation/Rewards', asyncHandler(async (req, res, next) => {
    const index = req.body.transaction_number;

    try {
        const tx = await managerContract.revokeConfirmation_Rewards(index);
        // Wait for the transaction to be confirmed
        await tx.wait();
        console.log(tx)
        const result = {}
        result.transaction_number = index
        result.type = "revoke"
        res.status(200).json({ message: "Transaction Successful", results: result });
    } catch (error) {
        next(error);
    }
}));


// ***     Team Contract     ***
// Checking total transactions for Team wallet
app.get('/getTransactionsCount/Team', async (req, res, next) => {
    try {
        const response = await managerContract.getTransactionCount_Team();
        console.log(response)
        const result = {}
        result.transactions_count = parseInt(response._hex, 16);
        res.status(200).json({ message: "Transaction Successful", result: result });
    } catch (error) {
        next(error);
    }
});

// Checking timelock schedule info for beneficiary
app.get('/getTransactionInfo/Team', async (req, res, next) => {
    const index = req.body.transaction_number;
    try {
        const tx = await managerContract.getTxn_Team(index);
        const result = {}
        console.log(tx)
        result.to = tx.to
        result.value = parseInt(tx.value._hex, 16)
        result.data = parseInt(tx.data._hex, 16)
        result.executed = tx.executed
        result.numberOfConfirmations = parseInt(tx.numConfirmations._hex, 16)
        res.status(200).json({ message: "Transaction Successful", results: result });
    } catch (error) {
        next(error);
    }
})

// Submit a new Txn for Team  Wallet
app.post('/submitTransaction/Team', asyncHandler(async (req, res, next) => {
    const beneficiary = req.body.beneficiary;
    const amount = req.body.amount;
    const data = '0x00'     // Input some meesage/notes for the txn
    try {
        const tx = await managerContract.submitTxn_Team(beneficiary, amount, data);
        // Wait for the transaction to be confirmed
        await tx.wait();
        console.log(tx)

        // Getting the total txns so as to get the index value of current txn
        const getTransactions = await managerContract.getTransactionCount_Team();

        const result = {}
        result.to = beneficiary
        result.amount = amount
        result.transaction_index = parseInt(getTransactions._hex, 16) - 1;
        result.numConfirmations = tx.confirmations
        result.data = data
        result.type = "submit transaction"
        res.status(200).json({ message: "Transaction Successful", results: result });
    } catch (error) {
        // Use a centralized error handler to handle errors
        next(error);
    }
}));

// Confirming a Txn for Team  Wallet
app.post('/confirmTransfer/Team', asyncHandler(async (req, res, next) => {
    const index = req.body.transaction_number;

    try {
        const tx = await managerContract.confirmTxn_Team(index);
        // Wait for the transaction to be confirmed
        await tx.wait();
        console.log(tx)
        const result = {}
        result.transaction_number = index
        result.type = "confirm"
        res.status(200).json({ message: "Transaction Successful", results: result });
    } catch (error) {
        // Use a centralized error handler to handle errors
        next(error);
    }
}));

// Executing the Confirmed transaction
app.post('/executeTransfer/Team', asyncHandler(async (req, res, next) => {
    const index = req.body.transaction_number;

    try {
        const tx = await managerContract.executeTxn_Team(index);
        // Wait for the transaction to be confirmed
        await tx.wait();
        const result = {}
        result.transaction_number = index
        result.type = "execute"
        res.status(200).json({ message: "Transaction Successful", results: result });
    } catch (error) {
        next(error);
    }
}));
// revoke a confirmation of transfer
app.post('/revokeConfirmation/Team', asyncHandler(async (req, res, next) => {
    const index = req.body.transaction_number;

    try {
        const tx = await managerContract.revokeConfirmation_Team(index);
        // Wait for the transaction to be confirmed
        await tx.wait();
        console.log(tx)
        const result = {}
        result.transaction_number = index
        result.type = "revoke"
        res.status(200).json({ message: "Transaction Successful", results: result });
    } catch (error) {
        next(error);
    }
}));


// ***     Advisor Contract     ***
// Checking total transactions for Advisor wallet
app.get('/getTransactionsCount/Advisor', async (req, res, next) => {
    try {
        const response = await managerContract.getTransactionCount_Advisor();
        console.log(response)
        const result = {}
        result.transactions_count = parseInt(response._hex, 16);
        res.status(200).json({ message: "Transaction Successful", result: result });
    } catch (error) {
        next(error);
    }
});

// Checking timelock schedule info for beneficiary
app.get('/getTransactionInfo/Advisor', async (req, res, next) => {
    const index = req.body.transaction_number;
    try {
        const tx = await managerContract.getTxn_Advisor(index);
        const result = {}
        console.log(tx)
        result.to = tx.to
        result.value = parseInt(tx.value._hex, 16)
        result.data = parseInt(tx.data._hex, 16)
        result.executed = tx.executed
        result.numberOfConfirmations = parseInt(tx.numConfirmations._hex, 16)
        res.status(200).json({ message: "Transaction Successful", results: result });
    } catch (error) {
        next(error);
    }
})

// Submit a new Txn for Advisor  Wallet
app.post('/submitTransaction/Advisor', asyncHandler(async (req, res, next) => {
    const beneficiary = req.body.beneficiary;
    const amount = req.body.amount;
    const data = '0x00'     // Input some meesage/notes for the txn
    try {
        const tx = await managerContract.submitTxn_Advisor(beneficiary, amount, data);
        // Wait for the transaction to be confirmed
        await tx.wait();
        console.log(tx)

        // Getting the total txns so as to get the index value of current txn
        const getTransactions = await managerContract.getTransactionCount_Advisor();

        const result = {}
        result.to = beneficiary
        result.amount = amount
        result.transaction_index = parseInt(getTransactions._hex, 16) - 1;
        result.numConfirmations = tx.confirmations
        result.data = data
        result.type = "submit transaction"
        res.status(200).json({ message: "Transaction Successful", results: result });
    } catch (error) {
        // Use a centralized error handler to handle errors
        next(error);
    }
}));

// Confirming a Txn for Advisor  Wallet
app.post('/confirmTransfer/Advisor', asyncHandler(async (req, res, next) => {
    const index = req.body.transaction_number;

    try {
        const tx = await managerContract.confirmTxn_Advisor(index);
        // Wait for the transaction to be confirmed
        await tx.wait();
        console.log(tx)
        const result = {}
        result.transaction_number = index
        result.type = "confirm"
        res.status(200).json({ message: "Transaction Successful", results: result });
    } catch (error) {
        // Use a centralized error handler to handle errors
        next(error);
    }
}));

// Executing the Confirmed transaction
app.post('/executeTransfer/Advisor', asyncHandler(async (req, res, next) => {
    const index = req.body.transaction_number;

    try {
        const tx = await managerContract.executeTxn_Advisor(index);
        // Wait for the transaction to be confirmed
        await tx.wait();
        const result = {}
        result.transaction_number = index
        result.type = "execute"
        res.status(200).json({ message: "Transaction Successful", results: result });
    } catch (error) {
        next(error);
    }
}));
// revoke a confirmation of transfer
app.post('/revokeConfirmation/Advisor', asyncHandler(async (req, res, next) => {
    const index = req.body.transaction_number;

    try {
        const tx = await managerContract.revokeConfirmation_Advisor(index);
        // Wait for the transaction to be confirmed
        await tx.wait();
        console.log(tx)
        const result = {}
        result.transaction_number = index
        result.type = "revoke"
        res.status(200).json({ message: "Transaction Successful", results: result });
    } catch (error) {
        next(error);
    }
}));



// ***     Marketing Contract     ***
// Checking total transactions for Marketing wallet
app.get('/getTransactionsCount/Marketing', async (req, res, next) => {
    try {
        const response = await managerContract.getTransactionCount_Marketing();
        console.log(response)
        const result = {}
        result.transactions_count = parseInt(response._hex, 16);
        res.status(200).json({ message: "Transaction Successful", result: result });
    } catch (error) {
        next(error);
    }
});

// Checking timelock schedule info for beneficiary
app.get('/getTransactionInfo/Marketing', async (req, res, next) => {
    const index = req.body.transaction_number;
    try {
        const tx = await managerContract.getTxn_Marketing(index);
        const result = {}
        console.log(tx)
        result.to = tx.to
        result.value = parseInt(tx.value._hex, 16)
        result.data = parseInt(tx.data._hex, 16)
        result.executed = tx.executed
        result.numberOfConfirmations = parseInt(tx.numConfirmations._hex, 16)
        res.status(200).json({ message: "Transaction Successful", results: result });
    } catch (error) {
        next(error);
    }
})

// Submit a new Txn for Marketing  Wallet
app.post('/submitTransaction/Marketing', asyncHandler(async (req, res, next) => {
    const beneficiary = req.body.beneficiary;
    const amount = req.body.amount;
    const data = '0x00'     // Input some meesage/notes for the txn
    try {
        const tx = await managerContract.submitTxn_Marketing(beneficiary, amount, data);
        // Wait for the transaction to be confirmed
        await tx.wait();
        console.log(tx)

        // Getting the total txns so as to get the index value of current txn
        const getTransactions = await managerContract.getTransactionCount_Marketing();

        const result = {}
        result.to = beneficiary
        result.amount = amount
        result.transaction_index = parseInt(getTransactions._hex, 16) - 1;
        result.numConfirmations = tx.confirmations
        result.data = data
        result.type = "submit transaction"
        res.status(200).json({ message: "Transaction Successful", results: result });
    } catch (error) {
        // Use a centralized error handler to handle errors
        next(error);
    }
}));

// Confirming a Txn for Marketing  Wallet
app.post('/confirmTransfer/Marketing', asyncHandler(async (req, res, next) => {
    const index = req.body.transaction_number;

    try {
        const tx = await managerContract.confirmTxn_Marketing(index);
        // Wait for the transaction to be confirmed
        await tx.wait();
        console.log(tx)
        const result = {}
        result.transaction_number = index
        result.type = "confirm"
        res.status(200).json({ message: "Transaction Successful", results: result });
    } catch (error) {
        // Use a centralized error handler to handle errors
        next(error);
    }
}));

// Executing the Confirmed transaction
app.post('/executeTransfer/Marketing', asyncHandler(async (req, res, next) => {
    const index = req.body.transaction_number;

    try {
        const tx = await managerContract.executeTxn_Marketing(index);
        // Wait for the transaction to be confirmed
        await tx.wait();
        const result = {}
        result.transaction_number = index
        result.type = "execute"
        res.status(200).json({ message: "Transaction Successful", results: result });
    } catch (error) {
        next(error);
    }
}));
// revoke a confirmation of transfer
app.post('/revokeConfirmation/Marketing', asyncHandler(async (req, res, next) => {
    const index = req.body.transaction_number;

    try {
        const tx = await managerContract.revokeConfirmation_Marketing(index);
        // Wait for the transaction to be confirmed
        await tx.wait();
        console.log(tx)
        const result = {}
        result.transaction_number = index
        result.type = "revoke"
        res.status(200).json({ message: "Transaction Successful", results: result });
    } catch (error) {
        next(error);
    }
}));

// ***     Exchange Contract     ***
// Checking total transactions for Exchange wallet
app.get('/getTransactionsCount/Exchange', async (req, res, next) => {
    try {
        const response = await managerContract.getTransactionCount_Exchange();
        console.log(response)
        const result = {}
        result.transactions_count = parseInt(response._hex, 16);
        res.status(200).json({ message: "Transaction Successful", result: result });
    } catch (error) {
        next(error);
    }
});

// Checking timelock schedule info for beneficiary
app.get('/getTransactionInfo/Exchange', async (req, res, next) => {
    const index = req.body.transaction_number;
    try {
        const tx = await managerContract.getTxn_Exchange(index);
        const result = {}
        console.log(tx)
        result.to = tx.to
        result.value = parseInt(tx.value._hex, 16)
        result.data = parseInt(tx.data._hex, 16)
        result.executed = tx.executed
        result.numberOfConfirmations = parseInt(tx.numConfirmations._hex, 16)
        res.status(200).json({ message: "Transaction Successful", results: result });
    } catch (error) {
        next(error);
    }
})

// Submit a new Txn for Exchange  Wallet
app.post('/submitTransaction/Exchange', asyncHandler(async (req, res, next) => {
    const beneficiary = req.body.beneficiary;
    const amount = req.body.amount;
    const data = '0x00'     // Input some meesage/notes for the txn
    try {
        const tx = await managerContract.submitTxn_Exchange(beneficiary, amount, data);
        // Wait for the transaction to be confirmed
        await tx.wait();
        console.log(tx)

        // Getting the total txns so as to get the index value of current txn
        const getTransactions = await managerContract.getTransactionCount_Exchange();

        const result = {}
        result.to = beneficiary
        result.amount = amount
        result.transaction_index = parseInt(getTransactions._hex, 16) - 1;
        result.numConfirmations = tx.confirmations
        result.data = data
        result.type = "submit transaction"
        res.status(200).json({ message: "Transaction Successful", results: result });
    } catch (error) {
        // Use a centralized error handler to handle errors
        next(error);
    }
}));

// Confirming a Txn for Exchange  Wallet
app.post('/confirmTransfer/Exchange', asyncHandler(async (req, res, next) => {
    const index = req.body.transaction_number;

    try {
        const tx = await managerContract.confirmTxn_Exchange(index);
        // Wait for the transaction to be confirmed
        await tx.wait();
        console.log(tx)
        const result = {}
        result.transaction_number = index
        result.type = "confirm"
        res.status(200).json({ message: "Transaction Successful", results: result });
    } catch (error) {
        // Use a centralized error handler to handle errors
        next(error);
    }
}));

// Executing the Confirmed transaction
app.post('/executeTransfer/Exchange', asyncHandler(async (req, res, next) => {
    const index = req.body.transaction_number;

    try {
        const tx = await managerContract.executeTxn_Exchange(index);
        // Wait for the transaction to be confirmed
        await tx.wait();
        const result = {}
        result.transaction_number = index
        result.type = "execute"
        res.status(200).json({ message: "Transaction Successful", results: result });
    } catch (error) {
        next(error);
    }
}));
// revoke a confirmation of transfer
app.post('/revokeConfirmation/Exchange', asyncHandler(async (req, res, next) => {
    const index = req.body.transaction_number;

    try {
        const tx = await managerContract.revokeConfirmation_Exchange(index);
        // Wait for the transaction to be confirmed
        await tx.wait();
        console.log(tx)
        const result = {}
        result.transaction_number = index
        result.type = "revoke"
        res.status(200).json({ message: "Transaction Successful", results: result });
    } catch (error) {
        next(error);
    }
}));

// ***     Foundation Contract     ***
// Checking total transactions for Foundation wallet
app.get('/getTransactionsCount/Foundation', async (req, res, next) => {
    try {
        const response = await managerContract.getTransactionCount_Foundation();
        console.log(response)
        const result = {}
        result.transactions_count = parseInt(response._hex, 16);
        res.status(200).json({ message: "Transaction Successful", result: result });
    } catch (error) {
        next(error);
    }
});

// Checking timelock schedule info for beneficiary
app.get('/getTransactionInfo/Foundation', async (req, res, next) => {
    const index = req.body.transaction_number;
    try {
        const tx = await managerContract.getTxn_Foundation(index);
        const result = {}
        console.log(tx)
        result.to = tx.to
        result.value = parseInt(tx.value._hex, 16)
        result.data = parseInt(tx.data._hex, 16)
        result.executed = tx.executed
        result.numberOfConfirmations = parseInt(tx.numConfirmations._hex, 16)
        res.status(200).json({ message: "Transaction Successful", results: result });
    } catch (error) {
        next(error);
    }
})

// Submit a new Txn for Foundation  Wallet
app.post('/submitTransaction/Foundation', asyncHandler(async (req, res, next) => {
    const beneficiary = req.body.beneficiary;
    const amount = req.body.amount;
    const data = '0x00'     // Input some meesage/notes for the txn
    try {
        const tx = await managerContract.submitTxn_Foundation(beneficiary, amount, data);
        // Wait for the transaction to be confirmed
        await tx.wait();
        console.log(tx)

        // Getting the total txns so as to get the index value of current txn
        const getTransactions = await managerContract.getTransactionCount_Foundation();

        const result = {}
        result.to = beneficiary
        result.amount = amount
        result.transaction_index = parseInt(getTransactions._hex, 16) - 1;
        result.numConfirmations = tx.confirmations
        result.data = data
        result.type = "submit transaction"
        res.status(200).json({ message: "Transaction Successful", results: result });
    } catch (error) {
        // Use a centralized error handler to handle errors
        next(error);
    }
}));

// Confirming a Txn for Foundation  Wallet
app.post('/confirmTransfer/Foundation', asyncHandler(async (req, res, next) => {
    const index = req.body.transaction_number;

    try {
        const tx = await managerContract.confirmTxn_Foundation(index);
        // Wait for the transaction to be confirmed
        await tx.wait();
        console.log(tx)
        const result = {}
        result.transaction_number = index
        result.type = "confirm"
        res.status(200).json({ message: "Transaction Successful", results: result });
    } catch (error) {
        // Use a centralized error handler to handle errors
        next(error);
    }
}));

// Executing the Confirmed transaction
app.post('/executeTransfer/Foundation', asyncHandler(async (req, res, next) => {
    const index = req.body.transaction_number;

    try {
        const tx = await managerContract.executeTxn_Foundation(index);
        // Wait for the transaction to be confirmed
        await tx.wait();
        const result = {}
        result.transaction_number = index
        result.type = "execute"
        res.status(200).json({ message: "Transaction Successful", results: result });
    } catch (error) {
        next(error);
    }
}));
// revoke a confirmation of transfer
app.post('/revokeConfirmation/Foundation', asyncHandler(async (req, res, next) => {
    const index = req.body.transaction_number;

    try {
        const tx = await managerContract.revokeConfirmation_Foundation(index);
        // Wait for the transaction to be confirmed
        await tx.wait();
        console.log(tx)
        const result = {}
        result.transaction_number = index
        result.type = "revoke"
        res.status(200).json({ message: "Transaction Successful", results: result });
    } catch (error) {
        next(error);
    }
}));

// ***     Staking Contract     ***
// Checking total transactions for Staking wallet
app.get('/getTransactionsCount/Staking', async (req, res, next) => {
    try {
        const response = await managerContract.getTransactionCount_Staking();
        console.log(response)
        const result = {}
        result.transactions_count = parseInt(response._hex, 16);
        res.status(200).json({ message: "Transaction Successful", result: result });
    } catch (error) {
        next(error);
    }
});

// Checking timelock schedule info for beneficiary
app.get('/getTransactionInfo/Staking', async (req, res, next) => {
    const index = req.body.transaction_number;
    try {
        const tx = await managerContract.getTxn_Staking(index);
        const result = {}
        console.log(tx)
        result.to = tx.to
        result.value = parseInt(tx.value._hex, 16)
        result.data = parseInt(tx.data._hex, 16)
        result.executed = tx.executed
        result.numberOfConfirmations = parseInt(tx.numConfirmations._hex, 16)
        res.status(200).json({ message: "Transaction Successful", results: result });
    } catch (error) {
        next(error);
    }
})

// Submit a new Txn for Staking  Wallet
app.post('/submitTransaction/Staking', asyncHandler(async (req, res, next) => {
    const beneficiary = req.body.beneficiary;
    const amount = req.body.amount;
    const data = '0x00'     // Input some meesage/notes for the txn
    try {
        const tx = await managerContract.submitTxn_Staking(beneficiary, amount, data);
        // Wait for the transaction to be confirmed
        await tx.wait();
        console.log(tx)

        // Getting the total txns so as to get the index value of current txn
        const getTransactions = await managerContract.getTransactionCount_Staking();

        const result = {}
        result.to = beneficiary
        result.amount = amount
        result.transaction_index = parseInt(getTransactions._hex, 16) - 1;
        result.numConfirmations = tx.confirmations
        result.data = data
        result.type = "submit transaction"
        res.status(200).json({ message: "Transaction Successful", results: result });
    } catch (error) {
        // Use a centralized error handler to handle errors
        next(error);
    }
}));

// Confirming a Txn for Staking  Wallet
app.post('/confirmTransfer/Staking', asyncHandler(async (req, res, next) => {
    const index = req.body.transaction_number;

    try {
        const tx = await managerContract.confirmTxn_Staking(index);
        // Wait for the transaction to be confirmed
        await tx.wait();
        console.log(tx)
        const result = {}
        result.transaction_number = index
        result.type = "confirm"
        res.status(200).json({ message: "Transaction Successful", results: result });
    } catch (error) {
        // Use a centralized error handler to handle errors
        next(error);
    }
}));

// Executing the Confirmed transaction
app.post('/executeTransfer/Staking', asyncHandler(async (req, res, next) => {
    const index = req.body.transaction_number;

    try {
        const tx = await managerContract.executeTxn_Staking(index);
        // Wait for the transaction to be confirmed
        await tx.wait();
        const result = {}
        result.transaction_number = index
        result.type = "execute"
        res.status(200).json({ message: "Transaction Successful", results: result });
    } catch (error) {
        next(error);
    }
}));
// revoke a confirmation of transfer
app.post('/revokeConfirmation/Staking', asyncHandler(async (req, res, next) => {
    const index = req.body.transaction_number;

    try {
        const tx = await managerContract.revokeConfirmation_Staking(index);
        // Wait for the transaction to be confirmed
        await tx.wait();
        console.log(tx)
        const result = {}
        result.transaction_number = index
        result.type = "revoke"
        res.status(200).json({ message: "Transaction Successful", results: result });
    } catch (error) {
        next(error);
    }
}));

// Define a centralized error handler
app.use((error, req, res, next) => {
    console.error(error);
    let reason = ''
    // console.log(error)

    if (error.hasOwnProperty('error')) {
        reason = error.error.reason
    } else if (error.hasOwnProperty('reason')) {
        reason = error.reason
    } else {
        reason = error
    }
    // Return a 500 status code with an error message
    res.status(500).json({ error: 'Internal server error', reason: reason });
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});