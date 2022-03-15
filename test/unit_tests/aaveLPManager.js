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

async function assertDepositToAave(tuffTokenDiamond, daiToDeposit="2000", isEtherBased=false) {
    let qtyInDAI;
    if (isEtherBased) {
        qtyInDAI = daiToDeposit;
    } else {
        qtyInDAI = hre.ethers.utils.parseEther(daiToDeposit);
    }

    //Check that the account has enough DAI
    const daiContract = await utils.getDAIContract();
    const startDaiQty = await daiContract.balanceOf(tuffTokenDiamond.address);
    expect(new BN(startDaiQty.toString())).to.be.bignumber.greaterThan(new BN(qtyInDAI.toString()));

    //Check that the account has no aDAI
    const adaiContract = await utils.getADAIContract();
    const startAdaiQty = await adaiContract.balanceOf(tuffTokenDiamond.address);
    expect(new BN(0)).to.be.bignumber.equal(new BN(startAdaiQty.toString()));

    //Make the call to deposit Aave
    await tuffTokenDiamond.depositToAave(consts("DAI_ADDR"), qtyInDAI);

    //Check that the account has deposited the DAI
    const daiQtyAfterDeposit = await daiContract.balanceOf(tuffTokenDiamond.address);
    expect(new BN(daiQtyAfterDeposit.toString())).to.be.bignumber.equal(new BN(startDaiQty.sub(qtyInDAI).toString()),
        "unexpected DAI balance after deposit of DAI");

    //Check that the account now has aDAI equal to the DAI we deposited
    const aDaiQtyAfterDeposit = await adaiContract.balanceOf(tuffTokenDiamond.address);
    expect(new BN(qtyInDAI.toString())).to.be.bignumber.equal(new BN(aDaiQtyAfterDeposit.toString()),
        "unexpected ADAI balance after deposit of DAI");
    return {startDaiQty};
}

describe('AaveLPManager', function () {
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

        await utils.sendTokensToAddr(accounts.at(-1), tuffTokenDiamond.address);
    });

    it('should be initialized', async () => {
        const isAaveInit = await tuffTokenDiamond.isAaveInit();
        expect(isAaveInit).to.be.true;
    });

    it('should set pool address correctly', async () => {
        const address = await tuffTokenDiamond.getAaveLPAddr();

        //The correct address is pulled from https://docs.aave.com/developers/deployed-contracts/deployed-contracts
        expect(address).to.equal("0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9");
    });

    it('should get the correct aDai address', async () => {
        const tokenAddr = consts("DAI_ADDR");
        const aTokenAddr = await tuffTokenDiamond.getATokenAddress(tokenAddr);
        expect(aTokenAddr).to.equal(consts("ADAI_ADDR"));
    });

    it('should get the correct aUSDC address', async () => {
        const tokenAddr = consts("USDC_ADDR");
        const aTokenAddr = await tuffTokenDiamond.getATokenAddress(tokenAddr);
        expect(aTokenAddr).to.equal(consts("AUSDC_ADDR"));
    });

    it('should get the correct aUSDT address', async () => {
        const tokenAddr = consts("USDT_ADDR");
        const aTokenAddr = await tuffTokenDiamond.getATokenAddress(tokenAddr);
        expect(aTokenAddr).to.equal(consts("AUSDT_ADDR"));
    });

    it('should have the correct tokens supported at launch', async () => {
        const supportedTokens = await tuffTokenDiamond.getAllAaveSupportedTokens();
        expect(supportedTokens.length).to.equal(3);

        expect(supportedTokens).to.contain(consts("DAI_ADDR"));
        let actualTokenTargetPercent = await tuffTokenDiamond.getAaveTokenTargetedPercentage(consts("DAI_ADDR"));
        expect(actualTokenTargetPercent).to.equal(5000);

        expect(supportedTokens).to.contain(consts("USDC_ADDR"));
        actualTokenTargetPercent = await tuffTokenDiamond.getAaveTokenTargetedPercentage(consts("USDC_ADDR"));
        expect(actualTokenTargetPercent).to.equal(2500);

        expect(supportedTokens).to.contain(consts("USDT_ADDR"));
        actualTokenTargetPercent = await tuffTokenDiamond.getAaveTokenTargetedPercentage(consts("USDT_ADDR"));
        expect(actualTokenTargetPercent).to.equal(2500);
    });

    it('should add a token and update total token weight', async () => {
        const tokenAddr = consts("WETH9_ADDR");
        const tokenWeight = 2500;

        let actualTotalTargetWeight = await tuffTokenDiamond.getAaveTotalTargetWeight();
        const expectedTotalTargetWeight = actualTotalTargetWeight.add(tokenWeight);

        let supportedTokens = await tuffTokenDiamond.getAllAaveSupportedTokens();
        expect(supportedTokens.length).to.equal(3);
        expect(supportedTokens).to.not.contain(tokenAddr);

        await tuffTokenDiamond.addAaveSupportedToken(tokenAddr, tokenWeight);

        supportedTokens = await tuffTokenDiamond.getAllAaveSupportedTokens();
        expect(supportedTokens.length).to.equal(4);
        expect(supportedTokens).to.contain(tokenAddr);

        actualTotalTargetWeight = await tuffTokenDiamond.getAaveTotalTargetWeight();
        expect(actualTotalTargetWeight).to.equal(expectedTotalTargetWeight);
    });

    it('should remove a token and update total token weight', async () => {
        const tokenAddr = consts("DAI_ADDR");
        let actualTotalTargetWeight = await tuffTokenDiamond.getAaveTotalTargetWeight();
        let actualTokenTargetPercent = await tuffTokenDiamond.getAaveTokenTargetedPercentage(tokenAddr);
        const expectedTotalTargetWeight = actualTotalTargetWeight.sub(actualTokenTargetPercent);

        let supportedTokens = await tuffTokenDiamond.getAllAaveSupportedTokens();
        expect(supportedTokens.length).to.equal(3);
        expect(supportedTokens).to.contain(tokenAddr);

        await tuffTokenDiamond.removeAaveSupportedToken(tokenAddr);

        supportedTokens = await tuffTokenDiamond.getAllAaveSupportedTokens();
        expect(supportedTokens.length).to.equal(2);
        expect(supportedTokens).to.not.contain(tokenAddr);

        actualTotalTargetWeight = await tuffTokenDiamond.getAaveTotalTargetWeight();
        expect(actualTotalTargetWeight).to.equal(expectedTotalTargetWeight);
    });

    it('should update a tokens target weight and total token weight', async () => {
        const tokenAddr = consts("DAI_ADDR");
        let actualTotalTargetWeight = await tuffTokenDiamond.getAaveTotalTargetWeight();
        let actualTokenTargetPercent = await tuffTokenDiamond.getAaveTokenTargetedPercentage(tokenAddr);
        expect(actualTokenTargetPercent).to.equal(5000);

        const expectedTotalTargetWeight = actualTotalTargetWeight.add(actualTokenTargetPercent);
        const expectedTargetPercentage = actualTokenTargetPercent.add(actualTokenTargetPercent);
        await tuffTokenDiamond.setAaveTokenTargetedPercentage(tokenAddr, expectedTargetPercentage);

        actualTokenTargetPercent = await tuffTokenDiamond.getAaveTokenTargetedPercentage(tokenAddr);
        expect(actualTokenTargetPercent).to.equal(expectedTargetPercentage);

        actualTotalTargetWeight = await tuffTokenDiamond.getAaveTotalTargetWeight();
        expect(actualTotalTargetWeight).to.equal(expectedTotalTargetWeight);
    });

    it('reverts if adding a unsupported aave token', async () => {
        await expectRevert(tuffTokenDiamond.addAaveSupportedToken(consts("UNISWAP_V3_ROUTER_ADDR"), 2500),
            "The tokenAddress provided is not supported by Aave");
    });

    it("should get correct aToken balance", async () => {
        const tokenAddr = consts("DAI_ADDR");
        const adaiContract = await utils.getADAIContract();

        //First, confirm we have no aToken
        let startingATokenBal = await tuffTokenDiamond.getATokenBalance(tokenAddr);
        expect(new BN(startingATokenBal.toString())).to.be.bignumber.equal(new BN("0"));
        startingATokenBal = await adaiContract.balanceOf(tuffTokenDiamond.address);
        expect(new BN(startingATokenBal.toString())).to.be.bignumber.equal(new BN("0"));

        //Then, deposit DAI into Aave, which gives us aDAI
        const qtyInDAI = hre.ethers.utils.parseEther("2000");
        await assertDepositToAave(tuffTokenDiamond, qtyInDAI, true);

        //Lastly, assert that aToken was properly given
        let endingATokenBal = await tuffTokenDiamond.getATokenBalance(tokenAddr);
        expect(new BN(endingATokenBal.toString())).to.be.bignumber.equal(new BN(qtyInDAI.toString()));
        endingATokenBal = await adaiContract.balanceOf(tuffTokenDiamond.address);
        expect(new BN(endingATokenBal.toString())).to.be.bignumber.equal(new BN(qtyInDAI.toString()));
    });

    it("should deposit and withdraw dai to/from aave and TuffToken's wallet", async () => {
        const daiContract = await utils.getDAIContract();
        const adaiContract = await utils.getADAIContract();

        //First, deposit
        const {startDaiQty} = await assertDepositToAave(tuffTokenDiamond);

        //Then, withdraw
        await tuffTokenDiamond.withdrawAllFromAave(consts("DAI_ADDR"));

        //Check that the account now has no aDAI after withdraw
        const aDaiQtyAfterWithdraw = await adaiContract.balanceOf(tuffTokenDiamond.address);
        expect(new BN(aDaiQtyAfterWithdraw.toString())).to.be.bignumber.equal(new BN("0"),
            "unexpected ADAI balance after withdraw of DAI");

        //Check that the account now has the same or more(if interest was gained) DAI than we started with
        const daiQtyAfterWithdraw = await daiContract.balanceOf(tuffTokenDiamond.address);
        expect(new BN(daiQtyAfterWithdraw.toString())).to.be.bignumber.greaterThan(new BN(startDaiQty.toString()));
    });

    it("revert if token deposited is not supported", async () => {
        await expectRevert(tuffTokenDiamond.depositToAave(consts("WETH9_ADDR"), 0),
            "This token is currently not supported");
    });

    it("should liquidate Aave treasury", async () => {
        await assertDepositToAave(tuffTokenDiamond);

        await tuffTokenDiamond.liquidateAaveTreasury();

        const tokens = await tuffTokenDiamond.getAllAaveSupportedTokens();
        tokens.forEach(token => {
            (async () => {
                const balance = await tuffTokenDiamond.getATokenBalance(token);
                expect(balance).to.equal(0, `unexpected aToken (${token}) balance after withdraw of all assets`);
            })()
        })
    });

    it("should balance a single underbalanced token", async () => {
        //Setup
        const tokenAddr = consts("DAI_ADDR");
        const qtyInDAI = hre.ethers.utils.parseEther("2000");
        await assertDepositToAave(tuffTokenDiamond, qtyInDAI, true);

        //First, get how much token we have before balancing
        const startingATokenBal = await tuffTokenDiamond.getATokenBalance(tokenAddr);

        //Next, set a token to a higher target percentage s.t. it is now underbalanced
        let actualTokenTargetPercent = await tuffTokenDiamond.getAaveTokenTargetedPercentage(tokenAddr);
        const newTargetPercentage = actualTokenTargetPercent * 2;
        await tuffTokenDiamond.setAaveTokenTargetedPercentage(tokenAddr, newTargetPercentage);

        //Run the balancing
        await tuffTokenDiamond.balanceAaveLendingPool();

        //Finally, confirm that we improved the underbalanced token's situation
        const endingATokenBal = await tuffTokenDiamond.getATokenBalance(tokenAddr);
        expect(new BN(endingATokenBal.toString())).to.be.bignumber.greaterThan(new BN(startingATokenBal.toString()));
    });

    it("should not balance tokens when all are within buffer range", async () => {
        //Setup
        const tokenAddr = consts("DAI_ADDR");
        const qtyInDAI = hre.ethers.utils.parseEther("2000");
        await assertDepositToAave(tuffTokenDiamond, qtyInDAI, true);
    });
});

exports.assertDepositToAave = assertDepositToAave;
