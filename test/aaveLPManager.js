// SPDX-License-Identifier: agpl-3.0

const { expect } = require("chai");
const {
    BN,           // Big Number support
    constants,    // Common constants, like the zero address and largest integers
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

const { ethers } = require("hardhat");
const utils = require("./utils")
const hre = require("hardhat");

describe('AaveLPManager', function () {

    let owner;
    let accounts;

    let tuffTokenFactory;
    let tuffToken;

    let farmTreasuryFactory;
    let farmTreasury;

    let aaveLPManagerFactory;
    let aaveLPManager;

    before(async function () {
        tuffTokenFactory = await ethers.getContractFactory("TuffToken");
        farmTreasuryFactory = await ethers.getContractFactory("FarmTreasury");
        aaveLPManagerFactory = await ethers.getContractFactory("AaveLPManager");
    });

    beforeEach(async function () {
        [owner, ...accounts] = await ethers.getSigners();

        aaveLPManager = await aaveLPManagerFactory.deploy();
        await aaveLPManager.deployed();

        farmTreasury = await farmTreasuryFactory.deploy(aaveLPManager.address);
        await farmTreasury.deployed();

        tuffToken = await tuffTokenFactory.deploy(farmTreasury.address);
        await tuffToken.deployed();

        // await utils.sendTokensToAddress(accounts.at(-1), tuffToken.address);
        await utils.sendTokensToAddress(accounts.at(-2), aaveLPManager.address); //Need to pay gas fees
        await utils.sendTokensToAddress(accounts.at(-3), farmTreasury.address); //Need to fund the treasury
    });

    it('should set pool address correctly', async () => {
        const address = await aaveLPManager.getLPAddr();

        //The correct address is pulled from https://docs.aave.com/developers/deployed-contracts/deployed-contracts
        expect(address).to.equal("0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9");
    });

    it('should deposit dai into aave from FarmTreasury', async () => {
        const qtyInDAI = hre.ethers.utils.parseEther("2000");
        const lpAddr = await aaveLPManager.getLPAddr();

        //Check that the account has enough DAI
        const daiContract = await utils.getDAIContract();
        const startDaiQty = await daiContract.balanceOf(aaveLPManager.address);
        expect(new BN(startDaiQty.toString())).to.be.bignumber.greaterThan(new BN(qtyInDAI.toString()));

        //Check that the account has no ADAI
        const adaiContract = await utils.getADAIContract();
        const startAdaiQty = await adaiContract.balanceOf(farmTreasury.address);
        expect(new BN(0)).to.be.bignumber.equal(new BN(startAdaiQty.toString()));

        //Make the deposit
        const aaveLPManagerAcct = await hre.ethers.getSigner(aaveLPManager.address);
        await utils.runCallbackImpersonatingAcct(aaveLPManagerAcct, async (acct) => {
            //TODO: Move `approve()` into contract itself?
            await daiContract.connect(acct).approve(lpAddr, qtyInDAI);
            await aaveLPManager.connect(acct).deposit(utils.DAI_ADDRESS, qtyInDAI, farmTreasury.address);
        });

        //Check that the account has deposited the DAI
        const endDaiQty = await daiContract.balanceOf(aaveLPManager.address);
        expect(new BN(endDaiQty.toString())).to.be.bignumber.equal(new BN(startDaiQty.sub(qtyInDAI).toString()));

        //Check that the account now has aDAI equal to the DAI we deposited
        const endAdaiQty = await adaiContract.balanceOf(farmTreasury.address);
        expect(new BN(qtyInDAI.toString())).to.be.bignumber.equal(new BN(endAdaiQty.toString()));
    });
});
