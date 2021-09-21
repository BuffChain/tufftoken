// SPDX-License-Identifier: agpl-3.0

const { expect } = require("chai");
const { ethers } = require("hardhat");
const utils = require("./utils")
const hre = require("hardhat");
const {BigNumber} = require("ethers");

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

        await utils.sendTokensToAddress(accounts.at(-1), tuffToken.address);
        await utils.sendTokensToAddress(accounts.at(-2), aaveLPManager.address);
        await utils.sendTokensToAddress(accounts.at(-3), farmTreasury.address);
    });

    it('should set pool address correctly', async () => {
        const address = await aaveLPManager.getLPAddr();

        //The correct address is pulled from https://docs.aave.com/developers/deployed-contracts/deployed-contracts
        expect(address).to.equal("0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9");
    });

    it('should deposit dai into aave', async () => {
        const qtyInDAI = hre.ethers.utils.parseEther("2000");
        const daiContract = await utils.getDAIContract();
        const lpAddr = await aaveLPManager.getLPAddr();

        const aaveLPManagerAcct = await hre.ethers.getSigner(aaveLPManager.address);
        await utils.runCallbackImpersonatingAcct(aaveLPManagerAcct, async (acct) => {
            await daiContract.connect(acct).approve(aaveLPManager.address, qtyInDAI);
            await daiContract.connect(acct).approve(farmTreasury.address, qtyInDAI);
            await daiContract.connect(acct).approve(tuffToken.address, qtyInDAI);
            await daiContract.connect(acct).approve(lpAddr, qtyInDAI);

            console.log(`Depositing [${hre.ethers.utils.formatEther(qtyInDAI.div(2))}] DAI`);
            // await aaveLPManager.connect(acct).deposit(utils.DAI_ADDRESS, qtyInDAI.div(2), tuffToken.address);
        });

        const tuffTokenAcct = await hre.ethers.getSigner(tuffToken.address);
        const stakeOwner = tuffToken.address;
        await utils.runCallbackImpersonatingAcct(tuffTokenAcct, async (acct) => {
            await daiContract.connect(acct).approve(aaveLPManager.address, qtyInDAI);
            await daiContract.connect(acct).approve(farmTreasury.address, qtyInDAI);
            await daiContract.connect(acct).approve(tuffToken.address, qtyInDAI);
            await daiContract.connect(acct).approve(lpAddr, qtyInDAI);
            // await aaveLPManager.connect(acct).approve(lpAddr, qtyInDAI);

            console.log(`Depositing [${hre.ethers.utils.formatEther(qtyInDAI.div(2))}] DAI`);
            await aaveLPManager.connect(acct).deposit(utils.DAI_ADDRESS, qtyInDAI.div(2), stakeOwner);
        });
    });
});
