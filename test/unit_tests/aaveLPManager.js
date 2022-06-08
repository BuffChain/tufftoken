// SPDX-License-Identifier: agpl-3.0

const {expect} = require("chai");
const {
    BN,           // Big Number support
    constants,    // Common constants, like the zero address and largest integers
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');
const hre = require("hardhat");

const utils = require("../../utils/test_utils");
const {consts} = require("../../utils/consts");
const {BigNumber} = require("ethers");

/**
 * Deposit all supported tokens to Aave per the percentages configured
 * @param tuffVBTDiamond: tuffVBTDiamond contract
 * @param totalDepositAmt: total amount of tokens that will be deposited
 * @returns {Promise<void>}
 */
async function depositTokensToAaveEvenly(tuffVBTDiamond, totalDepositAmt=8000) {
    const daiDepositAmt = (totalDepositAmt / 2).toString();     //50%
    const usdcDepositAmt = (totalDepositAmt / 4).toString();    //25%
    const usdtDepositAmt = (totalDepositAmt / 4).toString();    //25%

    const {startERC20Qty: startDAIQty} = await utils.assertDepositERC20ToAave(tuffVBTDiamond, consts("DAI_ADDR"),
        hre.ethers.utils.parseEther(daiDepositAmt), true);
    const {startERC20Qty: startUSDCQty} = await utils.assertDepositERC20ToAave(tuffVBTDiamond, consts("USDC_ADDR"),
        hre.ethers.utils.parseUnits(usdcDepositAmt, 6), true);
    const {startERC20Qty: startUSDTQty} = await utils.assertDepositERC20ToAave(tuffVBTDiamond, consts("USDT_ADDR"),
        hre.ethers.utils.parseUnits(usdtDepositAmt, 6), true);

    return {startDAIQty, startUSDCQty, startUSDTQty}
}

describe('AaveLPManager', function () {
    let owner;
    let accounts;

    let tuffVBTDiamond;

    before(async function () {
        const {contractOwner} = await hre.getNamedAccounts();
        owner = await hre.ethers.getSigner(contractOwner);

        //Per `hardhat.config.ts`, the 0 and 1 index accounts are named accounts. They are reserved for deployment uses
        [, , ...accounts] = await hre.ethers.getSigners();
    });

    beforeEach(async function () {
        const {tDUU} = await hre.deployments.fixture();
        tuffVBTDiamond = await hre.ethers.getContractAt(tDUU.abi, tDUU.address, owner);

        await utils.sendTokensToAddr(accounts.at(-1), tuffVBTDiamond.address);
    });

    it('should be initialized', async () => {
        const isAaveInit = await tuffVBTDiamond.isAaveInit();
        expect(isAaveInit).to.be.true;
    });

    it('should set pool address correctly', async () => {
        const address = await tuffVBTDiamond.getAaveLPAddr();

        //The correct address is pulled from https://docs.aave.com/developers/deployed-contracts/deployed-contracts
        expect(address).to.equal("0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9");
    });

    it('should get the correct aDai address', async () => {
        const tokenAddr = consts("DAI_ADDR");
        const aTokenAddr = await tuffVBTDiamond.getATokenAddress(tokenAddr);
        expect(aTokenAddr).to.equal(consts("ADAI_ADDR"));
    });

    it('should get the correct aUSDC address', async () => {
        const tokenAddr = consts("USDC_ADDR");
        const aTokenAddr = await tuffVBTDiamond.getATokenAddress(tokenAddr);
        expect(aTokenAddr).to.equal(consts("AUSDC_ADDR"));
    });

    it('should get the correct aUSDT address', async () => {
        const tokenAddr = consts("USDT_ADDR");
        const aTokenAddr = await tuffVBTDiamond.getATokenAddress(tokenAddr);
        expect(aTokenAddr).to.equal(consts("AUSDT_ADDR"));
    });

    it('should have the correct tokens supported at launch', async () => {
        const supportedTokens = await tuffVBTDiamond.getAllAaveSupportedTokens();
        expect(supportedTokens.length).to.equal(3);

        expect(supportedTokens).to.contain(consts("DAI_ADDR"));
        let actualTokenTargetPercent = await tuffVBTDiamond.getAaveTokenTargetedPercentage(consts("DAI_ADDR"));
        expect(actualTokenTargetPercent).to.equal(5000);

        expect(supportedTokens).to.contain(consts("USDC_ADDR"));
        actualTokenTargetPercent = await tuffVBTDiamond.getAaveTokenTargetedPercentage(consts("USDC_ADDR"));
        expect(actualTokenTargetPercent).to.equal(2500);

        expect(supportedTokens).to.contain(consts("USDT_ADDR"));
        actualTokenTargetPercent = await tuffVBTDiamond.getAaveTokenTargetedPercentage(consts("USDT_ADDR"));
        expect(actualTokenTargetPercent).to.equal(2500);
    });

    it('should add a token and update total token weight', async () => {
        const tokenAddr = consts("WETH9_ADDR");
        const chainlinkEthTokenAggrAddr = consts("CHAINLINK_ETH_DAI_AGGR_ADDR");
        const tokenWeight = 2500;

        let actualTotalTargetWeight = await tuffVBTDiamond.getAaveTotalTargetWeight();
        const expectedTotalTargetWeight = actualTotalTargetWeight.add(tokenWeight);

        let supportedTokens = await tuffVBTDiamond.getAllAaveSupportedTokens();
        expect(supportedTokens.length).to.equal(3);
        expect(supportedTokens).to.not.contain(tokenAddr);

        await tuffVBTDiamond.addAaveSupportedToken(tokenAddr, chainlinkEthTokenAggrAddr, tokenWeight);

        supportedTokens = await tuffVBTDiamond.getAllAaveSupportedTokens();
        expect(supportedTokens.length).to.equal(4);
        expect(supportedTokens).to.contain(tokenAddr);

        actualTotalTargetWeight = await tuffVBTDiamond.getAaveTotalTargetWeight();
        expect(actualTotalTargetWeight).to.equal(expectedTotalTargetWeight);
    });

    it('should remove a token and update total token weight', async () => {
        const tokenAddr = consts("DAI_ADDR");
        let actualTotalTargetWeight = await tuffVBTDiamond.getAaveTotalTargetWeight();
        let actualTokenTargetPercent = await tuffVBTDiamond.getAaveTokenTargetedPercentage(tokenAddr);
        const expectedTotalTargetWeight = actualTotalTargetWeight.sub(actualTokenTargetPercent);

        let supportedTokens = await tuffVBTDiamond.getAllAaveSupportedTokens();
        expect(supportedTokens.length).to.equal(3);
        expect(supportedTokens).to.contain(tokenAddr);

        await tuffVBTDiamond.removeAaveSupportedToken(tokenAddr);

        supportedTokens = await tuffVBTDiamond.getAllAaveSupportedTokens();
        expect(supportedTokens.length).to.equal(2);
        expect(supportedTokens).to.not.contain(tokenAddr);

        actualTotalTargetWeight = await tuffVBTDiamond.getAaveTotalTargetWeight();
        expect(actualTotalTargetWeight).to.equal(expectedTotalTargetWeight);
    });

    it('should update a tokens target weight and total token weight', async () => {
        const tokenAddr = consts("DAI_ADDR");
        let actualTotalTargetWeight = await tuffVBTDiamond.getAaveTotalTargetWeight();
        let actualTokenTargetPercent = await tuffVBTDiamond.getAaveTokenTargetedPercentage(tokenAddr);
        expect(actualTokenTargetPercent).to.equal(5000);

        const expectedTotalTargetWeight = actualTotalTargetWeight.add(actualTokenTargetPercent);
        const expectedTargetPercentage = actualTokenTargetPercent.add(actualTokenTargetPercent);
        await tuffVBTDiamond.setAaveTokenTargetedPercentage(tokenAddr, expectedTargetPercentage);

        actualTokenTargetPercent = await tuffVBTDiamond.getAaveTokenTargetedPercentage(tokenAddr);
        expect(actualTokenTargetPercent).to.equal(expectedTargetPercentage);

        actualTotalTargetWeight = await tuffVBTDiamond.getAaveTotalTargetWeight();
        expect(actualTotalTargetWeight).to.equal(expectedTotalTargetWeight);
    });

    it('reverts if adding an unsupported aave token', async () => {
        await expectRevert(tuffVBTDiamond.addAaveSupportedToken(
            consts("UNISWAP_V3_ROUTER_ADDR"), consts("UNISWAP_V3_ROUTER_ADDR"), 2500),
            "The tokenAddress provided is not supported by Aave");
    });

    it("should get correct aToken balance", async () => {
        const tokenAddr = consts("DAI_ADDR");
        const adaiContract = await utils.getADAIContract();

        //First, confirm we have no aToken
        let startingATokenBal = await tuffVBTDiamond.getATokenBalance(tokenAddr);
        expect(new BN(startingATokenBal.toString())).to.be.bignumber.equal(new BN("0"));
        startingATokenBal = await adaiContract.balanceOf(tuffVBTDiamond.address);
        expect(new BN(startingATokenBal.toString())).to.be.bignumber.equal(new BN("0"));

        //Then, deposit DAI into Aave, which gives us aDAI
        const qtyInDAI = hre.ethers.utils.parseEther("2000");
        await utils.assertDepositERC20ToAave(tuffVBTDiamond, tokenAddr, qtyInDAI, true);

        //Lastly, assert that aToken was properly given
        let endingATokenBal = await tuffVBTDiamond.getATokenBalance(tokenAddr);
        expect(new BN(endingATokenBal.toString())).to.be.bignumber.equal(new BN(qtyInDAI.toString()));
        endingATokenBal = await adaiContract.balanceOf(tuffVBTDiamond.address);
        expect(new BN(endingATokenBal.toString())).to.be.bignumber.equal(new BN(qtyInDAI.toString()));
    });

    it("should deposit and withdraw dai to/from aave and TuffVBT's wallet", async () => {
        const daiContract = await utils.getDAIContract();
        const aDAIContract = await utils.getADAIContract();

        //First, deposit and assert tokens were transferred
        const {startERC20Qty: startDaiQty} = await utils.assertDepositERC20ToAave(tuffVBTDiamond, daiContract.address);

        //Then, withdraw
        await tuffVBTDiamond.withdrawAllFromAave(daiContract.address);

        //Check that the account now has no aDAI after withdraw
        const aDaiQtyAfterWithdraw = await aDAIContract.balanceOf(tuffVBTDiamond.address);
        expect(new BN(aDaiQtyAfterWithdraw.toString())).to.be.bignumber.equal(new BN("0"),
            "unexpected ADAI balance after withdraw of DAI");

        //Check that the account now has the same or more(if interest was gained) DAI than we started with
        const daiQtyAfterWithdraw = await daiContract.balanceOf(tuffVBTDiamond.address);
        expect(new BN(daiQtyAfterWithdraw.toString())).to.be.bignumber.greaterThan(new BN(startDaiQty.toString()));
    });

    it("revert if token deposited is not supported", async () => {
        await expectRevert(tuffVBTDiamond.depositToAave(consts("WETH9_ADDR"), 0),
            "This token is currently not supported");
    });

    it("should liquidate Aave treasury", async () => {
        await utils.assertDepositERC20ToAave(tuffVBTDiamond, consts("DAI_ADDR"));

        await tuffVBTDiamond.liquidateAaveTreasury();

        const tokens = await tuffVBTDiamond.getAllAaveSupportedTokens();
        tokens.forEach(token => {
            (async () => {
                const balance = await tuffVBTDiamond.getATokenBalance(token);
                expect(balance).to.equal(0, `unexpected aToken (${token}) balance after withdraw of all assets`);
            })()
        })
    });

    it("should balance a single under-balanced token", async () => {
        //Setup
        const tokenAddr = consts("DAI_ADDR");
        const depositAmt = "2000";
        // DAI starts with the same amount as the other tokens, even though DAI's percentage calls for twice as much.
        // Thus making DAI under-balanced
        const {startERC20Qty: startDAIQty} = await utils.assertDepositERC20ToAave(tuffVBTDiamond, consts("DAI_ADDR"),
            hre.ethers.utils.parseEther(depositAmt), true);
        const {startERC20Qty: startUSDCQty} = await utils.assertDepositERC20ToAave(tuffVBTDiamond, consts("USDC_ADDR"),
            hre.ethers.utils.parseUnits(depositAmt, 6), true);
        const {startERC20Qty: startUSDTQty} = await utils.assertDepositERC20ToAave(tuffVBTDiamond, consts("USDT_ADDR"),
            hre.ethers.utils.parseUnits(depositAmt, 6), true);
        // Simulate the TuffVBT treasury capturing fees by directly transferring tVBT to TuffVBT's address
        const startingTreasuryAmount = await utils.transferTuffDUU(tuffVBTDiamond.address, "400000");

        //Run the balancing
        const balancingTxResponse = await tuffVBTDiamond.balanceAaveLendingPool();
        const balancingTxReceipt = await balancingTxResponse.wait();

        //Then, confirm that we added to the under-balanced token (other than a buffer for interest made during
        // this time)
        const balanceSwapEvent = balancingTxReceipt.events.filter(event => event.event === 'AaveLPManagerBalanceSwap');
        expect(balanceSwapEvent.length).to.equal(1);
        const {tokenSwappedFor, amount} = balanceSwapEvent[0].args;
        expect(tokenSwappedFor).to.equal(tokenAddr);
        expect(amount).to.equal(startingTreasuryAmount);

        const interestBuffer = hre.ethers.utils.parseEther('0.00001');
        // const interestBuffer = hre.ethers.utils.formatEther('10000000000000');
        const endingATokenBal = await tuffVBTDiamond.getATokenBalance(tokenAddr);
        const tokenBalanceDiff = BigNumber.from(endingATokenBal).sub(startDAIQty);
        expect(tokenBalanceDiff).to.be.gt(interestBuffer);
    });

    it("should not balance tokens when all are within buffer range", async () => {
        //Setup
        await depositTokensToAaveEvenly(tuffVBTDiamond);
        // Simulate the TuffVBT treasury capturing fees by directly transferring tVBT to TuffVBT's address
        await utils.transferTuffDUU(tuffVBTDiamond.address, "400000");

        //First, get how much token we have before balancing
        const startingADAIBal = await tuffVBTDiamond.getATokenBalance(consts("DAI_ADDR"));
        const startingAUSDCBal = await tuffVBTDiamond.getATokenBalance(consts("USDC_ADDR"));
        const startingAUSDTBal = await tuffVBTDiamond.getATokenBalance(consts("USDT_ADDR"));

        //Run the balancing
        await tuffVBTDiamond.balanceAaveLendingPool();

        //Since everything is already balanced, confirm that tokens haven't changed amount. (other than a buffer for
        // interest made during this time)
        const interestBuffer = hre.ethers.utils.parseEther('0.00001');
        const endingADAIBal = await tuffVBTDiamond.getATokenBalance(consts("DAI_ADDR"));
        const tokenDAIBalanceDiff = BigNumber.from(endingADAIBal).sub(startingADAIBal);
        expect(tokenDAIBalanceDiff).to.be.lte(interestBuffer);

        const endingAUSDCBal = await tuffVBTDiamond.getATokenBalance(consts("USDC_ADDR"));
        const tokenUSDCBalanceDiff = BigNumber.from(endingAUSDCBal).sub(startingAUSDCBal);
        expect(tokenUSDCBalanceDiff).to.be.lte(interestBuffer);

        const endingAUSDTBal = await tuffVBTDiamond.getATokenBalance(consts("USDT_ADDR"));
        const tokenUSDTBalanceDiff = BigNumber.from(endingAUSDTBal).sub(startingAUSDTBal);
        expect(tokenUSDTBalanceDiff).to.be.lte(interestBuffer);
    });

    it('should fail due to only owner check', async () => {
        const tokenAddr = consts("WETH9_ADDR");
        const tokenWeight = 2500;

        await tuffVBTDiamond.addAaveSupportedToken(tokenAddr, consts("CHAINLINK_ETH_DAI_AGGR_ADDR"), tokenWeight);
        let supportedTokens = await tuffVBTDiamond.getAllAaveSupportedTokens();
        expect(supportedTokens).to.contain(tokenAddr);

        await tuffVBTDiamond.removeAaveSupportedToken(tokenAddr);
        supportedTokens = await tuffVBTDiamond.getAllAaveSupportedTokens();
        expect(supportedTokens).to.not.contain(tokenAddr);

        const nonOwnerAccountAddress = accounts[1].address;
        await tuffVBTDiamond.transferTuffOwnership(nonOwnerAccountAddress);

        await expectRevert(tuffVBTDiamond.addAaveSupportedToken(
            tokenAddr, consts("CHAINLINK_ETH_DAI_AGGR_ADDR"), tokenWeight),
            "Ownable: caller is not the owner");

        supportedTokens = await tuffVBTDiamond.getAllAaveSupportedTokens();
        expect(supportedTokens).to.not.contain(tokenAddr);
    });
});
