// SPDX-License-Identifier: agpl-3.0

const {expect} = require("chai");
const hre = require("hardhat");

const {CHAINLINK_PRICE_CONSUMER_ENUM, UNISWAP_PRICE_CONSUMER_ENUM} = require("../../utils/consts");
const {BN} = require("@openzeppelin/test-helpers");
const {randomBytes} = require('crypto');

describe('MarketTrend', function () {
    const nowTimeStamp = Math.floor(Date.now() / 1000);

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

    async function assertPrice() {
        const price = await tuffTokenDiamond.getPrice();

        expect(price > 0).to.equal(true, "unexpected price.");
    }

    async function createTrackingPeriod() {
        await tuffTokenDiamond.createTrackingPeriod(nowTimeStamp, nowTimeStamp + 1);
        const priceDataEntriesLength = await tuffTokenDiamond.getPriceDataEntriesLength();
        expect(priceDataEntriesLength).to.equal(1, "current index should be 0.");
    }

    async function processMarketTrend() {
        let isBuyBackNeeded = await tuffTokenDiamond.getIsBuyBackNeeded();
        expect(isBuyBackNeeded).to.equal(false, "buy back should not be needed.");

        await tuffTokenDiamond.createTrackingPeriod(nowTimeStamp, nowTimeStamp + 7);

        const startingPrice = await tuffTokenDiamond.getPrice();

        await tuffTokenDiamond.pushPriceData(nowTimeStamp + 2, new BN((BigInt(startingPrice) + BigInt(1)).toString()).toString());
        await tuffTokenDiamond.pushPriceData(nowTimeStamp + 3, new BN((BigInt(startingPrice) + BigInt(2)).toString()).toString());
        await tuffTokenDiamond.pushPriceData(nowTimeStamp + 4, new BN((BigInt(startingPrice) + BigInt(3)).toString()).toString());
        await tuffTokenDiamond.pushPriceData(nowTimeStamp + 5, new BN((BigInt(startingPrice) + BigInt(4)).toString()).toString());
        await tuffTokenDiamond.pushPriceData(nowTimeStamp + 6, new BN((BigInt(startingPrice) + BigInt(5)).toString()).toString());
        await tuffTokenDiamond.pushPriceData(nowTimeStamp + 7, new BN((BigInt(startingPrice) + BigInt(6)).toString()).toString());


        //bullish trends
        await tuffTokenDiamond.processMarketTrend(nowTimeStamp + 8, new BN((BigInt(startingPrice) + BigInt(7)).toString()).toString());

        isBuyBackNeeded = await tuffTokenDiamond.getIsBuyBackNeeded();
        expect(isBuyBackNeeded).to.equal(false, "buy back should not be needed.");

        await tuffTokenDiamond.processMarketTrend(nowTimeStamp + 9, "" + (startingPrice + 8));

        isBuyBackNeeded = await tuffTokenDiamond.getIsBuyBackNeeded();
        expect(isBuyBackNeeded).to.equal(false, "buy back should not be needed.");


        //bearish trend
        let increment = 0;
        while (!isBuyBackNeeded) {

            const newPrice = new BN((BigInt(startingPrice) - BigInt(increment)).toString()).toString();

            await tuffTokenDiamond.processMarketTrend(nowTimeStamp + 10, newPrice);

            isBuyBackNeeded = await tuffTokenDiamond.getIsBuyBackNeeded();

            const [buyBackChance, chosenNumber] = await tuffTokenDiamond.getLastBuyBackChoiceResults();

            if (hre.hardhatArguments.verbose) {
                console.log(`Current Buy Back Conditions: chance=${buyBackChance}%, choice=${chosenNumber}`);
            }

            increment += 1;
        }

        if (hre.hardhatArguments.verbose) {
            console.log(`Buy Back needed after ${increment} negative price changes`);
        }
        expect(isBuyBackNeeded).to.equal(true, "buy back should be needed.");

    }

    it('should get price random number', async () => {
        const rangeStart = 1;
        const rangeEnd = 100;
        const choice = await tuffTokenDiamond.getPseudoRandomNumber(rangeStart, rangeEnd);
        expect(choice >= rangeStart && choice <= rangeEnd).to.equal(true, "unexpected choice.");
    });

    it('should get price consumer address: UNISWAP', async () => {
        await tuffTokenDiamond.setPriceConsumer(UNISWAP_PRICE_CONSUMER_ENUM);
        const priceConsumer = await tuffTokenDiamond.getPriceConsumer();
        expect(priceConsumer).to.equal(UNISWAP_PRICE_CONSUMER_ENUM, "current price consumer should be uniswap.");
    });

    it('should get price: UNISWAP', async () => {
        await assertPrice();
    });

    it('should create tracking period: UNISWAP', async () => {
        await createTrackingPeriod();
    });

    it('should process market trend: UNISWAP', async () => {
        await processMarketTrend();
    });

    it('should get price consumer address: CHAINLINK', async () => {
        await tuffTokenDiamond.setPriceConsumer(CHAINLINK_PRICE_CONSUMER_ENUM);
        const priceConsumer = await tuffTokenDiamond.getPriceConsumer();
        expect(priceConsumer).to.equal(CHAINLINK_PRICE_CONSUMER_ENUM, "current price consumer should be link.");
    });

    it('should get price: CHAINLINK', async () => {
        await assertPrice();
    });

    it('should create tracking period: CHAINLINK', async () => {
        await tuffTokenDiamond.setPriceConsumer(CHAINLINK_PRICE_CONSUMER_ENUM);
        await createTrackingPeriod();
    });

    it('should process market trend: CHAINLINK', async () => {
        await tuffTokenDiamond.setPriceConsumer(CHAINLINK_PRICE_CONSUMER_ENUM);
        await processMarketTrend();
    });

    it('should call check up keep', async () => {

        let [needed, performData] = await tuffTokenDiamond.checkUpkeep(randomBytes(0));

        expect(needed).to.equal(false, "should need upkeep.");

    });

    it('should call perform upkeep', async () => {

        await tuffTokenDiamond.createTrackingPeriod(nowTimeStamp, nowTimeStamp + 1);

        await tuffTokenDiamond.performUpkeep(randomBytes(0));

    });
});
