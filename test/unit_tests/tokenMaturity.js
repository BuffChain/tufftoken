// SPDX-License-Identifier: agpl-3.0

const {expect} = require("chai");
const hre = require("hardhat");

const {BN, expectRevert} = require("@openzeppelin/test-helpers");
const {BigNumber, FixedNumber} = require("ethers");

const utils = require("../../utils/test_utils");
const {assertDepositToAave} = require("./aaveLPManager");
const {consts, UNISWAP_POOL_BASE_FEE, TOKEN_DAYS_UNTIL_MATURITY, TOKEN_DECIMALS, TOKEN_TOTAL_SUPPLY} = require("../../utils/consts");

describe('TokenMaturity', function () {

    const nowTimeStamp = Math.floor(Date.now() / 1000);

    let owner;
    let accounts;

    let tuffTokenDiamond;

    before(async function () {
        const {contractOwner} = await hre.getNamedAccounts();
        owner = await hre.ethers.getSigner(contractOwner);

        //Per `hardhat.config.ts`, the 0 and 1 index accounts are named accounts. They are reserved for deployment uses
        [, , ...accounts] = await hre.ethers.getSigners();
    });

    beforeEach(async function () {
        const {TuffTokenDiamond} = await hre.deployments.fixture();
        tuffTokenDiamond = await hre.ethers.getContractAt(TuffTokenDiamond.abi, TuffTokenDiamond.address, owner);
    });

    it('should get default token maturity', async () => {

        const latestBlock = await hre.ethers.provider.getBlock("latest")
        const latestTimestamp = latestBlock.timestamp;
        const secondsPerDay = 86400;

        const daysUntilMaturity = Math.ceil((parseInt(await tuffTokenDiamond.getContractMaturityTimestamp()) - latestTimestamp) / secondsPerDay);

        expect(daysUntilMaturity).to.equal(TOKEN_DAYS_UNTIL_MATURITY, "unexpected days until maturity");

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

        await tuffTokenDiamond.setIsTreasuryLiquidated(true);

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

    async function assertTokenMaturity() {

        const latestBlock = await hre.ethers.provider.getBlock("latest")
        const latestTimestamp = latestBlock.timestamp;

        await tuffTokenDiamond.setContractMaturityTimestamp(latestTimestamp);

        const isMatured = await tuffTokenDiamond.isTokenMatured(latestTimestamp);

        expect(isMatured).to.equal(true, "should have reached maturity");
    }

    async function assertSenderTransferSuccess(startingTuffTokenTotalSupply, desiredTuffTokenAmountLeftOver) {
        // Make transaction from first account to second.
        const sender = owner.address;
        const holder = accounts[0].address;

        const amount = (startingTuffTokenTotalSupply - desiredTuffTokenAmountLeftOver).toString();
        await tuffTokenDiamond.transfer(holder, amount, {from: sender});

        const senderTuffTokenBalanceAfterTransfer = parseFloat(await tuffTokenDiamond.balanceOf(sender));
        expect(senderTuffTokenBalanceAfterTransfer).to.equal(desiredTuffTokenAmountLeftOver,
            "Amount wasn't correctly sent to the receiver");
        return {sender, holder, senderTuffTokenBalanceAfterTransfer};
    }

    async function assertTokenRedemptionSuccess(
        desiredTuffTokenAmountLeftOver,
        startingTuffTokenTotalSupply,
        contractStartingEthBalance,
        sender,
        holder,
        senderTuffTokenBalanceAfterTransfer
    ) {
        const holderTuffTokenBalanceToTotalSupplyRatio = desiredTuffTokenAmountLeftOver / startingTuffTokenTotalSupply;
        const expectedETHRedemptionAmount = contractStartingEthBalance * holderTuffTokenBalanceToTotalSupplyRatio;

        let senderStartingEthBalance = await hre.ethers.provider.getBalance(sender);

        await expect(tuffTokenDiamond.redeem())
            .to.emit(tuffTokenDiamond, "Redeemed")
            .withArgs(sender, senderTuffTokenBalanceAfterTransfer, expectedETHRedemptionAmount);

        const senderEndingEthBalance = await hre.ethers.provider.getBalance(sender);

        //TODO: To be more precise, this test should assert that senderStartingEthBalance == senderEndingEthBalance + expectedETHRedemptionAmount
        // however, that is currently not the case
        expect(senderEndingEthBalance).to.be.lt(senderStartingEthBalance, "Sender did not successfully receive ETH");

        const senderTuffTokenBalanceAfterRedemption = parseFloat(await tuffTokenDiamond.balanceOf(sender));
        expect(senderTuffTokenBalanceAfterRedemption).to.equal(0,
            "Holder's balance was not reset");

        await expectRevert(tuffTokenDiamond.redeem(),
            "Address can only redeem once.");

        return expectedETHRedemptionAmount;
    }

    async function assertRedemptionFunctionValues(startingTuffTokenTotalSupply, contractStartingEthBalance) {
        const endingTuffTokenTotalSupplyForRedemption = await tuffTokenDiamond.totalSupplyForRedemption();
        expect(endingTuffTokenTotalSupplyForRedemption).to.equal(startingTuffTokenTotalSupply,
            "total supply used for redemption calculation should not have been affected by " +
            "holder redeeming (and burning) tokens");

        const currentContractStartingEthBalance = parseFloat(await tuffTokenDiamond.getContractStartingEthBalance());
        expect(currentContractStartingEthBalance.toString()).to.equal(contractStartingEthBalance.toString(),
            "starting contract eth balance used for redemption calculation should not be affected by redemption");
    }

    async function assertBalanceAndSupplyImpact(startingTuffTokenTotalSupply, desiredTuffTokenAmountLeftOver, contractStartingEthBalance, expectedETHRedemptionAmount) {
        const totalSupplyAfterBurn = parseFloat(await tuffTokenDiamond.totalSupply());

        expect(totalSupplyAfterBurn).to.equal(startingTuffTokenTotalSupply - desiredTuffTokenAmountLeftOver,
            "incorrect total supply after burn");

        const currentContractEthBalance = parseFloat(await tuffTokenDiamond.getCurrentContractEthBalance());
        expect(currentContractEthBalance.toString()).to.equal((contractStartingEthBalance - expectedETHRedemptionAmount).toString(),
            "actual eth balance should be lower than before redemption");
    }

    it('should handle token reaching maturity and holders redeeming', async () => {
        await assertTokenMaturity();

        let isLiquidated = await tuffTokenDiamond.getIsTreasuryLiquidated();
        expect(isLiquidated).to.equal(false, "should not have been liquidated");

        const tuffTokenTotalSupply = await tuffTokenDiamond.totalSupply();
        const startingOwnerTuffBal = await tuffTokenDiamond.balanceOf(owner.address);
        const contractStartingEthBalance = await tuffTokenDiamond.getCurrentContractEthBalance();

        await expect(tuffTokenDiamond.onTokenMaturity())
            .to.emit(tuffTokenDiamond, "TokenMatured")
            .withArgs(new BN(contractStartingEthBalance.toString()), new BN(tuffTokenTotalSupply.toString()));

        isLiquidated = await tuffTokenDiamond.getIsTreasuryLiquidated();
        expect(isLiquidated).to.equal(true, "should have been liquidated");

        const desiredTuffTokenAmountLeftOver = 100000 * 10 ** TOKEN_DECIMALS;
        const {sender, holder, senderTuffTokenBalanceAfterTransfer} = await assertSenderTransferSuccess(
            startingOwnerTuffBal,
            desiredTuffTokenAmountLeftOver
        );
        const expectedETHRedemptionAmount = await assertTokenRedemptionSuccess(
            desiredTuffTokenAmountLeftOver,
            tuffTokenTotalSupply,
            contractStartingEthBalance,
            sender,
            holder,
            senderTuffTokenBalanceAfterTransfer
        );

        await assertRedemptionFunctionValues(tuffTokenTotalSupply, contractStartingEthBalance);

        await assertBalanceAndSupplyImpact(
            tuffTokenTotalSupply,
            desiredTuffTokenAmountLeftOver,
            contractStartingEthBalance,
            expectedETHRedemptionAmount
        );

        // allow a re-run
        await tuffTokenDiamond.onTokenMaturity();
    });

    it('should liquidate treasury', async () => {
        const daiContract = await utils.getDAIContract();
        const adaiContract = await utils.getADAIContract();
        const weth9Contract = await utils.getWETH9Contract();

        await utils.sendTokensToAddr(accounts.at(-1), tuffTokenDiamond.address);

        // deposits DAI to Aave
        await assertDepositToAave(tuffTokenDiamond);

        const ethBalanceAfterDeposit = await hre.ethers.provider.getBalance(tuffTokenDiamond.address);
        const wethBalanceAfterDeposit = await weth9Contract.balanceOf(tuffTokenDiamond.address);
        const daiBalanceAfterDeposit = await daiContract.balanceOf(tuffTokenDiamond.address);
        const aDaiBalanceAfterDeposit = await adaiContract.balanceOf(tuffTokenDiamond.address);

        const liquidationTxResponse = await tuffTokenDiamond.liquidateTreasury();
        const liquidationTxReceipt = await liquidationTxResponse.wait();
        const liquidationTxGasCost = liquidationTxReceipt.gasUsed.mul(liquidationTxReceipt.effectiveGasPrice);

        const daiWethQuote = await utils.getUniswapPriceQuote(
            consts("DAI_ADDR"),
            consts("WETH9_ADDR"),
            UNISWAP_POOL_BASE_FEE,
            60
        );

        const daiToWethConversion = daiBalanceAfterDeposit * daiWethQuote;
        const aDaiToWethConversion = aDaiBalanceAfterDeposit * daiWethQuote;

        const ethBalanceAfterLiquidation = await hre.ethers.provider.getBalance(tuffTokenDiamond.address);
        const wethBalanceAfterLiquidation = await weth9Contract.balanceOf(tuffTokenDiamond.address);
        const daiBalanceAfterLiquidation = await daiContract.balanceOf(tuffTokenDiamond.address);
        const adaiBalanceAfterLiquidation = await adaiContract.balanceOf(tuffTokenDiamond.address);

        expect(daiBalanceAfterLiquidation).to.equal(0, "DAI should have been liquidated");
        expect(adaiBalanceAfterLiquidation).to.equal(0, "ADAI should have been liquidated");
        expect(wethBalanceAfterLiquidation).to.equal(0, "WETH should have been unwrapped");
        expect(ethBalanceAfterLiquidation).to.be.gt(ethBalanceAfterDeposit.add(wethBalanceAfterDeposit),
            "unexpected ETH balance");

        const expectedEth =
            BigInt(daiToWethConversion) +
            BigInt(aDaiToWethConversion) +
            BigInt(wethBalanceAfterDeposit) +
            BigInt(ethBalanceAfterDeposit) -
            BigInt(liquidationTxGasCost);

        //TODO: This buffer is likely from the poolFee that uniswap charges, this test needs to be updated to account
        // for that
        const buffer = hre.ethers.utils.parseEther('0.03');
        const ethDiff = BigNumber.from(expectedEth).sub(ethBalanceAfterLiquidation);
        expect(ethDiff).to.be.lte(buffer, "eth difference exceeds allowed buffer");

        if (hre.hardhatArguments.verbose) {
            console.log(`starting amount of ETH:                       ${hre.ethers.utils.formatEther(ethBalanceAfterDeposit.toString())}`);
            console.log(`starting amount of WETH:                       ${hre.ethers.utils.formatEther(wethBalanceAfterDeposit.toString())}`);
            console.log(`expected amount of WETH from DAI swap:          ${hre.ethers.utils.formatEther(daiToWethConversion.toString())}`);
            console.log(`expected amount of WETH from ADAI swap:         ${hre.ethers.utils.formatEther(aDaiToWethConversion.toString())}`);

            console.log('--------------------------------------');

            console.log(`expected amount of ETH after swaps and unwrapping WETH:   ${hre.ethers.utils.formatEther(expectedEth.toString())}`);
            console.log(`actual amount of ETH after swaps and unwrapping WETH:     ${hre.ethers.utils.formatEther(ethBalanceAfterLiquidation.toString())}`);
            console.log(`difference from expected to actual:                         ${hre.ethers.utils.formatEther(ethDiff.toString())}`);
        }
    });
});
