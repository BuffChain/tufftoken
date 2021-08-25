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

    it('should deposit dai into aave', async () => {
        // const aaveLPManagerInstance = await AaveLPManager.deployed();
        // const loanId = await aaveLPManagerInstance.stake.call();
    });
});
