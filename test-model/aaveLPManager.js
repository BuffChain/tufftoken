// SPDX-License-Identifier: agpl-3.0

const {expect} = require("chai");
const {
    BN,           // Big Number support
    constants,    // Common constants, like the zero address and largest integers
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');
const hre = require("hardhat");

const testModelUtils = require("./utils");
const {consts} = require("../utils/consts");

describe('AaveLPManager', function () {
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
        aaveDaiIncome = await tuffTokenDiamond.getAaveIncome(consts("DAI_ADDR"));
        console.log(aaveDaiIncome.toString());

        await testModelUtils.mineBlock();
        await testModelUtils.sendTxsFromBlocks(13302360, 13302370);
    });

    it('should have increased income', async () => {
        const updateAaveDaiIncome = await tuffTokenDiamond.getAaveIncome(consts("DAI_ADDR"));
        console.log(updateAaveDaiIncome.toString());

        const actualIncomeDiff = updateAaveDaiIncome.sub(aaveDaiIncome);
        const expectedDiff = hre.ethers.BigNumber.from("15492183832529379515");
        console.log(`Expected diff is ${hre.ethers.utils.formatEther(expectedDiff)} ether`);
        expect(actualIncomeDiff).to.be.eq(expectedDiff);
    });
});
