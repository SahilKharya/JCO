const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Rewards Contract", function () {
    let JCO, jco, Fundraising, fundraising, accounts;

    beforeEach(async function () {
        [owner, account1, account2, account3] = await ethers.getSigners();
        accounts = [owner.address, account1.address, account2.address];
        Treasury = await ethers.getContractFactory("Treasury");
        treasury = await Treasury.deploy();
        JCO = await ethers.getContractFactory("JCO");
        jco = await JCO.deploy(treasury.address, "JCO_Ganache", "JCO");
        JCO_Manager = await ethers.getContractFactory("JCO_Manager");
        jco_manager = await JCO_Manager.deploy(jco.address);

        Fundraising = await ethers.getContractFactory("Fundraising");
        fundraising = await Fundraising.deploy(accounts, 2, jco.address, jco_manager.address);

        Rewards = await ethers.getContractFactory("Rewards");
        rewards = await Rewards.deploy(accounts, 2, jco.address, jco_manager.address);

        Team = await ethers.getContractFactory("Team");
        team = await Team.deploy(accounts, 2, jco.address, jco_manager.address);

        Advisors = await ethers.getContractFactory("Advisors");
        advisors = await Advisors.deploy(accounts, 2, jco.address, jco_manager.address);

        Marketing = await ethers.getContractFactory("Marketing");
        marketing = await Marketing.deploy(accounts, 2, jco.address, jco_manager.address);

        Exchange = await ethers.getContractFactory("Exchange");
        exchange = await Exchange.deploy(accounts, 2, jco.address, jco_manager.address);

        Foundation = await ethers.getContractFactory("Foundation");
        foundation = await Foundation.deploy(accounts, 2, jco.address, jco_manager.address);

        Staking = await ethers.getContractFactory("Staking");
        staking = await Staking.deploy(accounts, 2, jco.address, jco_manager.address);

        MultiSig_Treasury = await ethers.getContractFactory("MultiSig_Treasury");
        multisig = await MultiSig_Treasury.deploy(accounts, 2, jco.address, treasury.address, jco_manager.address, [
            fundraising.address,
            rewards.address,
            team.address,
            advisors.address,
            marketing.address,
            exchange.address,
            foundation.address,
            staking.address,
        ]);
        await jco_manager.addWallets(
            treasury.address,
            multisig.address,
            fundraising.address,
            rewards.address,
            team.address,
            advisors.address,
            marketing.address,
            exchange.address,
            foundation.address,
            staking.address
        );
    });

    describe("Deployment", function () {
        it("Should assign the manager", async function () {
            expect(await rewards.manager()).to.equal(jco_manager.address);
        });

        it("Should set the number of confirmations required", async function () {
            expect(await rewards.numConfirmationsRequired()).to.equal(2);
        });

        it("Should set the owners", async function () {
            expect(await jco_manager.getOwners_OW()).to.eql(accounts);
        });
    });

    describe("Transactions", function () {
        it("Should submit transaction successfully", async function () {
            const tx = await jco_manager.submitTxn_Rewards(account1.address, 100, "0x");
            await tx.wait();

            expect(tx).to.emit(rewards, "SubmitTransaction").withArgs(owner.address, 0, account1.address, 100, "0x");
        });

        it("Should confirm transaction successfully", async function () {
            await jco_manager.submitTxn_Rewards(account1.address, 100, "0x");

            const tx = await jco_manager.confirmTxn_Rewards(0);
            await tx.wait();

            expect(tx).to.emit(rewards, "ConfirmTransaction").withArgs(account1.address, 0);
        });

        it("Should execute transaction successfully", async function () {
            let tx = await treasury.approveOtherContract(jco.address, multisig.address, 250000000);
            await tx.wait();

            tx = await jco_manager.connect(account1).confirmTxn_TGW(rewards.address, 0);
            await tx.wait();

            tx = await jco_manager.connect(owner).confirmTxn_TGW(rewards.address, 0);
            await tx.wait();

            tx = await jco_manager.connect(account2).confirmTxn_TGW(rewards.address, 0);
            await tx.wait();

            tx = await jco_manager.executeTxn_TGW(rewards.address, 0);
            await tx.wait();

            tx = await jco_manager.submitTxn_Rewards(account1.address, 100, "0x");
            await tx.wait();

            tx = await jco_manager.connect(owner).confirmTxn_Rewards(0);
            await tx.wait();

            tx = await jco_manager.connect(account1).confirmTxn_Rewards(0);
            await tx.wait();

            tx = await jco_manager.executeTxn_Rewards(0);
            await tx.wait();

            expect(tx).to.emit(rewards, "Transfer_JCO").withArgs(rewards.address, account1.address, 100);
            expect(tx).to.emit(rewards, "ExecuteTransaction").withArgs(owner.address, 0);
        });

        it("Should revoke confirmation successfully", async function () {
            await jco_manager.submitTxn_Rewards(account1.address, 100, "0x");

            await jco_manager.connect(account1).confirmTxn_Rewards(0);

            const tx = await jco_manager.connect(account1).revokeConfirmation_Rewards(0);
            await tx.wait();

            expect(tx).to.emit(rewards, "RevokeConfirmation").withArgs(account1.address, 0);
        });

        it("Should not execute transaction without minimum confirmations", async function () {
            await treasury.approveOtherContract(jco.address, multisig.address, 250000000);
            await jco_manager.connect(account1).confirmTxn_TGW(staking.address, 0);
            await jco_manager.connect(owner).confirmTxn_TGW(staking.address, 0);
            await jco_manager.connect(account2).confirmTxn_TGW(staking.address, 0);
            await jco_manager.executeTxn_TGW(staking.address, 0);

            await jco_manager.submitTxn_Rewards(account1.address, 10000, "0x");

            await jco_manager.connect(account1).confirmTxn_Rewards(0);

            await expect(jco_manager.executeTxn_Rewards(0)).to.be.rejectedWith("cannot execute tx");
        });
    });
});
