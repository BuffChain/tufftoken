// SPDX-License-Identifier: agpl-3.0

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('MarketTrend', function () {

    let owner;
    let accounts;

    let priceConsumerFactory;
    let priceConsumer;

    let marketTrendFactory;
    let marketTrend;

    before(async function () {
        priceConsumerFactory = await ethers.getContractFactory("PriceConsumer");
        marketTrendFactory = await ethers.getContractFactory("MarketTrend");
    });

    beforeEach(async function () {
        [owner, ...accounts] = await ethers.getSigners();

        // Total Marketcap / USD
        // https://docs.chain.link/docs/ethereum-addresses/
        const aggregatorAddress = "0xEC8761a0A73c34329CA5B1D3Dc7eD07F30e836e2";
        priceConsumer = await priceConsumerFactory.deploy(aggregatorAddress);
        await priceConsumer.deployed();

        marketTrend = await marketTrendFactory.deploy(priceConsumer.address);
        await marketTrend.deployed();

    });

    it('should get current tracking period index', async () => {
        const currentIndex = await marketTrend.getCurrentTrackingPeriodIndex();
        expect(currentIndex).to.equal(0, "current index should be 0.");
    });

    it('should get current tracking period meta data', async () => {
        const currentIndex = await marketTrend.getCurrentTrackingPeriodIndex();

        const [periodStartTimestamp, periodEndTimestamp, isActive] =
            await marketTrend.getTrackingPeriodMetaData(currentIndex);

        expect(isActive).to.equal(true, "should be active.");

        const timeDiff = periodEndTimestamp.toNumber() - periodStartTimestamp.toNumber();

        const daysDiff = Math.floor(timeDiff/60/60/24);

        expect(daysDiff >= 30 && daysDiff <= 120).to.equal(true, "tracking period should be between 30 and 120 days.");

    });


    it('should get tracking period has ended', async () => {

        const currentIndex = await marketTrend.getCurrentTrackingPeriodIndex();
        expect(currentIndex).to.equal(0, "current index should be 0.");

        const hasEnded = await marketTrend.hasTrackingPeriodEnded(currentIndex);

        expect(hasEnded).to.not.equal(true, "should not be ended.");

    });

    it('should process tracking period', async () => {

        let currentIndex = await marketTrend.getCurrentTrackingPeriodIndex();

        await marketTrend.completeTrackingPeriod(currentIndex);

        const [periodStartTimestamp, periodEndTimestamp, isActive] =
            await marketTrend.getTrackingPeriodMetaData(currentIndex);

        expect(isActive).to.equal(false, "active indicator should be false.");

        const [
            startRoundID,
            startPrice,
            startStartedAt,
            startTimeStamp,
            startAnsweredInRound
        ] = await marketTrend.getTrackingPeriodRoundData(currentIndex, true);

        expect(startPrice).to.not.equal(0, "start price should not be 0.");

        const [
            endRoundID,
            endPrice,
            endStartedAt,
            endTimeStamp,
            endAnsweredInRound
        ] = await marketTrend.getTrackingPeriodRoundData(currentIndex, false);

        expect(endPrice).to.not.equal(0, "end price should not be 0.");

        const isBuyBackNeeded = await marketTrend.isBuyBackNeeded(startPrice, endPrice);
        expect(isBuyBackNeeded).to.equal(false, "buy back should not be needed.");

        await marketTrend.createTrackingPeriod();

        currentIndex = await marketTrend.getCurrentTrackingPeriodIndex();
        expect(currentIndex).to.equal(1, "current index should be 1.");

    });

    it('should get is buy back needed', async () => {

        let isBuyBackNeeded = await marketTrend.isBuyBackNeeded(0, 1);
        expect(isBuyBackNeeded).to.equal(false, "buy back should not be needed.");

        isBuyBackNeeded = await marketTrend.isBuyBackNeeded(0, 0);
        expect(isBuyBackNeeded).to.equal(false, "buy back should not be needed.");

        isBuyBackNeeded = await marketTrend.isBuyBackNeeded(1, 0);
        expect(isBuyBackNeeded).to.equal(true, "buy back should be needed.");

    });


});
