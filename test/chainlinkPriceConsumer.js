// SPDX-License-Identifier: agpl-3.0

const { expect } = require("chai");
const hre = require("hardhat");
const {WETH9_ADDRESS, DAI_ADDRESS, UNISWAP_WETH_DAI_POOL_ADDRESS,
    UNISWAP_POOL_BASE_FEE
} = require("./utils");
const { smockit } = require("@eth-optimism/smock");
const {CHAINLINK_ETH_USD_AGGREGATOR_ADDRESS} = require("../test/utils");

describe('ChainLinkPriceConsumer', function () {

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
        const ChainLinkPriceConsumer = await hre.ethers.getContractFactory("ChainLinkPriceConsumer");

        priceConsumer = await ChainLinkPriceConsumer.deploy(
            deployerAccount.address,
            CHAINLINK_ETH_USD_AGGREGATOR_ADDRESS
        );

        await priceConsumer.deployed();

    });

    it('should get latest round data', async () => {

        const [
            roundId,
            answer,
            startedAt,
            updatedAt,
            answeredInRound
        ] = await priceConsumer.getLatestRoundData();

        expect(answer > 0).to.equal(true, "unexpected answer.")
    });

    it('should get price', async () => {

        const price = await priceConsumer.getPrice();

        expect(price > 0).to.equal(true, "unexpected price.")
    });


});
