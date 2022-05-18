// SPDX-License-Identifier: agpl-3.0

const {expect} = require("chai");
const hre = require("hardhat");
const {randomBytes} = require('crypto');
const Web3 = require('web3');
const {mineBlock} = require("../../utils/back_test_utils");
const utils = require("../../utils/test_utils");
const {consts} = require("../../utils/consts");

describe('TuffKeeper', function () {

    let owner;
    let accounts;

    let tuffVBTDiamond;

    before(async function () {
        const {contractOwner} = await hre.getNamedAccounts();
        owner = await hre.ethers.getSigner(contractOwner);

        //Per `hardhat.config.ts`, the 0 and 1 index accounts are named accounts. They are reserved for deployment uses
        [, , ...accounts] = await hre.ethers.getSigners();
    });

    beforeEach(async function () {
        const {tDUU} = await hre.deployments.fixture();
        tuffVBTDiamond = await hre.ethers.getContractAt(tDUU.abi, tDUU.address, owner);

        await utils.sendTokensToAddr(accounts.at(-1), tuffVBTDiamond.address);

        await tuffVBTDiamond.depositToAave(consts("DAI_ADDR"), hre.ethers.utils.parseEther("2000"));
    });


    it('should perform upkeep on token maturity', async () => {

        const interval = await tuffVBTDiamond.getTokenMaturityInterval();
        const dayInSeconds = 86400;

        expect(interval).to.equal(dayInSeconds, "interval should be 1 day.");

        await assertUpkeep(setTokenMaturityInterval, getLastTokenMaturityTimestamp)


    });

    it('should perform upkeep on balancing assets', async () => {

        const interval = await tuffVBTDiamond.getBalanceAssetsInterval();
        const weekInSeconds = 86400 * 7;

        expect(interval).to.equal(weekInSeconds, "interval should be 1 week.");

        await assertUpkeep(setBalanceAssetsInterval, getLastBalanceAssetsTimestamp)

    });

    async function getLastTokenMaturityTimestamp() {
        return await tuffVBTDiamond.getLastTokenMaturityTimestamp();
    }

    async function getLastBalanceAssetsTimestamp() {
        return await tuffVBTDiamond.getLastBalanceAssetsTimestamp();
    }

    async function setTokenMaturityInterval(newInterval) {
        await tuffVBTDiamond.setTokenMaturityInterval(newInterval);
    }

    async function setBalanceAssetsInterval(newInterval) {
        await tuffVBTDiamond.setBalanceAssetsInterval(newInterval);
    }

    async function assertUpkeep(setInterval, getTimestamp) {
        const startingTimeStamp = await getTimestamp();

        let [needed, performData] = await tuffVBTDiamond.checkUpkeep(randomBytes(0));

        expect(needed).to.equal(false, "should not need upkeep yet.");

        const expectedBlockTimestamp = parseInt(Web3.utils.toAscii(performData));

        let latestBlock = await hre.ethers.provider.getBlock("latest")
        const startingBlockTimestamp = latestBlock.timestamp;

        expect(startingBlockTimestamp).to.equal(expectedBlockTimestamp, "perform data should be block timestamp.");

        // shorten intervals to appease isIntervalComplete
        await setInterval(1);

        await mineBlock();

        latestBlock = await hre.ethers.provider.getBlock("latest")
        let latestTimestamp = latestBlock.timestamp;

        expect(latestTimestamp > startingBlockTimestamp).to.equal(true, "should have mined a block.");

        [needed, performData] = await tuffVBTDiamond.checkUpkeep(randomBytes(0));

        expect(needed).to.equal(true, "should need upkeep.");

        await tuffVBTDiamond.performUpkeep(performData);

        const endingTimestamp = await getTimestamp();

        expect(endingTimestamp > startingTimeStamp).to.equal(true,
            "last timestamp that performed upkeep should greater than the starting value");

        latestBlock = await hre.ethers.provider.getBlock("latest")
        latestTimestamp = latestBlock.timestamp;

        expect(latestTimestamp.toString()).to.equal(endingTimestamp,
            "last timestamp that performed upkeep should be the latest block.");
    }

});
