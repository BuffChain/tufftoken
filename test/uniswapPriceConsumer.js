// SPDX-License-Identifier: agpl-3.0

const { expect } = require("chai");
const hre = require("hardhat");
const {WETH9_ADDRESS, DAI_ADDRESS, UNISWAP_WETH_DAI_POOL_ADDRESS,
    UNISWAP_POOL_BASE_FEE, UNISWAP_FACTORY_ADDRESS
} = require("./utils");

describe('UniswapPriceConsumer', function () {

    let owner;
    let deployerAccount;
    let accounts;
    let priceConsumer;

    before(async function () {
        const { deployer, contractOwner } = await hre.getNamedAccounts();
        owner = await hre.ethers.getSigner(contractOwner);
        deployerAccount = await hre.ethers.getSigner(deployer);

        //Per `hardhat.config.js`, the 0 and 1 index accounts are named accounts. They are reserved for deployment uses
        [,, ...accounts] = await hre.ethers.getSigners();
    });

    beforeEach(async function () {
        // deploying this way to not transfer ownership to MarketTrend contract
        const UniswapPriceConsumer = await hre.ethers.getContractFactory("UniswapPriceConsumer");

        priceConsumer = await UniswapPriceConsumer.deploy(
            deployerAccount.address,
            WETH9_ADDRESS,
            DAI_ADDRESS,
            UNISWAP_POOL_BASE_FEE,
            UNISWAP_FACTORY_ADDRESS
        );

        await priceConsumer.deployed();

    });

    it('should get pool', async () => {

        const poolAddress = await priceConsumer.getPoolAddress(WETH9_ADDRESS, DAI_ADDRESS, UNISWAP_POOL_BASE_FEE);

        expect(poolAddress).to.equal(UNISWAP_WETH_DAI_POOL_ADDRESS, "unexpected pool address.")
    });

    it('should get quote', async () => {

        const quote = await priceConsumer.getQuote(3600);

        expect(quote > 0).to.equal(true, "unexpected quote.")
    });


    it('should get price', async () => {

        const price = await priceConsumer.getPrice();

        expect(price > 0).to.equal(true, "unexpected price.")
    });


});
