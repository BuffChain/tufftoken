// SPDX-License-Identifier: agpl-3.0

const { expect } = require("chai");
const {
    BN,           // Big Number support
    constants,    // Common constants, like the zero address and largest integers
    expectEvent,  // Assertions for emitted events
    expectRevert // Assertions for transactions that should fail
} = require("@openzeppelin/test-helpers");
const hre = require("hardhat");

const { consts } = require("../../utils/consts");
const { BigNumber } = require("ethers");
const { transferTuffDUU, getDAIContract, getADAIContract } = require("../../utils/utils");
const { assertDepositERC20ToAave, sendTokensToAddr } = require("../../utils/test_utils");

/**
 * Deposit all supported tokens to Aave per the percentages configured
 * @param tuffVBTDiamond: tuffVBTDiamond contract
 * @param totalDepositAmt: total amount of tokens that will be deposited
 * @returns {Promise<void>}
 */
async function depositTokensToAaveEvenly(tuffVBTDiamond, totalDepositAmt = 8000) {
    const daiDepositAmt = (totalDepositAmt / 2).toString();     //50%
    const usdcDepositAmt = (totalDepositAmt / 4).toString();    //25%
    const usdtDepositAmt = (totalDepositAmt / 4).toString();    //25%

    const { startERC20Qty: startDAIQty } = await assertDepositERC20ToAave(tuffVBTDiamond, consts("DAI_ADDR"),
        hre.ethers.utils.parseEther(daiDepositAmt), true);
    const { startERC20Qty: startUSDCQty } = await assertDepositERC20ToAave(tuffVBTDiamond, consts("USDC_ADDR"),
        hre.ethers.utils.parseUnits(usdcDepositAmt, 6), true);
    const { startERC20Qty: startUSDTQty } = await assertDepositERC20ToAave(tuffVBTDiamond, consts("USDT_ADDR"),
        hre.ethers.utils.parseUnits(usdtDepositAmt, 6), true);

    return { startDAIQty, startUSDCQty, startUSDTQty };
}

describe("AaveLPManager", function() {
    let owner;
    let accounts;

    let tuffVBTDiamond;

    before(async function() {
        const { contractOwner } = await hre.getNamedAccounts();
        owner = await hre.ethers.getSigner(contractOwner);

        //Per `hardhat.config.ts`, the 0 and 1 index accounts are named accounts. They are reserved for deployment uses
        [, , ...accounts] = await hre.ethers.getSigners();
    });

    beforeEach(async function() {
        const { tDUU } = await hre.deployments.fixture();
        tuffVBTDiamond = await hre.ethers.getContractAt(tDUU.abi, tDUU.address, owner);

        await sendTokensToAddr(accounts.at(-1), tuffVBTDiamond.address);

        //Increase the block time to prime the pool
        await hre.ethers.provider.send("evm_increaseTime", [3600]);
        await hre.ethers.provider.send("evm_mine", []);
    });

    it("should be initialized", async () => {
        const isAaveInit = await tuffVBTDiamond.isAaveInit();
        expect(isAaveInit).to.be.true;
    });

    it("should set pool address correctly", async () => {
        const address = await tuffVBTDiamond.getAaveLPAddr();

        //The correct address is pulled from https://docs.aave.com/developers/deployed-contracts/deployed-contracts
        expect(address).to.equal("0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9");
    });

    it("should get the correct aDai address", async () => {
        const tokenAddr = consts("DAI_ADDR");
        const aTokenAddr = await tuffVBTDiamond.getATokenAddress(tokenAddr);
        expect(aTokenAddr).to.equal(consts("ADAI_ADDR"));
    });

    it("should get the correct aUSDC address", async () => {
        const tokenAddr = consts("USDC_ADDR");
        const aTokenAddr = await tuffVBTDiamond.getATokenAddress(tokenAddr);
        expect(aTokenAddr).to.equal(consts("AUSDC_ADDR"));
    });

    it("should get the correct aUSDT address", async () => {
        const tokenAddr = consts("USDT_ADDR");
        const aTokenAddr = await tuffVBTDiamond.getATokenAddress(tokenAddr);
        expect(aTokenAddr).to.equal(consts("AUSDT_ADDR"));
    });

    it("should have the correct tokens supported at launch", async () => {
        const supportedTokens = await tuffVBTDiamond.getAllAaveSupportedTokens();
        expect(supportedTokens.length).to.equal(3);

        expect(supportedTokens).to.contain(consts("DAI_ADDR"));
        let actualTokenTargetPercent = await tuffVBTDiamond.getAaveTokenTargetWeight(consts("DAI_ADDR"));
        expect(actualTokenTargetPercent).to.equal(500000);

        expect(supportedTokens).to.contain(consts("USDC_ADDR"));
        actualTokenTargetPercent = await tuffVBTDiamond.getAaveTokenTargetWeight(consts("USDC_ADDR"));
        expect(actualTokenTargetPercent).to.equal(250000);

        expect(supportedTokens).to.contain(consts("USDT_ADDR"));
        actualTokenTargetPercent = await tuffVBTDiamond.getAaveTokenTargetWeight(consts("USDT_ADDR"));
        expect(actualTokenTargetPercent).to.equal(250000);
    });

    it("should add a token and update total token weight", async () => {
        const tokenAddr = consts("WETH9_ADDR");
        const chainlinkEthTokenAggrAddr = consts("CHAINLINK_ETH_DAI_AGGR_ADDR");
        const tokenWeight = 250000;

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

    it("should remove a token and update total token weight", async () => {
        const tokenAddr = consts("DAI_ADDR");
        let actualTotalTargetWeight = await tuffVBTDiamond.getAaveTotalTargetWeight();
        let actualTokenTargetPercent = await tuffVBTDiamond.getAaveTokenTargetWeight(tokenAddr);
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

    it("should update a tokens target weight and total token weight", async () => {
        const tokenAddr = consts("USDT_ADDR");
        let actualTotalTargetWeight = await tuffVBTDiamond.getAaveTotalTargetWeight();
        let actualTokenTargetPercent = await tuffVBTDiamond.getAaveTokenTargetWeight(tokenAddr);
        expect(actualTokenTargetPercent).to.equal(250000);

        //Double the target percentage
        const expectedTotalTargetWeight = actualTotalTargetWeight.add(actualTokenTargetPercent);
        const expectedTargetPercentage = actualTokenTargetPercent.add(actualTokenTargetPercent);
        await tuffVBTDiamond.setAaveTokenTargetWeight(tokenAddr, expectedTargetPercentage);

        actualTokenTargetPercent = await tuffVBTDiamond.getAaveTokenTargetWeight(tokenAddr);
        expect(actualTokenTargetPercent).to.equal(expectedTargetPercentage);

        actualTotalTargetWeight = await tuffVBTDiamond.getAaveTotalTargetWeight();
        expect(actualTotalTargetWeight).to.equal(expectedTotalTargetWeight);
    });

    it("reverts if adding an unsupported aave token", async () => {
        await expectRevert(tuffVBTDiamond.addAaveSupportedToken(
                consts("UNISWAP_V3_ROUTER_ADDR"), consts("UNISWAP_V3_ROUTER_ADDR"), 2500),
            "UT");
    });

    it("should get correct aToken balance", async () => {
        const tokenAddr = consts("DAI_ADDR");
        const qtyInDAI = hre.ethers.utils.parseEther("2000");

        //Deposit and assert token and aToken balances
        await assertDepositERC20ToAave(tuffVBTDiamond, tokenAddr, qtyInDAI, true);
    });

    it("should deposit and withdraw dai to/from aave and TuffVBT's wallet", async () => {
        const daiContract = await getDAIContract();
        const aDAIContract = await getADAIContract();

        //First, deposit and assert tokens were transferred
        const { startERC20Qty: startDaiQty } = await assertDepositERC20ToAave(tuffVBTDiamond, daiContract.address);

        //Then, withdraw
        await tuffVBTDiamond.withdrawAllFromAave(daiContract.address);

        //Check that the account now has no aDAI after withdraw
        const aDaiQtyAfterWithdraw = await aDAIContract.balanceOf(tuffVBTDiamond.address);
        expect(aDaiQtyAfterWithdraw).to.equal(BigNumber.from(0),
            "unexpected ADAI balance after withdraw of DAI");

        //Check that the account now has the same or more(if interest was gained) DAI than we started with
        const daiQtyAfterWithdraw = await daiContract.balanceOf(tuffVBTDiamond.address);
        expect(daiQtyAfterWithdraw).to.gt(startDaiQty);
    });

    it("revert if token deposited is not supported", async () => {
        await expectRevert(tuffVBTDiamond.depositToAave(consts("WETH9_ADDR"), 0),
            "This token is currently not supported");
    });

    it("should liquidate Aave treasury", async () => {
        await assertDepositERC20ToAave(tuffVBTDiamond, consts("DAI_ADDR"));

        await tuffVBTDiamond.liquidateAaveTreasury();

        const tokens = await tuffVBTDiamond.getAllAaveSupportedTokens();
        tokens.forEach(token => {
            (async () => {
                const balance = await tuffVBTDiamond.getATokenBalance(token);
                expect(balance).to.equal(0, `unexpected aToken (${token}) balance after withdraw of all assets`);
            })();
        });
    });

    it("should balance a single under-balanced token", async () => {
        //Setup
        const underBalanceTokenAddr = consts("DAI_ADDR");
        // Total amount is 10000, s.t. percentage == weight for readability
        // DAI is under-balanced at 25% (target is 50%)
        await assertDepositERC20ToAave(tuffVBTDiamond, underBalanceTokenAddr,
            hre.ethers.utils.parseEther("2500"), true);
        // USDC is balanced at 25% (target is 25%)
        await assertDepositERC20ToAave(tuffVBTDiamond, consts("USDC_ADDR"),
            hre.ethers.utils.parseUnits("2500", 6), true);
        // USDT is over-balanced at 50% (target is 25%)
        await assertDepositERC20ToAave(tuffVBTDiamond, consts("USDT_ADDR"),
            hre.ethers.utils.parseUnits("5000", 6), true);

        // Simulate the TuffVBT treasury capturing fees by directly transferring tVBT to TuffVBT's address
        const startingTreasuryAmount = await transferTuffDUU(tuffVBTDiamond.address, "400000");

        const startUnderBalanceAToken = await tuffVBTDiamond.getATokenBalance(underBalanceTokenAddr);
        const startingAUSDCBal = await tuffVBTDiamond.getATokenBalance(consts("USDC_ADDR"));
        const startingAUSDTBal = await tuffVBTDiamond.getATokenBalance(consts("USDT_ADDR"));
        const supportedTokens = await tuffVBTDiamond.getAllAaveSupportedTokens();

        //Run the balancing
        const balancingTxResponse = await tuffVBTDiamond.balanceAaveLendingPool();
        const balancingTxReceipt = await balancingTxResponse.wait();

        //Then, confirm that we added to the under-balanced token
        const balanceSwapEvent = balancingTxReceipt.events.filter(event => event.event === "AaveLPManagerBalanceSwap");
        expect(balanceSwapEvent.length).to.equal(1);
        const { tokenSwappedFor, amountIn, amountOut } = balanceSwapEvent[0].args;
        expect(tokenSwappedFor).to.equal(underBalanceTokenAddr);
        expect(amountIn).to.equal(startingTreasuryAmount.div(supportedTokens.length - 1));

        const interestBuffer = hre.ethers.utils.parseEther("0.00001");
        const endUnderBalanceAToken = await tuffVBTDiamond.getATokenBalance(underBalanceTokenAddr);
        // Assert that balancing actually occurred and the ending balance didn't just increase due to interest
        expect(endUnderBalanceAToken).to.be.gte(startUnderBalanceAToken.add(amountOut));
        expect(endUnderBalanceAToken).to.be.lte(startUnderBalanceAToken.add(amountOut).add(interestBuffer));

        // Assert that we didn't balance the other two tokens
        const endingAUSDCBal = await tuffVBTDiamond.getATokenBalance(consts("USDC_ADDR"));
        expect(endingAUSDCBal).to.be.lte(startingAUSDCBal.add(interestBuffer));
        const endingAUSDTBal = await tuffVBTDiamond.getATokenBalance(consts("USDT_ADDR"));
        expect(endingAUSDTBal).to.be.lte(startingAUSDTBal.add(interestBuffer));
    });

    it("should balance multiple under-balanced tokens", async () => {
        //Setup
        const underBalanceTokenAddr1 = consts("DAI_ADDR");
        const underBalanceTokenAddr2 = consts("USDC_ADDR");
        // Total amount is 10000, s.t. percentage == weight for readability
        // DAI is under-balanced at 10% (target is 50%)
        await assertDepositERC20ToAave(tuffVBTDiamond, underBalanceTokenAddr1,
            hre.ethers.utils.parseEther("1000"), true);
        // USDC is under-balanced at 10% (target is 25%)
        await assertDepositERC20ToAave(tuffVBTDiamond, underBalanceTokenAddr2,
            hre.ethers.utils.parseUnits("1000", 6), true);
        // USDT is over-balanced at 80% (target is 25%)
        await assertDepositERC20ToAave(tuffVBTDiamond, consts("USDT_ADDR"),
            hre.ethers.utils.parseUnits("8000", 6), true);

        // Simulate the TuffVBT treasury capturing fees by directly transferring tVBT to TuffVBT's address
        const startingTreasuryAmount = await transferTuffDUU(tuffVBTDiamond.address, "400000");

        const startUnderBalanceAToken1 = await tuffVBTDiamond.getATokenBalance(underBalanceTokenAddr1);
        const startUnderBalanceAToken2 = await tuffVBTDiamond.getATokenBalance(underBalanceTokenAddr2);
        const startingAUSDTBal = await tuffVBTDiamond.getATokenBalance(consts("USDT_ADDR"));
        const supportedTokens = await tuffVBTDiamond.getAllAaveSupportedTokens();

        //Run the balancing
        const balancingTxResponse = await tuffVBTDiamond.balanceAaveLendingPool();
        const balancingTxReceipt = await balancingTxResponse.wait();

        //Then, confirm that we added to the under-balanced token
        const balanceSwapEvent = balancingTxReceipt.events.filter(event => event.event === "AaveLPManagerBalanceSwap");
        expect(balanceSwapEvent.length).to.equal(2);
        // under-balance token 1
        const {
            tokenSwappedFor: tokenSwappedFor1,
            amountIn: amountIn1,
            amountOut: amountOut1
        } = balanceSwapEvent[0].args;
        expect(tokenSwappedFor1).to.equal(underBalanceTokenAddr1);
        expect(amountIn1).to.equal(startingTreasuryAmount.div(supportedTokens.length - 1));
        // under-balance token 2
        const {
            tokenSwappedFor: tokenSwappedFor2,
            amountIn: amountIn2,
            amountOut: amountOut2
        } = balanceSwapEvent[1].args;
        expect(tokenSwappedFor2).to.equal(underBalanceTokenAddr2);
        expect(amountIn2).to.equal(startingTreasuryAmount.div(supportedTokens.length - 1));

        // Assert that balancing actually occurred and the ending balance didn't just increase due to interest
        const interestBuffer = hre.ethers.utils.parseEther("0.00001");

        const endUnderBalanceAToken1 = await tuffVBTDiamond.getATokenBalance(underBalanceTokenAddr1);
        expect(endUnderBalanceAToken1).to.be.gte(startUnderBalanceAToken1.add(amountOut1));
        expect(endUnderBalanceAToken1).to.be.lte(startUnderBalanceAToken1.add(amountOut1).add(interestBuffer));

        const endUnderBalanceAToken2 = await tuffVBTDiamond.getATokenBalance(underBalanceTokenAddr2);
        expect(endUnderBalanceAToken2).to.be.gte(startUnderBalanceAToken2.add(amountOut2));
        expect(endUnderBalanceAToken2).to.be.lte(startUnderBalanceAToken2.add(amountOut2).add(interestBuffer));

        // Assert that we didn't balance the over-balanced token
        const endingAUSDTBal = await tuffVBTDiamond.getATokenBalance(consts("USDT_ADDR"));
        expect(endingAUSDTBal).to.be.lte(startingAUSDTBal.add(interestBuffer));
    });

    it("should balance tokens until all are with the target weight buffer", async () => {
        //Setup. Total amount is 10000, s.t. percentage == weight for readability
        // DAI is under-balanced at 25% (target is 50%)
        await assertDepositERC20ToAave(tuffVBTDiamond, consts("DAI_ADDR"),
            hre.ethers.utils.parseEther("2500"), true);
        const targetDAIPercent = await tuffVBTDiamond.getAaveTokenTargetWeight(consts("DAI_ADDR"));

        // USDC is under-balanced at 15% (target is 25%)
        await assertDepositERC20ToAave(tuffVBTDiamond, consts("USDC_ADDR"),
            hre.ethers.utils.parseUnits("1500", 6), true);
        const targetUSDCPercent = await tuffVBTDiamond.getAaveTokenTargetWeight(consts("USDC_ADDR"));

        // USDT is over-balanced at 60% (target is 25%)
        await assertDepositERC20ToAave(tuffVBTDiamond, consts("USDT_ADDR"),
            hre.ethers.utils.parseUnits("6000", 6), true);
        const targetUSDTPercent = await tuffVBTDiamond.getAaveTokenTargetWeight(consts("USDT_ADDR"));

        //Get starting percentages
        const balanceBufferPercentage = await tuffVBTDiamond.getBalanceBufferPercent();
        const startDAIPercent = await tuffVBTDiamond.getAaveTokenCurrentPercentage(consts("DAI_ADDR"));
        const startUSDCPercent = await tuffVBTDiamond.getAaveTokenCurrentPercentage(consts("USDC_ADDR"));
        const startUSDTPercent = await tuffVBTDiamond.getAaveTokenCurrentPercentage(consts("USDT_ADDR"));

        //1st Run
        // Simulate the TuffVBT treasury capturing fees by directly transferring tVBT to TuffVBT's address
        await transferTuffDUU(tuffVBTDiamond.address, "1000000");
        // Then balance
        await tuffVBTDiamond.balanceAaveLendingPool();

        //Assert progress. DAI will be under-balanced, USDC and USDT will over-balanced
        const middleDAIPercent = await tuffVBTDiamond.getAaveTokenCurrentPercentage(consts("DAI_ADDR"));
        expect(middleDAIPercent).to.be.lt(targetDAIPercent); //under-balance
        expect(middleDAIPercent).to.be.gt(startDAIPercent); //improved

        const middleUSDCPercent = await tuffVBTDiamond.getAaveTokenCurrentPercentage(consts("USDC_ADDR"));
        expect(middleUSDCPercent).to.be.gt(targetUSDCPercent); //over-balance
        expect(middleUSDCPercent).to.be.gt(startUSDCPercent); //improved

        const middleUSDTPercent = await tuffVBTDiamond.getAaveTokenCurrentPercentage(consts("USDT_ADDR"));
        expect(middleUSDTPercent).to.be.gt(targetUSDTPercent); //over-balance
        expect(middleUSDTPercent).to.be.lt(startUSDTPercent); //improved

        //2nd Run
        await transferTuffDUU(tuffVBTDiamond.address, "1000000");
        await tuffVBTDiamond.balanceAaveLendingPool();

        //Assert progress. All tokens should be fully balanced
        const endDAIPercent = await tuffVBTDiamond.getAaveTokenCurrentPercentage(consts("DAI_ADDR"));
        expect(endDAIPercent).to.be.closeTo(targetDAIPercent, balanceBufferPercentage);

        const endUSDCPercent = await tuffVBTDiamond.getAaveTokenCurrentPercentage(consts("USDC_ADDR"));
        expect(endUSDCPercent).to.be.closeTo(targetUSDCPercent, balanceBufferPercentage);

        const endUSDTPercent = await tuffVBTDiamond.getAaveTokenCurrentPercentage(consts("USDT_ADDR"));
        expect(endUSDTPercent).to.be.closeTo(targetUSDTPercent, balanceBufferPercentage);

        //Final run to ensure balancing is no longer needed and will not occur
        const balancingTxResponse = await tuffVBTDiamond.balanceAaveLendingPool();
        const balancingTxReceipt = await balancingTxResponse.wait();
        const balanceSwapEvent = balancingTxReceipt.events.filter(event => event.event === "AaveLPManagerBalanceSwap");
        expect(balanceSwapEvent).to.be.empty;
    });

    it("should not balance tokens when all are within buffer range", async () => {
        //Setup
        await depositTokensToAaveEvenly(tuffVBTDiamond);
        // Simulate the TuffVBT treasury capturing fees by directly transferring tVBT to TuffVBT's address
        await transferTuffDUU(tuffVBTDiamond.address, "400000");

        //First, get how much token we have before balancing
        const startingADAIBal = await tuffVBTDiamond.getATokenBalance(consts("DAI_ADDR"));
        const startingAUSDCBal = await tuffVBTDiamond.getATokenBalance(consts("USDC_ADDR"));
        const startingAUSDTBal = await tuffVBTDiamond.getATokenBalance(consts("USDT_ADDR"));

        //Run the balancing
        const balancingTxResponse = await tuffVBTDiamond.balanceAaveLendingPool();
        const balancingTxReceipt = await balancingTxResponse.wait();

        //Assert that no balancing occurred
        const balanceSwapEvent = balancingTxReceipt.events.filter(event => event.event === "AaveLPManagerBalanceSwap");
        expect(balanceSwapEvent).to.be.empty;

        // Confirm that token balances haven't changed. (other than a buffer for interest made during this time)
        const interestBuffer = hre.ethers.utils.parseEther("0.00001");

        const endingADAIBal = await tuffVBTDiamond.getATokenBalance(consts("DAI_ADDR"));
        expect(endingADAIBal).to.be.lte(startingADAIBal.add(interestBuffer));

        const endingAUSDCBal = await tuffVBTDiamond.getATokenBalance(consts("USDC_ADDR"));
        expect(endingAUSDCBal).to.be.lte(startingAUSDCBal.add(interestBuffer));

        const endingAUSDTBal = await tuffVBTDiamond.getATokenBalance(consts("USDT_ADDR"));
        expect(endingAUSDTBal).to.be.lte(startingAUSDTBal.add(interestBuffer));
    });

    it("should fail due to only owner check", async () => {
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
            "NO");

        supportedTokens = await tuffVBTDiamond.getAllAaveSupportedTokens();
        expect(supportedTokens).to.not.contain(tokenAddr);
    });
});
