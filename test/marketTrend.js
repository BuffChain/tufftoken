// SPDX-License-Identifier: agpl-3.0

const { expect } = require("chai");
const hre = require("hardhat");

describe('MarketTrend', function () {

    let owner;
    let accounts;
    let marketTrend;
    let chainLinkPriceConsumerAddress;
    let uniswapPriceConsumerAddress;

    before(async function () {
        const { contractOwner } = await hre.getNamedAccounts();
        owner = await hre.ethers.getSigner(contractOwner);

        //Per `hardhat.config.js`, the 0 and 1 index accounts are named accounts. They are reserved for deployment uses
        [,, ...accounts] = await hre.ethers.getSigners();
    });

    beforeEach(async function () {
        const { MarketTrend, ChainLinkPriceConsumer, UniswapPriceConsumer } = await hre.deployments.fixture();
        marketTrend = await hre.ethers.getContractAt(MarketTrend.abi, MarketTrend.address, owner);
        uniswapPriceConsumerAddress = UniswapPriceConsumer.address;
        chainLinkPriceConsumerAddress = ChainLinkPriceConsumer.address;
    });

    async function assertPrice(expectedPrice) {
        const price = await marketTrend.getPrice();
        expect(price).to.equal(expectedPrice, "unexpected price.");
    }

    async function createTrackingPeriod() {
        await marketTrend.createTrackingPeriod(1632672415, 1632672416);
        const currentIndex = await marketTrend.getCurrentTrackingPeriodIndex();
        expect(currentIndex).to.equal(0, "current index should be 0.");
    }

    async function isBuyBackNeeded() {
        const isNeeded = await marketTrend.isBuyBackNeeded(1, 0);
        expect(isNeeded).to.equal(true, "buy back should be needed.");
    }

    async function isBuyBackFulfilled() {
        await marketTrend.createTrackingPeriod(1632672415, 1632672416);
        const currentIndex = await marketTrend.getCurrentTrackingPeriodIndex();
        let isFulfilled = await marketTrend.getIsBuyBackFulfilled(currentIndex);
        expect(isFulfilled).to.equal(false, "buy back should not be fulfilled yet.");

        await marketTrend.setIsBuyBackFulfilled(currentIndex, true);
        isFulfilled = await marketTrend.getIsBuyBackFulfilled(currentIndex);
        expect(isFulfilled).to.equal(true, "buy back should be fulfilled.");
    }

    async function processMarketTrend() {
        let isBuyBackNeeded = await marketTrend.anyBuyBacksRequired();
        expect(isBuyBackNeeded).to.equal(false, "buy back should not be needed.");

        await marketTrend.createTrackingPeriod(1632672415, 1632672416);

        let currentIndex = await marketTrend.getCurrentTrackingPeriodIndex();
        expect(currentIndex).to.equal(0, "current index should be 0.");

        const startingPrice = await marketTrend.getPrice();

        await marketTrend.pushPriceData(startingPrice + 1);
        await marketTrend.pushPriceData(startingPrice + 2);
        await marketTrend.pushPriceData(startingPrice + 3);
        await marketTrend.pushPriceData(startingPrice + 4);
        await marketTrend.pushPriceData(startingPrice + 5);
        await marketTrend.pushPriceData(startingPrice + 6);


        //bullish trends
        await marketTrend.processMarketTrend(1632672418, startingPrice + 7);

        currentIndex = await marketTrend.getCurrentTrackingPeriodIndex();
        expect(currentIndex).to.equal(0, "current index should be 0.");

        isBuyBackNeeded = await marketTrend.anyBuyBacksRequired();
        expect(isBuyBackNeeded).to.equal(false, "buy back should not be needed.");


        await marketTrend.processMarketTrend(1632672418, startingPrice + 8);

        currentIndex = await marketTrend.getCurrentTrackingPeriodIndex();
        expect(currentIndex).to.equal(0, "current index should be 0.");

        isBuyBackNeeded = await marketTrend.anyBuyBacksRequired();
        expect(isBuyBackNeeded).to.equal(false, "buy back should not be needed.");


        //bearish trend
        await marketTrend.processMarketTrend(1632672418, startingPrice - 1);

        currentIndex = await marketTrend.getCurrentTrackingPeriodIndex();
        expect(currentIndex).to.equal(1, "current index should be 1.");

        isBuyBackNeeded = await marketTrend.anyBuyBacksRequired();
        expect(isBuyBackNeeded).to.equal(true, "buy back should be needed.");
    }

    it('should get price consumer address: UNISWAP', async () => {
        const priceConsumer = await marketTrend.getPriceConsumer();
        expect(priceConsumer).to.equal(uniswapPriceConsumerAddress, "current price consumer should be uniswap.");
    });

    it('should get price: UNISWAP', async () => {
        await assertPrice(3030);
    });

    it('should create tracking period: UNISWAP', async () => {
        await createTrackingPeriod();
    });

    it('should get is buy back needed: UNISWAP', async () => {
        await isBuyBackNeeded();
    });

    it('should get is buy back fulfilled: UNISWAP', async () => {
        await isBuyBackFulfilled();
    });

    it('should process market trend: UNISWAP', async () => {
        await processMarketTrend();
    });

    it('should get price consumer address: CHAINLINK', async () => {
        await marketTrend.setPriceConsumer(chainLinkPriceConsumerAddress);
        const priceConsumer = await marketTrend.getPriceConsumer();
        expect(priceConsumer).to.equal(chainLinkPriceConsumerAddress, "current price consumer should be link.");
    });

    it('should get price: CHAINLINK', async () => {
        await marketTrend.setPriceConsumer(chainLinkPriceConsumerAddress);
        await assertPrice(306406750447);
    });

    it('should create tracking period: CHAINLINK', async () => {
        await marketTrend.setPriceConsumer(chainLinkPriceConsumerAddress);
        await createTrackingPeriod();
    });

    it('should get is buy back needed: CHAINLINK', async () => {
        await marketTrend.setPriceConsumer(chainLinkPriceConsumerAddress);
        await isBuyBackNeeded();
    });

    it('should get is buy back fulfilled: CHAINLINK', async () => {
        await marketTrend.setPriceConsumer(chainLinkPriceConsumerAddress);
        await isBuyBackFulfilled();
    });

    it('should process market trend: CHAINLINK', async () => {
        await marketTrend.setPriceConsumer(chainLinkPriceConsumerAddress);
        await processMarketTrend();
    });

});
