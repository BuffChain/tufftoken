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

async function assertDepositERC20ToAave(tuffVBTDiamond, erc20TokenAddr, tokenQtyToDeposit="2000", isEtherFormat=false) {
    let erc20Qty;
    if (isEtherFormat) {
        erc20Qty = tokenQtyToDeposit;
    } else {
        erc20Qty = hre.ethers.utils.parseEther(tokenQtyToDeposit);
    }

    //Check that the account has enough ERC20
    const erc20Contract = await utils.getERC20Contract(erc20TokenAddr);
    const startERC20Qty = await erc20Contract.balanceOf(tuffVBTDiamond.address);
    expect(new BN(startERC20Qty.toString())).to.be.bignumber.greaterThan(new BN(erc20Qty.toString()));

    //Check that the account has no aToken
    const aTokenContract = await utils.getATokenContract(erc20TokenAddr);
    const startATokenQty = await aTokenContract.balanceOf(tuffVBTDiamond.address);
    expect(new BN(0)).to.be.bignumber.equal(new BN(startATokenQty.toString()));

    //Make the call to deposit Aave
    await tuffVBTDiamond.depositToAave(erc20TokenAddr, erc20Qty);

    //Check that the account has deposited the erc20Token
    const tokenQtyAfterDeposit = await erc20Contract.balanceOf(tuffVBTDiamond.address);
    expect(new BN(tokenQtyAfterDeposit.toString())).to.be.bignumber.equal(new BN(startERC20Qty.sub(erc20Qty).toString()),
        "unexpected token balance after deposit");

    //Check that the account now has aToken equal to the erc20Token we deposited
    const aTokenQtyAfterDeposit = await aTokenContract.balanceOf(tuffVBTDiamond.address);
    expect(new BN(erc20Qty.toString())).to.be.bignumber.equal(new BN(aTokenQtyAfterDeposit.toString()),
        "unexpected aToken balance after deposit of token");
    return {startERC20Qty};
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
        await assertDepositToAave(tuffVBTDiamond, qtyInDAI, true);

        //Lastly, assert that aToken was properly given
        let endingATokenBal = await tuffVBTDiamond.getATokenBalance(tokenAddr);
        expect(new BN(endingATokenBal.toString())).to.be.bignumber.equal(new BN(qtyInDAI.toString()));
        endingATokenBal = await adaiContract.balanceOf(tuffVBTDiamond.address);
        expect(new BN(endingATokenBal.toString())).to.be.bignumber.equal(new BN(qtyInDAI.toString()));
    });

    it("should deposit and withdraw dai to/from aave and TuffVBT's wallet", async () => {
        const daiContract = await utils.getDAIContract();
        const adaiContract = await utils.getADAIContract();

        //First, deposit
        const {startDaiQty} = await assertDepositERC20ToAave(tuffVBTDiamond, daiContract.address);

        //Then, withdraw
        await tuffVBTDiamond.withdrawAllFromAave(consts("DAI_ADDR"));

        //Check that the account now has no aDAI after withdraw
        const aDaiQtyAfterWithdraw = await adaiContract.balanceOf(tuffVBTDiamond.address);
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
        await assertDepositERC20ToAave(tuffVBTDiamond, consts("DAI_ADDR"));

        await tuffVBTDiamond.liquidateAaveTreasury();

        const tokens = await tuffVBTDiamond.getAllAaveSupportedTokens();
        tokens.forEach(token => {
            (async () => {
                const balance = await tuffVBTDiamond.getATokenBalance(token);
                expect(balance).to.equal(0, `unexpected aToken (${token}) balance after withdraw of all assets`);
            })()
        })
    });

    it("should balance a single underbalanced token", async () => {
        //Setup
        const tokenAddr = consts("DAI_ADDR");
        const qtyInDAI = hre.ethers.utils.parseEther("2000");
        await assertDepositERC20ToAave(tuffVBTDiamond, tokenAddr, qtyInDAI, true);
        // Simulate the TuffVBT treasury capturing fees by directly transferring tVBT to TuffVBT's address
        await utils.transferTuffDUU(tuffVBTDiamond.address, "400000");

        //First, get how much token we have before balancing
        const startingATokenBal = await tuffVBTDiamond.getATokenBalance(tokenAddr);

        //Next, set a token to a higher target percentage s.t. it is now underbalanced
        let actualTokenTargetPercent = await tuffVBTDiamond.getAaveTokenTargetedPercentage(tokenAddr);
        const newTargetPercentage = actualTokenTargetPercent * 2;
        await tuffVBTDiamond.setAaveTokenTargetedPercentage(tokenAddr, newTargetPercentage);

        //Run the balancing
        const balancingTxResponse = await tuffVBTDiamond.balanceAaveLendingPool();
        const balancingTxReceipt = await balancingTxResponse.wait();

        //Finally, confirm that we added to the under-balanced token (other than a buffer for interest made during
        // this time)
        const balanceSwapEvent = balancingTxReceipt.events.filter(event => event.event === 'AaveLPManagerBalanceSwap');
        expect(balanceSwapEvent.length).to.equal(1);
        const {tokenSwappedFor, amount} = balanceSwapEvent[0].args;
        expect(tokenSwappedFor).to.equal(tokenAddr);
        expect(amount).to.equal(startingTreasuryAmount);

        const interestBuffer = hre.ethers.utils.parseEther('0.00001');
        // const interestBuffer = hre.ethers.utils.formatEther('10000000000000');
        const endingATokenBal = await tuffVBTDiamond.getATokenBalance(tokenAddr);
        const tokenBalanceDiff = BigNumber.from(endingATokenBal).sub(startingATokenBal);
        expect(tokenBalanceDiff).to.be.gt(interestBuffer);
    });

    it("should not balance tokens when all are within buffer range", async () => {
        //Setup
        // Percentages are configured as followed: DAI = 1/2, USDC = 1/4, and USDT = 1/4
        const totalDepositAmt = 8000;
        await assertDepositERC20ToAave(tuffVBTDiamond, consts("DAI_ADDR"),
            hre.ethers.utils.parseEther((totalDepositAmt / 2).toString()), true);
        await assertDepositERC20ToAave(tuffVBTDiamond, consts("USDC_ADDR"),
            hre.ethers.utils.parseUnits((totalDepositAmt / 4).toString(), 6), true);
        await assertDepositERC20ToAave(tuffVBTDiamond, consts("USDT_ADDR"),
            hre.ethers.utils.parseUnits((totalDepositAmt / 4).toString(), 6), true);
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
});

exports.assertDepositERC20ToAave = assertDepositERC20ToAave;
