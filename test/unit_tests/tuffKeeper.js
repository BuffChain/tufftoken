// SPDX-License-Identifier: agpl-3.0

const {expect} = require("chai");
const hre = require("hardhat");
const {randomBytes} = require('crypto');

describe('TuffKeeper', function () {

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
    });


    it('should call check up keep', async () => {

        let [needed, performData] = await tuffTokenDiamond.checkUpkeep(randomBytes(0));

        expect(needed).to.equal(false, "should need upkeep.");

    });

    it('should call perform upkeep', async () => {


        await tuffTokenDiamond.performUpkeep(randomBytes(0));

    });

});
