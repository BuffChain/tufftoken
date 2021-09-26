// SPDX-License-Identifier: agpl-3.0

const { expect } = require("chai");
const { ethers } = require("hardhat");
const hre = require("hardhat");

describe('MarketTrend', function () {

    let owner;
    let accounts;
    let poolManager;
    let marketTrend;

    //    KOVAN
    //    tokenA: 0xd0A1E359811322d97991E03f863a0C30C2cF029C WETH9
    //    tokenB: 0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa DAI

    //    MAIN
    //    tokenA: 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2 WETH9
    //    tokenB: 0x6B175474E89094C44Da98b954EedeAC495271d0F DAI

    //    fees: 500, 3000, 10000

    let tokenA = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    let tokenB = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    let fee = 500;

    before(async function () {
        const { contractOwner } = await hre.getNamedAccounts();
        owner = await hre.ethers.getSigner(contractOwner);

        //Per `hardhat.config.js`, the 0 and 1 index accounts are named accounts. They are reserved for deployment uses
        [,, ...accounts] = await hre.ethers.getSigners();
    });

    beforeEach(async function () {
        const { UniswapV3PoolManager, MarketTrend } = await hre.deployments.fixture();
        poolManager = await hre.ethers.getContractAt(UniswapV3PoolManager.abi, UniswapV3PoolManager.address, owner);
        await poolManager.setPool(tokenA, tokenB, fee);

        marketTrend = await hre.ethers.getContractAt(MarketTrend.abi, MarketTrend.address, owner);
    });

    it('should create tracking period', async () => {
        await marketTrend.createTrackingPeriod(1632672415, 1632672416);
        const currentIndex = await marketTrend.getCurrentTrackingPeriodIndex();
        expect(currentIndex).to.equal(0, "current index should be 0.");
    });

    it('should get price', async () => {
        const price = await marketTrend.getPrice();
        expect(price).to.equal(3030, "unexpected price.");
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

        await marketTrend.pushPriceData(3030);
        await marketTrend.pushPriceData(3031);
        await marketTrend.pushPriceData(3032);
        await marketTrend.pushPriceData(3033);
        await marketTrend.pushPriceData(3034);
        await marketTrend.pushPriceData(3035);


        //bullish trends
        await marketTrend.processMarketTrend(1632672418, 3036);

        currentIndex = await marketTrend.getCurrentTrackingPeriodIndex();
        expect(currentIndex).to.equal(0, "current index should be 0.");

        isBuyBackNeeded = await marketTrend.anyBuyBacksRequired();
        expect(isBuyBackNeeded).to.equal(false, "buy back should not be needed.");



        await marketTrend.processMarketTrend(1632672418, 3037);

        currentIndex = await marketTrend.getCurrentTrackingPeriodIndex();
        expect(currentIndex).to.equal(0, "current index should be 0.");

        isBuyBackNeeded = await marketTrend.anyBuyBacksRequired();
        expect(isBuyBackNeeded).to.equal(false, "buy back should not be needed.");


        //bearish trend
        await marketTrend.processMarketTrend(1632672418, 3000);

        currentIndex = await marketTrend.getCurrentTrackingPeriodIndex();
        expect(currentIndex).to.equal(1, "current index should be 1.");

        isBuyBackNeeded = await marketTrend.anyBuyBacksRequired();
        expect(isBuyBackNeeded).to.equal(true, "buy back should be needed.");

    });

});
