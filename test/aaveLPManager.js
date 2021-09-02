// SPDX-License-Identifier: agpl-3.0

const { expect } = require("chai");
const { ethers } = require("hardhat");

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
    });

    it('should set pool address correctly', async () => {
        const address = await aaveLPManager.getLPAddr();

        //The correct address is pulled from https://docs.aave.com/developers/deployed-contracts/deployed-contracts
        expect(address).to.equal("0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9");
    });

    it('should deposit dai into aave', async () => {
        const daiAddr = "0x6B175474E89094C44Da98b954EedeAC495271d0F"

        await aaveLPManager.deposit(daiAddr, 5);
    });
});
