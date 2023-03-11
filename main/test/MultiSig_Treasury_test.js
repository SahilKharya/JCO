// Import necessary modules and contracts
const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("MultiSig_Treasury Contract", function () {
    let JCO, jco, Fundraising, fundraising, accounts, jco_Manager;

    describe("Deployment", function () {
        before(async function () {
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

        it("Should assign the manager", async function () {
            expect(await multisig.manager()).to.equal(jco_manager.address);
        });

        it("Should set the owners", async function () {
            expect(await jco_manager.getOwners_OW()).to.eql(accounts);
        });

        it("should set correct transaction count", async function () {
            // console.log(fundraising.address, multisig.address);
            expect(await jco_manager.getTransactionCount_TGW(fundraising.address)).equal(7);
            expect(await jco_manager.getTransactionCount_TGW(rewards.address)).equal(4);
            expect(await jco_manager.getTransactionCount_TGW(team.address)).equal(3);
            expect(await jco_manager.getTransactionCount_TGW(advisors.address)).equal(3);
            expect(await jco_manager.getTransactionCount_TGW(marketing.address)).equal(3);
            expect(await jco_manager.getTransactionCount_TGW(staking.address)).equal(7);
            expect(await jco_manager.getTransactionCount_TGW(exchange.address)).equal(1);
            expect(await jco_manager.getTransactionCount_TGW(foundation.address)).equal(3);
        });
    });

    describe("Transactions", function () {
        before(async function () {
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

            let tx = await treasury.approveOtherContract(jco.address, multisig.address, 250000000);
            await tx.wait();
        });

        it("Should confirm transaction with current release time", async function () {
            // await ethers.provider.send("evm_increaseTime", [864000]);
            tx = await jco_manager.confirmTxn_TGW(fundraising.address, 0);
            await tx.wait();

            expect(tx).to.emit(fundraising, "ConfirmTransaction").withArgs(owner.address, 0);

            tx = await jco_manager.confirmTxn_TGW(rewards.address, 0);
            await tx.wait();

            expect(tx).to.emit(rewards, "ConfirmTransaction").withArgs(owner.address, 0);

            tx = await jco_manager.confirmTxn_TGW(marketing.address, 0);
            await tx.wait();

            expect(tx).to.emit(marketing, "ConfirmTransaction").withArgs(owner.address, 0);

            tx = await jco_manager.confirmTxn_TGW(staking.address, 0);
            await tx.wait();

            expect(tx).to.emit(staking, "ConfirmTransaction").withArgs(owner.address, 0);

            tx = await jco_manager.confirmTxn_TGW(exchange.address, 0);
            await tx.wait();

            expect(tx).to.emit(exchange, "ConfirmTransaction").withArgs(owner.address, 0);
        });

        it("Should execute transaction with current release time", async function () {
            // await ethers.provider.send("evm_increaseTime", [864000]);
            tx = await jco_manager.connect(account1).confirmTxn_TGW(fundraising.address, 0);
            await tx.wait();

            tx = await jco_manager.connect(account2).confirmTxn_TGW(fundraising.address, 0);
            await tx.wait();

            tx = await jco_manager.executeTxn_TGW(fundraising.address, 0);
            await tx.wait();

            expect(await jco.balanceOf(fundraising.address)).to.equal(
                ethers.BigNumber.from("5960000000000000000000000")
            );

            tx = await jco_manager.connect(account1).confirmTxn_TGW(rewards.address, 0);
            await tx.wait();

            tx = await jco_manager.connect(account2).confirmTxn_TGW(rewards.address, 0);
            await tx.wait();

            tx = await jco_manager.executeTxn_TGW(rewards.address, 0);
            await tx.wait();

            expect(await jco.balanceOf(rewards.address)).to.equal(ethers.BigNumber.from("1150000000000000000000000"));

            tx = await jco_manager.connect(account1).confirmTxn_TGW(marketing.address, 0);
            await tx.wait();

            tx = await jco_manager.connect(account2).confirmTxn_TGW(marketing.address, 0);
            await tx.wait();

            tx = await jco_manager.executeTxn_TGW(marketing.address, 0);
            await tx.wait();

            expect(await jco.balanceOf(marketing.address)).to.equal(
                ethers.BigNumber.from("15000000000000000000000000")
            );

            tx = await jco_manager.connect(account1).confirmTxn_TGW(staking.address, 0);
            await tx.wait();

            tx = await jco_manager.connect(account2).confirmTxn_TGW(staking.address, 0);
            await tx.wait();

            tx = await jco_manager.executeTxn_TGW(staking.address, 0);
            await tx.wait();

            expect(await jco.balanceOf(staking.address)).to.equal(ethers.BigNumber.from("15000000000000000000000000"));

            tx = await jco_manager.connect(account1).confirmTxn_TGW(exchange.address, 0);
            await tx.wait();

            tx = await jco_manager.connect(account2).confirmTxn_TGW(exchange.address, 0);
            await tx.wait();

            tx = await jco_manager.executeTxn_TGW(exchange.address, 0);
            await tx.wait();

            expect(await jco.balanceOf(exchange.address)).to.equal(ethers.BigNumber.from("15000000000000000000000000"));

            // tx = await jco_manager.confirmTxn_TGW(rewards.address, 0);
            // await tx.wait();

            // expect(tx).to.emit(rewards, "ConfirmTransaction").withArgs(owner.address, 0);

            // tx = await jco_manager.confirmTxn_TGW(marketing.address, 0);
            // await tx.wait();

            // expect(tx).to.emit(marketing, "ConfirmTransaction").withArgs(owner.address, 0);

            // tx = await jco_manager.confirmTxn_TGW(staking.address, 0);
            // await tx.wait();

            // expect(tx).to.emit(staking, "ConfirmTransaction").withArgs(owner.address, 0);

            // tx = await jco_manager.confirmTxn_TGW(exchange.address, 0);
            // await tx.wait();

            // expect(tx).to.emit(exchange, "ConfirmTransaction").withArgs(owner.address, 0);
        });

        it("Should confirm transaction with release time 10 days ahead", async function () {
            await ethers.provider.send("evm_increaseTime", [864000]);
            await ethers.provider.send("evm_mine", []);

            tx = await jco_manager.connect(account1).confirmTxn_TGW(fundraising.address, 1);
            await tx.wait();

            tx = await jco_manager.connect(account2).confirmTxn_TGW(fundraising.address, 1);
            await tx.wait();

            tx = await jco_manager.executeTxn_TGW(fundraising.address, 1);
            await tx.wait();

            expect(await jco.balanceOf(fundraising.address)).to.equal(
                ethers.BigNumber.from((5960000 + 3960000).toString() + "000000000000000000")
            );

            // tx = await jco_manager.connect(account1).confirmTxn_TGW(rewards.address, 0);
            // await tx.wait();

            // tx = await jco_manager.connect(account2).confirmTxn_TGW(rewards.address, 0);
            // await tx.wait();

            // tx = await jco_manager.executeTxn_TGW(rewards.address, 0);
            // await tx.wait();

            // expect(await jco.balanceOf(rewards.address)).to.equal(ethers.BigNumber.from("1150000000000000000000000"));

            // tx = await jco_manager.connect(account1).confirmTxn_TGW(marketing.address, 0);
            // await tx.wait();

            // tx = await jco_manager.connect(account2).confirmTxn_TGW(marketing.address, 0);
            // await tx.wait();

            // tx = await jco_manager.executeTxn_TGW(marketing.address, 0);
            // await tx.wait();

            // expect(await jco.balanceOf(marketing.address)).to.equal(
            //     ethers.BigNumber.from("15000000000000000000000000")
            // );

            // tx = await jco_manager.connect(account1).confirmTxn_TGW(staking.address, 0);
            // await tx.wait();

            // tx = await jco_manager.connect(account2).confirmTxn_TGW(staking.address, 0);
            // await tx.wait();

            // tx = await jco_manager.executeTxn_TGW(staking.address, 0);
            // await tx.wait();

            // expect(await jco.balanceOf(staking.address)).to.equal(ethers.BigNumber.from("15000000000000000000000000"));

            // tx = await jco_manager.connect(account1).confirmTxn_TGW(exchange.address, 0);
            // await tx.wait();

            // tx = await jco_manager.connect(account2).confirmTxn_TGW(exchange.address, 0);
            // await tx.wait();

            // tx = await jco_manager.executeTxn_TGW(exchange.address, 0);
            // await tx.wait();

            // expect(await jco.balanceOf(exchange.address)).to.equal(ethers.BigNumber.from("15000000000000000000000000"));

            // expect(tx).to.emit(fundraising, "ConfirmTransaction").withArgs(owner.address, 1);

            // tx = await jco_manager.confirmTxn_TGW(rewards.address, 0);
            // await tx.wait();

            // expect(tx).to.emit(rewards, "ConfirmTransaction").withArgs(owner.address, 0);

            // tx = await jco_manager.confirmTxn_TGW(marketing.address, 0);
            // await tx.wait();

            // expect(tx).to.emit(marketing, "ConfirmTransaction").withArgs(owner.address, 0);

            // tx = await jco_manager.confirmTxn_TGW(staking.address, 0);
            // await tx.wait();

            // expect(tx).to.emit(staking, "ConfirmTransaction").withArgs(owner.address, 0);

            // tx = await jco_manager.confirmTxn_TGW(exchange.address, 0);
            // await tx.wait();

            // expect(tx).to.emit(exchange, "ConfirmTransaction").withArgs(owner.address, 0);
        });
    });
});
