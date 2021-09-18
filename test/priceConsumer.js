// SPDX-License-Identifier: agpl-3.0

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('PriceConsumer', function () {

    let owner;
    let accounts;

    let priceConsumerFactory;
    let priceConsumer;

    before(async function () {
        priceConsumerFactory = await ethers.getContractFactory("PriceConsumer");
    });

    beforeEach(async function () {
        [owner, ...accounts] = await ethers.getSigners();

        // Total Marketcap / USD
        // https://docs.chain.link/docs/ethereum-addresses/
        const aggregatorAddress = "0xEC8761a0A73c34329CA5B1D3Dc7eD07F30e836e2";
        priceConsumer = await priceConsumerFactory.deploy(aggregatorAddress);
        await priceConsumer.deployed();
    });

    it('should get latest price', async () => {
        const [
            roundID,
            price,
            startedAt,
            timeStamp,
            answeredInRound
        ] = await priceConsumer.getLatestRoundData();

        expect(price).to.not.equal(0, "should not be 0.");
    });

    it('should get previous price', async () => {
        const [
            roundID,
            price,
            startedAt,
            timeStamp,
            answeredInRound
        ] = await priceConsumer.getPrevRoundData();

        expect(price).to.not.equal(0, "should not be 0.");
    });

    it('should set new price feed', async () => {

        const [
            roundID1,
            price1,
            startedAt1,
            timeStamp1,
            answeredInRound1
        ] = await priceConsumer.getLatestRoundData();

        expect(price1).to.not.equal(0, "should not be 0.");

        // ETH / USD
        // https://docs.chain.link/docs/ethereum-addresses/
        const aggregatorAddress = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419";

        await priceConsumer.setPriceFeed(aggregatorAddress);

        const [
            roundID2,
            price2,
            startedAt2,
            timeStamp2,
            answeredInRound2
        ] = await priceConsumer.getLatestRoundData();

        expect(price2).to.not.equal(0, "should not be 0.");

        expect(price1).to.not.equal(price2, "price should not be equal.");
    });

    it('should compare round data', async () => {

        await priceConsumer.setPrevRoundData(0, 0, 0, 0, 0)

        const [
            roundID,
            price,
            startedAt,
            timeStamp,
            answeredInRound
        ] = await priceConsumer.getLatestRoundData();

        const [
            prevRoundID,
            prevPrice,
            prevStartedAt,
            prevTimeStamp,
            prevAnsweredInRound
        ] = await priceConsumer.getPrevRoundData();

        expect(prevRoundID).to.not.equal(roundID, "round should not be equal.");

    });

});
