// SPDX-License-Identifier: agpl-3.0

const { expect } = require("chai");
const {
    BN,           // Big Number support
    constants,    // Common constants, like the zero address and largest integers
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');
const hre = require("hardhat");

const utils = require("./utils")

describe('AaveLPManager', function () {

    let owner;
    let accounts;

    let aaveLPManager;
    let farmTreasury;
    let tuffToken;

    before(async function () {
        const { contractOwner } = await hre.getNamedAccounts();
        owner = await hre.ethers.getSigner(contractOwner);

        //Per `hardhat.config.js`, the 0 and 1 index accounts are named accounts. They are reserved for deployment uses
        [,, ...accounts] = await hre.ethers.getSigners();
    });

    beforeEach(async function () {
        const { AaveLPManager, FarmTreasury, TuffToken } = await hre.deployments.fixture();
        aaveLPManager = await hre.ethers.getContractAt(AaveLPManager.abi, AaveLPManager.address,  owner);
        farmTreasury = await hre.ethers.getContractAt(FarmTreasury.abi, FarmTreasury.address, owner);
        tuffToken = await hre.ethers.getContractAt(TuffToken.abi, TuffToken.address, owner);

        // await utils.sendTokensToAddress(accounts.at(-1), tuffToken.address);
        await utils.sendTokensToAddress(accounts.at(-2), aaveLPManager.address); //Need to pay gas fees
        await utils.sendTokensToAddress(accounts.at(-3), farmTreasury.address); //Need to fund the treasury
    });

    it('should set pool address correctly', async () => {
        const address = await aaveLPManager.getLPAddr();

        //The correct address is pulled from https://docs.aave.com/developers/deployed-contracts/deployed-contracts
        expect(address).to.equal("0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9");
    });

    it('should be owned by FarmTreasury', async () => {
        const owner_address = await aaveLPManager.owner();
        expect(owner_address).to.equal(farmTreasury.address);
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
