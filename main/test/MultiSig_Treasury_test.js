// Import necessary modules and contracts
const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("MultiSig_Treasury Contract", function () {
    let JCO, jco, Fundraising, fundraising, accounts, jco_Manager;

    beforeEach(async function () {
        this.timeout(10000);
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

        await treasury.approveOtherContract(jco.address, multisig.address, 250_000_000);
    });

    describe("Deployment", function () {
        it("Should assign the manager", async function () {
            expect(await multisig.manager()).to.equal(jco_manager.address);
        });

        it("Should set the owners", async function () {
            expect(await jco_manager.getOwners_OW()).to.eql(accounts);
        });

        it("should set correct transaction count", async function () {
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
        it("Should confirm and execute transaction with current release time", async function () {
            // await ethers.provider.send("evm_increaseTime", [864000]);
            await jco_manager.connect(account1).confirmTxn_TGW(fundraising.address, 0);
            await jco_manager.connect(account2).confirmTxn_TGW(fundraising.address, 0);
            await jco_manager.executeTxn_TGW(fundraising.address, 0);
            expect(await jco.balanceOf(fundraising.address)).to.equal(
                ethers.BigNumber.from("5960000" + "000000000000000000")
            );

            await jco_manager.connect(account1).confirmTxn_TGW(rewards.address, 0);
            await jco_manager.connect(account2).confirmTxn_TGW(rewards.address, 0);
            await jco_manager.executeTxn_TGW(rewards.address, 0);
            expect(await jco.balanceOf(rewards.address)).to.equal(
                ethers.BigNumber.from("1150000" + "000000000000000000")
            );

            await jco_manager.connect(account1).confirmTxn_TGW(marketing.address, 0);
            await jco_manager.connect(account2).confirmTxn_TGW(marketing.address, 0);
            await jco_manager.executeTxn_TGW(marketing.address, 0);
            expect(await jco.balanceOf(marketing.address)).to.equal(
                ethers.BigNumber.from("15000000" + "000000000000000000")
            );

            await jco_manager.connect(account1).confirmTxn_TGW(staking.address, 0);
            await jco_manager.connect(account2).confirmTxn_TGW(staking.address, 0);
            await jco_manager.executeTxn_TGW(staking.address, 0);
            expect(await jco.balanceOf(staking.address)).to.equal(
                ethers.BigNumber.from("12500000" + "000000000000000000")
            );

            await jco_manager.connect(account1).confirmTxn_TGW(exchange.address, 0);
            await jco_manager.connect(account2).confirmTxn_TGW(exchange.address, 0);
            await jco_manager.executeTxn_TGW(exchange.address, 0);
            expect(await jco.balanceOf(exchange.address)).to.equal(
                ethers.BigNumber.from("25000000" + "000000000000000000")
            );
        });

        it("Should confirm and execute transaction with release time 3 months or 90 days ahead", async function () {
            await ethers.provider.send("evm_increaseTime", [86400 * 90]);
            await ethers.provider.send("evm_mine", []);

            await jco_manager.connect(account1).confirmTxn_TGW(fundraising.address, 1);
            await jco_manager.connect(account2).confirmTxn_TGW(fundraising.address, 1);
            await jco_manager.executeTxn_TGW(fundraising.address, 1);

            expect(await jco.balanceOf(fundraising.address)).to.equal(
                ethers.BigNumber.from((3960000).toString() + "000000000000000000")
            );

            await jco_manager.connect(account1).confirmTxn_TGW(rewards.address, 1);
            await jco_manager.connect(account2).confirmTxn_TGW(rewards.address, 1);
            await jco_manager.executeTxn_TGW(rewards.address, 1);

            expect(await jco.balanceOf(rewards.address)).to.equal(
                ethers.BigNumber.from((1150000).toString() + "000000000000000000")
            );

            await jco_manager.connect(account1).confirmTxn_TGW(staking.address, 1);
            await jco_manager.connect(account2).confirmTxn_TGW(staking.address, 1);
            await jco_manager.executeTxn_TGW(staking.address, 1);

            expect(await jco.balanceOf(staking.address)).to.equal(
                ethers.BigNumber.from((12500000).toString() + "000000000000000000")
            );
        });

        it("Should confirm and execute transaction with release time 6 months or 182 days ahead", async function () {
            await ethers.provider.send("evm_increaseTime", [86400 * 182]);
            await ethers.provider.send("evm_mine", []);

            await jco_manager.connect(account1).confirmTxn_TGW(fundraising.address, 2);
            await jco_manager.connect(account2).confirmTxn_TGW(fundraising.address, 2);
            await jco_manager.executeTxn_TGW(fundraising.address, 2);
            expect(await jco.balanceOf(fundraising.address)).to.equal(
                ethers.BigNumber.from((5710000).toString() + "000000000000000000")
            );

            await jco_manager.connect(account1).confirmTxn_TGW(rewards.address, 2);
            await jco_manager.connect(account2).confirmTxn_TGW(rewards.address, 2);
            await jco_manager.executeTxn_TGW(rewards.address, 2);
            expect(await jco.balanceOf(rewards.address)).to.equal(
                ethers.BigNumber.from((1150000).toString() + "000000000000000000")
            );

            await jco_manager.connect(account1).confirmTxn_TGW(marketing.address, 1);
            await jco_manager.connect(account2).confirmTxn_TGW(marketing.address, 1);
            await jco_manager.executeTxn_TGW(marketing.address, 1);
            expect(await jco.balanceOf(marketing.address)).to.equal(
                ethers.BigNumber.from((15000000).toString() + "000000000000000000")
            );

            await jco_manager.connect(account1).confirmTxn_TGW(staking.address, 2);
            await jco_manager.connect(account2).confirmTxn_TGW(staking.address, 2);
            await jco_manager.executeTxn_TGW(staking.address, 2);
            expect(await jco.balanceOf(staking.address)).to.equal(
                ethers.BigNumber.from((12500000).toString() + "000000000000000000")
            );

            await jco_manager.connect(account1).confirmTxn_TGW(foundation.address, 0);
            await jco_manager.connect(account2).confirmTxn_TGW(foundation.address, 0);
            await jco_manager.executeTxn_TGW(foundation.address, 0);
            expect(await jco.balanceOf(foundation.address)).to.equal(
                ethers.BigNumber.from((7500000).toString() + "000000000000000000")
            );
        });

        it("Should confirm and execute transaction with release time 9 months or 273 days ahead", async function () {
            await ethers.provider.send("evm_increaseTime", [86400 * 273]);
            await ethers.provider.send("evm_mine", []);

            await jco_manager.connect(account1).confirmTxn_TGW(fundraising.address, 3);
            await jco_manager.connect(account2).confirmTxn_TGW(fundraising.address, 3);
            await jco_manager.executeTxn_TGW(fundraising.address, 3);
            expect(await jco.balanceOf(fundraising.address)).to.equal(
                ethers.BigNumber.from((5710000).toString() + "000000000000000000")
            );

            await jco_manager.connect(account1).confirmTxn_TGW(rewards.address, 3);
            await jco_manager.connect(account2).confirmTxn_TGW(rewards.address, 3);
            await jco_manager.executeTxn_TGW(rewards.address, 3);
            expect(await jco.balanceOf(rewards.address)).to.equal(
                ethers.BigNumber.from((1150000).toString() + "000000000000000000")
            );

            await jco_manager.connect(account1).confirmTxn_TGW(staking.address, 3);
            await jco_manager.connect(account2).confirmTxn_TGW(staking.address, 3);
            await jco_manager.executeTxn_TGW(staking.address, 3);
            expect(await jco.balanceOf(staking.address)).to.equal(
                ethers.BigNumber.from((12500000).toString() + "000000000000000000")
            );
        });

        it("Should confirm and execute transaction with release time 12 months or 365 days ahead", async function () {
            await ethers.provider.send("evm_increaseTime", [86400 * 365]);
            await ethers.provider.send("evm_mine", []);

            await jco_manager.connect(account1).confirmTxn_TGW(fundraising.address, 4);
            await jco_manager.connect(account2).confirmTxn_TGW(fundraising.address, 4);
            await jco_manager.executeTxn_TGW(fundraising.address, 4);
            expect(await jco.balanceOf(fundraising.address)).to.equal(
                ethers.BigNumber.from((3960000).toString() + "000000000000000000")
            );

            await jco_manager.connect(account1).confirmTxn_TGW(team.address, 0);
            await jco_manager.connect(account2).confirmTxn_TGW(team.address, 0);
            await jco_manager.executeTxn_TGW(team.address, 0);
            expect(await jco.balanceOf(team.address)).to.equal(
                ethers.BigNumber.from((6000000).toString() + "000000000000000000")
            );

            await jco_manager.connect(account1).confirmTxn_TGW(advisors.address, 0);
            await jco_manager.connect(account2).confirmTxn_TGW(advisors.address, 0);
            await jco_manager.executeTxn_TGW(advisors.address, 0);
            expect(await jco.balanceOf(advisors.address)).to.equal(
                ethers.BigNumber.from((5000000).toString() + "000000000000000000")
            );

            await jco_manager.connect(account1).confirmTxn_TGW(staking.address, 4);
            await jco_manager.connect(account2).confirmTxn_TGW(staking.address, 4);
            await jco_manager.executeTxn_TGW(staking.address, 4);
            expect(await jco.balanceOf(staking.address)).to.equal(
                ethers.BigNumber.from((12500000).toString() + "000000000000000000")
            );

            await jco_manager.connect(account1).confirmTxn_TGW(foundation.address, 1);
            await jco_manager.connect(account2).confirmTxn_TGW(foundation.address, 1);
            await jco_manager.executeTxn_TGW(foundation.address, 1);
            expect(await jco.balanceOf(foundation.address)).to.equal(
                ethers.BigNumber.from((7500000).toString() + "000000000000000000")
            );
        });

        it("Should confirm and execute transaction with release time 15 months or 456 days ahead", async function () {
            await ethers.provider.send("evm_increaseTime", [86400 * 456]);
            await ethers.provider.send("evm_mine", []);

            await jco_manager.connect(account1).confirmTxn_TGW(fundraising.address, 5);
            await jco_manager.connect(account2).confirmTxn_TGW(fundraising.address, 5);
            await jco_manager.executeTxn_TGW(fundraising.address, 5);
            expect(await jco.balanceOf(fundraising.address)).to.equal(
                ethers.BigNumber.from((5710000).toString() + "000000000000000000")
            );
        });

        it("Should confirm and execute transaction with release time 18 months or 547 days ahead", async function () {
            await ethers.provider.send("evm_increaseTime", [86400 * 547]);
            await ethers.provider.send("evm_mine", []);

            await jco_manager.connect(account1).confirmTxn_TGW(fundraising.address, 6);
            await jco_manager.connect(account2).confirmTxn_TGW(fundraising.address, 6);
            await jco_manager.executeTxn_TGW(fundraising.address, 6);
            expect(await jco.balanceOf(fundraising.address)).to.equal(
                ethers.BigNumber.from((4390000).toString() + "000000000000000000")
            );

            await jco_manager.connect(account1).confirmTxn_TGW(team.address, 1);
            await jco_manager.connect(account2).confirmTxn_TGW(team.address, 1);
            await jco_manager.executeTxn_TGW(team.address, 1);
            expect(await jco.balanceOf(team.address)).to.equal(
                ethers.BigNumber.from((6000000).toString() + "000000000000000000")
            );

            await jco_manager.connect(account1).confirmTxn_TGW(marketing.address, 2);
            await jco_manager.connect(account2).confirmTxn_TGW(marketing.address, 2);
            await jco_manager.executeTxn_TGW(marketing.address, 2);
            expect(await jco.balanceOf(marketing.address)).to.equal(
                ethers.BigNumber.from((12500000).toString() + "000000000000000000")
            );

            await jco_manager.connect(account1).confirmTxn_TGW(staking.address, 5);
            await jco_manager.connect(account2).confirmTxn_TGW(staking.address, 5);
            await jco_manager.executeTxn_TGW(staking.address, 5);
            expect(await jco.balanceOf(staking.address)).to.equal(
                ethers.BigNumber.from((12500000).toString() + "000000000000000000")
            );

            await jco_manager.connect(account1).confirmTxn_TGW(foundation.address, 2);
            await jco_manager.connect(account2).confirmTxn_TGW(foundation.address, 2);
            await jco_manager.executeTxn_TGW(foundation.address, 2);
            expect(await jco.balanceOf(foundation.address)).to.equal(
                ethers.BigNumber.from((7500000).toString() + "000000000000000000")
            );
        });

        it("Should confirm and execute transaction with release time 24 months or 730 days ahead", async function () {
            await ethers.provider.send("evm_increaseTime", [86400 * 730]);
            await ethers.provider.send("evm_mine", []);

            await jco_manager.connect(account1).confirmTxn_TGW(team.address, 2);
            await jco_manager.connect(account2).confirmTxn_TGW(team.address, 2);
            await jco_manager.executeTxn_TGW(team.address, 2);
            expect(await jco.balanceOf(team.address)).to.equal(
                ethers.BigNumber.from((8000000).toString() + "000000000000000000")
            );

            await jco_manager.connect(account1).confirmTxn_TGW(advisors.address, 1);
            await jco_manager.connect(account2).confirmTxn_TGW(advisors.address, 1);
            await jco_manager.executeTxn_TGW(advisors.address, 1);
            expect(await jco.balanceOf(advisors.address)).to.equal(
                ethers.BigNumber.from((5000000).toString() + "000000000000000000")
            );

            await jco_manager.connect(account1).confirmTxn_TGW(staking.address, 6);
            await jco_manager.connect(account2).confirmTxn_TGW(staking.address, 6);
            await jco_manager.executeTxn_TGW(staking.address, 6);
            expect(await jco.balanceOf(staking.address)).to.equal(
                ethers.BigNumber.from((12500000).toString() + "000000000000000000")
            );
        });

        it("Should confirm and execute transaction with release time 36 months or 1095 days ahead", async function () {
            await ethers.provider.send("evm_increaseTime", [86400 * 1095]);
            await ethers.provider.send("evm_mine", []);

            await jco_manager.connect(account1).confirmTxn_TGW(advisors.address, 2);
            await jco_manager.connect(account2).confirmTxn_TGW(advisors.address, 2);
            await jco_manager.executeTxn_TGW(advisors.address, 2);
            expect(await jco.balanceOf(advisors.address)).to.equal(
                ethers.BigNumber.from((2500000).toString() + "000000000000000000")
            );
        });
    });
});
