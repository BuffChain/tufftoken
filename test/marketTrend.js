// SPDX-License-Identifier: agpl-3.0

const { expect } = require("chai");
const hre = require("hardhat");
const { smockit } = require("@eth-optimism/smock");
const {randomBytes} = require("ethers/lib/utils");

describe('MarketTrend', function () {

    let owner;
    let accounts;
    let marketTrend;
    let chainLinkPriceConsumer;
    let uniswapPriceConsumer;
    let marketTrendKeeperHelper;
    const nowTimeStamp = Math.floor(Date.now() / 1000);

    before(async function () {
        const { contractOwner } = await hre.getNamedAccounts();
        owner = await hre.ethers.getSigner(contractOwner);

        //Per `hardhat.config.js`, the 0 and 1 index accounts are named accounts. They are reserved for deployment uses
        [,, ...accounts] = await hre.ethers.getSigners();
    });

    beforeEach(async function () {
        const { MarketTrend, ChainLinkPriceConsumer, UniswapPriceConsumer, MarketTrendKeeperHelper } = await hre.deployments.fixture();
        marketTrend = await hre.ethers.getContractAt(MarketTrend.abi, MarketTrend.address, owner);
        chainLinkPriceConsumer = await hre.ethers.getContractAt(ChainLinkPriceConsumer.abi, ChainLinkPriceConsumer.address, owner);
        uniswapPriceConsumer = await hre.ethers.getContractAt(UniswapPriceConsumer.abi, UniswapPriceConsumer.address, owner);
        marketTrendKeeperHelper = await hre.ethers.getContractAt(MarketTrendKeeperHelper.abi, MarketTrendKeeperHelper.address, owner);
    });

    async function assertPrice(priceConsumer) {

        const MockPriceConsumer = await smockit(priceConsumer);

        const mockedPrice = 3000;

        MockPriceConsumer.smocked.getPrice.will.return.with(mockedPrice);

        await marketTrend.setPriceConsumer(MockPriceConsumer.address);

        const price = await marketTrend.getPrice();

        expect(price).to.equal(mockedPrice, "unexpected price.");
    }

    async function createTrackingPeriod() {
        await marketTrend.createTrackingPeriod(nowTimeStamp, nowTimeStamp + 1);
        const start = await marketTrend.getTrackingPeriodStart();
        expect(start).to.equal(nowTimeStamp, "current index should be 0.");
    }

    async function isNegativeOrZeroPriceChange() {
        const isNeeded = await marketTrend.isNegativeOrZeroPriceChange(1, 0);
        expect(isNeeded).to.equal(true, "buy back should be needed.");
    }

    async function processMarketTrend() {

        await marketTrend.createTrackingPeriod(nowTimeStamp, nowTimeStamp + 1);

        const startingPrice = await marketTrend.getPrice();

        await marketTrend.pushPriceData(startingPrice + 1);
        await marketTrend.pushPriceData(startingPrice + 2);
        await marketTrend.pushPriceData(startingPrice + 3);
        await marketTrend.pushPriceData(startingPrice + 4);
        await marketTrend.pushPriceData(startingPrice + 5);
        await marketTrend.pushPriceData(startingPrice + 6);


        //bullish trends
        await marketTrend.processMarketTrend(startingPrice + 7);

        await marketTrend.processMarketTrend(startingPrice + 8);

        let isBuyBackNeeded = await marketTrend.getIsBuyBackNeeded();
        expect(isBuyBackNeeded).to.equal(false, "buy back should not be needed.");


        //bearish trend
        let increment = 0;
        while (!isBuyBackNeeded) {
            await marketTrend.processMarketTrend(startingPrice - increment);

            isBuyBackNeeded = await marketTrend.getIsBuyBackNeeded();

            const [buyBackChance, chosenNumber] = await marketTrend.getLastBuyBackChoiceResults();

            console.log(`Current Buy Back Conditions: chance=${buyBackChance}%, choice=${chosenNumber}`);

            increment += 1;

        }

        console.log(`Buy Back needed after ${increment} negative price changes`);

        expect(isBuyBackNeeded).to.equal(true, "buy back should be needed.");

    }

    it('should get price random number', async () => {
        const rangeStart = 1;
        const rangeEnd = 100;
        const choice = await marketTrend.getPseudoRandomNumber(rangeStart, rangeEnd);
        expect(choice >= rangeStart && choice <= rangeEnd).to.equal(true, "unexpected choice.");
    });

    it('should get price consumer address: UNISWAP', async () => {
        const priceConsumer = await marketTrend.getPriceConsumer();
        expect(priceConsumer).to.equal(uniswapPriceConsumer.address, "current price consumer should be uniswap.");
    });

    it('should get price: UNISWAP', async () => {
        await assertPrice(uniswapPriceConsumer);
    });

    it('should create tracking period: UNISWAP', async () => {
        await createTrackingPeriod();
    });

    it('should get is buy back needed: UNISWAP', async () => {
        await isNegativeOrZeroPriceChange();
    });

    it('should process market trend: UNISWAP', async () => {
        await processMarketTrend();
    });

    it('should get price consumer address: CHAINLINK', async () => {
        await marketTrend.setPriceConsumer(chainLinkPriceConsumer.address);
        const priceConsumer = await marketTrend.getPriceConsumer();
        expect(priceConsumer).to.equal(chainLinkPriceConsumer.address, "current price consumer should be link.");
    });

    it('should get price: CHAINLINK', async () => {
        await assertPrice(chainLinkPriceConsumer);
    });

    it('should create tracking period: CHAINLINK', async () => {
        await marketTrend.setPriceConsumer(chainLinkPriceConsumer.address);
        await createTrackingPeriod();
    });

    it('should get is buy back needed: CHAINLINK', async () => {
        await marketTrend.setPriceConsumer(chainLinkPriceConsumer.address);
        await isNegativeOrZeroPriceChange();
    });

    it('should process market trend: CHAINLINK', async () => {
        await marketTrend.setPriceConsumer(chainLinkPriceConsumer.address);
        await processMarketTrend();
    });

    it('should call check up keep', async () => {

        const MarketTrendKeeperHelper = await smockit(marketTrendKeeperHelper);

        MarketTrendKeeperHelper.smocked.upkeepNeeded.will.return.with(true);

        await marketTrend.setMarketTrendKeeperHelper(MarketTrendKeeperHelper.address);

        let [needed, performData] = await marketTrend.checkUpkeep(randomBytes(0));

        expect(needed).to.equal(true, "should need upkeep.");

    });

    it('should call perform upkeep', async () => {

        const MarketTrendKeeperHelper = await smockit(marketTrendKeeperHelper);

        MarketTrendKeeperHelper.smocked.upkeepNeeded.will.return.with(true);

        await marketTrend.setMarketTrendKeeperHelper(MarketTrendKeeperHelper.address);

        await marketTrend.createTrackingPeriod(nowTimeStamp, nowTimeStamp + 1);

        await marketTrend.performUpkeep(randomBytes(0));

    });


});
