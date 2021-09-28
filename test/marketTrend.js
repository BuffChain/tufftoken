// SPDX-License-Identifier: agpl-3.0

const { expect } = require("chai");
const { ethers } = require("hardhat");
const hre = require("hardhat");

describe('MarketTrend', function () {

    let owner;
    let accounts;
    let marketTrend;

    before(async function () {
        const { contractOwner } = await hre.getNamedAccounts();
        owner = await hre.ethers.getSigner(contractOwner);

        //Per `hardhat.config.js`, the 0 and 1 index accounts are named accounts. They are reserved for deployment uses
        [,, ...accounts] = await hre.ethers.getSigners();
    });

    beforeEach(async function () {
        const { MarketTrend } = await hre.deployments.fixture();
        marketTrend = await hre.ethers.getContractAt(MarketTrend.abi, MarketTrend.address, owner);
    });

    it('should get price', async () => {
        const price = await marketTrend.getPrice();
        expect(price >= 300000000000 && price <= 310000000000).to.equal(true, "unexpected price.");
    });

    it('should create tracking period', async () => {
        await marketTrend.createTrackingPeriod(1632672415, 1632672416);
        const currentIndex = await marketTrend.getCurrentTrackingPeriodIndex();
        expect(currentIndex).to.equal(0, "current index should be 0.");
    });

    it('should get is buy back needed', async () => {
        const isNeeded = await marketTrend.isBuyBackNeeded(1, 0);
        expect(isNeeded).to.equal(true, "buy back should be needed.");
    });

    it('should get is buy back fulfilled', async () => {
        await marketTrend.createTrackingPeriod(1632672415, 1632672416);
        const currentIndex = await marketTrend.getCurrentTrackingPeriodIndex();
        let isFulfilled = await marketTrend.getIsBuyBackFulfilled(currentIndex);
        expect(isFulfilled).to.equal(false, "buy back should not be fulfilled yet.");

        await marketTrend.setIsBuyBackFulfilled(currentIndex, true);
        isFulfilled = await marketTrend.getIsBuyBackFulfilled(currentIndex);
        expect(isFulfilled).to.equal(true, "buy back should be fulfilled.");
    });


    it('should process market trend', async () => {

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

    });

});
