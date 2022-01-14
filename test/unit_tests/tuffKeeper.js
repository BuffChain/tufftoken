// SPDX-License-Identifier: agpl-3.0

const {expect} = require("chai");
const hre = require("hardhat");
const {randomBytes} = require('crypto');
const Web3 = require('web3');
const {mineBlock} = require("../../utils/back_test_utils");
const web3 = new Web3('wss://mainnet.infura.io/ws/v3/'  +  process.env.INFURA_KEY);

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


    it('should perform upkeep', async () => {

        const interval = await tuffTokenDiamond.getInterval();
        const dayInSeconds = 86400;

        expect(interval).to.equal(dayInSeconds, "interval should be 1 day.");

        const startingTimeStamp = await tuffTokenDiamond.getLastTimestamp();

        let [needed, performData] = await tuffTokenDiamond.checkUpkeep(randomBytes(0));

        expect(needed).to.equal(false, "should not need upkeep yet.");

        const expectedBlockTimestamp = parseInt(web3.utils.toAscii(performData));

        let latestBlock = await hre.ethers.provider.getBlock("latest")
        const startingBlockTimestamp = latestBlock.timestamp;

        expect(startingBlockTimestamp).to.equal(expectedBlockTimestamp, "perform data should be block timestamp.");

        // shorten interval to appease isIntervalComplete
        await tuffTokenDiamond.setInterval(1);

        await mineBlock();

        latestBlock = await hre.ethers.provider.getBlock("latest")
        const latestTimestamp = latestBlock.timestamp;

        expect(latestTimestamp > startingBlockTimestamp).to.equal(true, "should have mined a block.");

        [needed, performData] = await tuffTokenDiamond.checkUpkeep(randomBytes(0));

        expect(needed).to.equal(true, "should need upkeep.");

        await tuffTokenDiamond.performUpkeep(performData);

        const endingTimestamp = await tuffTokenDiamond.getLastTimestamp();

        expect(endingTimestamp > startingTimeStamp).to.equal(true, "incorrect timestamp.");

    });

});
