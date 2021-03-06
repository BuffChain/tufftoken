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

    let tuffVBTDiamond;
    let aaveDaiIncome;

    before(async function () {
        const {contractOwner} = await hre.getNamedAccounts();
        owner = await hre.ethers.getSigner(contractOwner);

        //Per `hardhat.config.ts`, the 0 and 1 index accounts are named accounts. They are reserved for deployment uses
        [, , ...accounts] = await hre.ethers.getSigners();
    });

    beforeEach(async function () {
        const {TuffVBTDiamond} = await hre.deployments.fixture();
        tuffVBTDiamond = await hre.ethers.getContractAt(TuffVBTDiamond.abi, TuffVBTDiamond.address, owner);

        await utils.sendTokensToAddr(accounts.at(-1), tuffVBTDiamond.address, daiAmt);
        aaveDaiIncome = await tuffVBTDiamond.getAaveIncome(consts("DAI_ADDR"));

        //Aave formats this unit based on 27 places
        // https://docs.aave.com/developers/v/2.0/the-core-protocol/lendingpool#getreservenormalizedincome
        console.log(`Starting Aave DAI normalized income [${hre.ethers.utils.formatUnits(aaveDaiIncome, 27)}]`);
    });

    it('should have increased income', async () => {
        await backTestUtils.simulateBlockChainActivity();

        const updateAaveDaiIncome = await tuffVBTDiamond.getAaveIncome(consts("DAI_ADDR"));
        const actualIncomeDiff = updateAaveDaiIncome.sub(aaveDaiIncome);
        const expectedDiff = hre.ethers.BigNumber.from("267592266198234737084");

        //Aave formats this unit based on 27 places
        // https://docs.aave.com/developers/v/2.0/the-core-protocol/lendingpool#getreservenormalizedincome
        console.log(`Expected diff is ${hre.ethers.utils.formatUnits(expectedDiff, 27)} units of income`);
        expect(actualIncomeDiff).to.be.eq(expectedDiff);
    });

    it("should have increased aDAI amount", async () => {
        const qtyInDAI = hre.ethers.utils.parseEther(daiAmt);

        //Check that the account has no aDAI
        const adaiContract = await utils.getADAIContract();
        let startAdaiQty = await adaiContract.balanceOf(tuffVBTDiamond.address);
        expect(new BN(0)).to.be.bignumber.equal(new BN(startAdaiQty.toString()));

        //Make the call to deposit DAI into Aave
        await tuffVBTDiamond.depositToAave(consts("DAI_ADDR"), qtyInDAI);

        //Check that the account now has aDAI equal to the DAI we deposited
        startAdaiQty = await adaiContract.balanceOf(tuffVBTDiamond.address);
        expect(new BN(qtyInDAI.toString())).to.be.bignumber.equal(new BN(startAdaiQty.toString()));

        //Mine new txs and blocks to simulate activity and time passing
        await backTestUtils.simulateBlockChainActivity();

        //Check that we have earned aDAI
        const endAdaiQty = await adaiContract.balanceOf(tuffVBTDiamond.address);
        expect(new BN(endAdaiQty.toString())).to.be.bignumber.greaterThan(new BN(startAdaiQty.toString()));
        console.log(`Started with ${hre.ethers.utils.formatEther(startAdaiQty)} aDAI and ended with ${hre.ethers.utils.formatEther(endAdaiQty)} aDAI`);
    });
});
