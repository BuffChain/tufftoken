// SPDX-License-Identifier: agpl-3.0

const {expect} = require("chai");
const {
    BN,           // Big Number support
    constants,    // Common constants, like the zero address and largest integers
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');
const hre = require("hardhat");

const backTestUtils = require("../../utils/back_test_utils");
const {consts} = require("../../utils/consts");
const utils = require("../../utils/test_utils");

describe('AaveLPManager', function () {
    const daiAmt = "2000";

    let owner;
    let accounts;

    let tuffTokenDiamond;
    let aaveDaiIncome;

    before(async function () {
        const {contractOwner} = await hre.getNamedAccounts();
        owner = await hre.ethers.getSigner(contractOwner);

        //Per `hardhat.config.js`, the 0 and 1 index accounts are named accounts. They are reserved for deployment uses
        [, , ...accounts] = await hre.ethers.getSigners();
    });

    beforeEach(async function () {
        const {TuffTokenDiamond} = await hre.deployments.fixture();
        tuffTokenDiamond = await hre.ethers.getContractAt(TuffTokenDiamond.abi, TuffTokenDiamond.address, owner);

        await utils.sendTokensToAddr(accounts.at(-1), tuffTokenDiamond.address, daiAmt);
        aaveDaiIncome = await tuffTokenDiamond.getAaveIncome(consts("DAI_ADDR"));
    });

    it('should have increased income', async () => {
        await backTestUtils.simulateBlockChainActivity();

        const updateAaveDaiIncome = await tuffTokenDiamond.getAaveIncome(consts("DAI_ADDR"));
        const actualIncomeDiff = updateAaveDaiIncome.sub(aaveDaiIncome);
        const expectedDiff = hre.ethers.BigNumber.from("201398389822881933700");
        console.log(`Expected diff is ${hre.ethers.utils.formatEther(expectedDiff)} ether`);
        expect(actualIncomeDiff).to.be.eq(expectedDiff);
    });


    it("should have increased aDAI amount", async () => {
        const qtyInDAI = hre.ethers.utils.parseEther(daiAmt);

        //Check that the account has no aDAI
        const adaiContract = await utils.getADAIContract();
        let startAdaiQty = await adaiContract.balanceOf(tuffTokenDiamond.address);
        expect(new BN(0)).to.be.bignumber.equal(new BN(startAdaiQty.toString()));

        //Make the call to deposit DAI into Aave
        await tuffTokenDiamond.depositToAave(consts("DAI_ADDR"), qtyInDAI);

        //Check that the account now has aDAI equal to the DAI we deposited
        startAdaiQty = await adaiContract.balanceOf(tuffTokenDiamond.address);
        expect(new BN(qtyInDAI.toString())).to.be.bignumber.equal(new BN(startAdaiQty.toString()));

        //Mine new txs and blocks to simulate activity and time passing
        await backTestUtils.simulateBlockChainActivity();

        //Check that we have earned aDAI
        const endAdaiQty = await adaiContract.balanceOf(tuffTokenDiamond.address);
        expect(new BN(endAdaiQty.toString())).to.be.bignumber.greaterThan(new BN(startAdaiQty.toString()));
        console.log(`Started with ${startAdaiQty} aDAI and ended with ${endAdaiQty} aDAI`);
    });
});
