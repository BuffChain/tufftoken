// SPDX-License-Identifier: agpl-3.0

const {expect} = require("chai");
const hre = require("hardhat");

const utils = require("../../utils/test_utils");
const {BN, expectRevert} = require("@openzeppelin/test-helpers");
const {consts} = require("../../utils/consts");

describe('TokenMaturity', function () {

    const nowTimeStamp = Math.floor(Date.now() / 1000);

    let owner;
    let accounts;

    let tuffTokenDiamond;

    before(async function () {
        const {contractOwner} = await hre.getNamedAccounts();
        owner = await hre.ethers.getSigner(contractOwner);

        //Per `hardhat.config.js`, the 0 and 1 index accounts are named accounts. They are reserved for deployment uses
        [, , ...accounts] = await hre.ethers.getSigners();

    });

    beforeEach(async function () {
        const {TuffTokenDiamond} = await hre.deployments.fixture();
        tuffTokenDiamond = await hre.ethers.getContractAt(TuffTokenDiamond.abi, TuffTokenDiamond.address, owner);

        const fromAccount = owner;
        const toAddr = TuffTokenDiamond.address;
        const amount = "100";
        await utils.transferETH(
            fromAccount,
            toAddr,
            amount
        )
    });


    it('should set token maturity', async () => {

        await tuffTokenDiamond.setContractMaturityTimestamp(nowTimeStamp);

        let isMatured = await tuffTokenDiamond.isTokenMatured(nowTimeStamp - 1);

        expect(isMatured).to.equal(false, "should not have reached maturity");

        isMatured = await tuffTokenDiamond.isTokenMatured(nowTimeStamp);

        expect(isMatured).to.equal(true, "should have reached maturity");

    });

    it('should get treasury liquidation status', async () => {

        let isLiquidated = await tuffTokenDiamond.getIsTreasuryLiquidated();

        expect(isLiquidated).to.equal(false, "should not have been liquidated");

        await tuffTokenDiamond.liquidateTreasury();

        isLiquidated = await tuffTokenDiamond.getIsTreasuryLiquidated();

        expect(isLiquidated).to.equal(true, "should have been liquidated");

    });


    it('should get token supply', async () => {

        let totalSupply = parseFloat(await tuffTokenDiamond.totalSupply());

        const expectedStartingSupply = 1000000000 * 10 ** 9;

        expect(totalSupply).to.equal(expectedStartingSupply, "incorrect totalSupply");

        let totalSupplyForRedemption = parseFloat(await tuffTokenDiamond.totalSupplyForRedemption());

        expect(totalSupplyForRedemption).to.equal(totalSupply, "incorrect totalSupply");

        await tuffTokenDiamond.setTotalSupplyForRedemption("" + (expectedStartingSupply - 1))

        totalSupplyForRedemption = parseFloat(await tuffTokenDiamond.totalSupplyForRedemption());

        expect(totalSupplyForRedemption).to.equal(expectedStartingSupply - 1, "incorrect totalSupply");

    });

    it('should get token eth balance', async () => {

        let startingEthBalance = await tuffTokenDiamond.getContractStartingEthBalance();

        expect(startingEthBalance).to.equal(0, "incorrect starting balance");

        await tuffTokenDiamond.setContractStartingEthBalance(100);

        startingEthBalance = await tuffTokenDiamond.getContractStartingEthBalance();

        expect(startingEthBalance).to.equal(100, "incorrect starting balance");

    });

    it('should handle token reaching maturity and holders redeeming', async () => {

        const latestBlock = await hre.ethers.provider.getBlock("latest")
        const latestTimestamp = latestBlock.timestamp;

        await tuffTokenDiamond.setContractMaturityTimestamp(latestTimestamp);

        const isMatured = await tuffTokenDiamond.isTokenMatured(latestTimestamp);

        expect(isMatured).to.equal(true, "should have reached maturity");

        let isLiquidated = await tuffTokenDiamond.getIsTreasuryLiquidated();

        expect(isLiquidated).to.equal(false, "should not have been liquidated");

        const startingTotalSupply = parseFloat(await tuffTokenDiamond.totalSupply());

        const supplyNoDecimals = 1000000000;

        expect(startingTotalSupply).to.equal(supplyNoDecimals * 10**9, "incorrect total supply");

        const startingEthBalance = await tuffTokenDiamond.getCurrentContractEthBalance();

        await expect(tuffTokenDiamond.onTokenMaturity())
            .to.emit(tuffTokenDiamond, "TokenMatured")
            .withArgs(new BN(startingEthBalance.toString()), new BN(startingTotalSupply.toString()));

        isLiquidated = await tuffTokenDiamond.getIsTreasuryLiquidated();

        expect(isLiquidated).to.equal(true, "should have been liquidated");

        // Make transaction from first account to second.
        const sender = owner.address;
        const holder = accounts[0].address;

        const senderStartingBalance = parseFloat(await tuffTokenDiamond.balanceOf(sender));
        expect(senderStartingBalance).to.equal(startingTotalSupply,
            "Sender should have total supply to start.");

        const desiredAmountLeftOver = 100000 * 10 ** 9
        const amount = (startingTotalSupply - desiredAmountLeftOver).toString(); // 100000 TUFF left
        await tuffTokenDiamond.transfer(holder, amount, {from: sender});

        const senderBalanceAfterTransfer = parseFloat(await tuffTokenDiamond.balanceOf(sender));
        expect(senderBalanceAfterTransfer).to.equal(desiredAmountLeftOver,
            "Amount wasn't correctly sent to the receiver");

        const holderBalanceToTotalSupplyRatio = desiredAmountLeftOver / startingTotalSupply;
        const expectedRedemptionAmount = startingEthBalance * holderBalanceToTotalSupplyRatio;

        let senderStartingEthBalance = await hre.ethers.provider.getBalance(sender);

        await expect(tuffTokenDiamond.redeem())
            .to.emit(tuffTokenDiamond, "Redeemed")
            .withArgs(sender, new BN(senderBalanceAfterTransfer.toString()), new BN(expectedRedemptionAmount.toString()));

        const senderEndingEthBalance = await hre.ethers.provider.getBalance(sender);

        expect(senderEndingEthBalance > senderStartingEthBalance).to.equal(true,
            "Holder did not successfully receive ETH");

        const senderBalanceAfterRedemption = parseFloat(await tuffTokenDiamond.balanceOf(sender));
        expect(senderBalanceAfterRedemption).to.equal(0,
            "Holder's balance was not reset");

        const totalSupplyAfterBurn = parseFloat(await tuffTokenDiamond.totalSupply());

        expect(totalSupplyAfterBurn).to.equal(startingTotalSupply - desiredAmountLeftOver,
            "incorrect total supply after burn");

        await expectRevert(tuffTokenDiamond.redeem(),
            "Address can only redeem once.");

        const endingTotalSupplyForRedemption = parseFloat(await tuffTokenDiamond.totalSupplyForRedemption());
        expect(endingTotalSupplyForRedemption).to.equal(startingTotalSupply,
            "total supply used for redemption calculation should not have been affected by " +
            "holder redeeming (and burning) tokens");

        const currentContractStartingEthBalance = parseFloat(await tuffTokenDiamond.getContractStartingEthBalance());
        expect(currentContractStartingEthBalance.toString()).to.equal(startingEthBalance.toString(),
            "starting contract eth balance used for redemption calculation should not be affected by redemption");

        const currentContractEthBalance = parseFloat(await tuffTokenDiamond.getCurrentContractEthBalance());
        expect(currentContractEthBalance.toString()).to.equal((startingEthBalance - expectedRedemptionAmount).toString(),
            "actual eth balance should be lower than before redemption");

    });

});
