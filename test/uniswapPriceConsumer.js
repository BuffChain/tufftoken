// SPDX-License-Identifier: agpl-3.0

const { expect } = require("chai");
const { ethers } = require("hardhat");
const hre = require("hardhat");
const utils = require("./utils");
const {BN} = require("@openzeppelin/test-helpers");

describe('UniswapPriceConsumer', function () {

    let owner;
    let accounts;
    let priceConsumer;


    before(async function () {
        const { contractOwner } = await hre.getNamedAccounts();
        owner = await hre.ethers.getSigner(contractOwner);

        //Per `hardhat.config.js`, the 0 and 1 index accounts are named accounts. They are reserved for deployment uses
        [,, ...accounts] = await hre.ethers.getSigners();
    });

    beforeEach(async function () {
        const { UniswapPriceConsumer } = await hre.deployments.fixture();
        priceConsumer = await hre.ethers.getContractAt(UniswapPriceConsumer.abi, UniswapPriceConsumer.address, owner);
    });

    it('should get pool', async () => {

        let tokenA = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
        let tokenB = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
        let fee = 500;

        const poolAddress = await priceConsumer.getPoolAddress(tokenA, tokenB, fee);

        expect(poolAddress).to.equal("0x60594a405d53811d3BC4766596EFD80fd545A270", "unexpected pool address.")
    });

    it('should get quote', async () => {

        // 1 min period
        const quote = await priceConsumer.getQuote(60);

        expect(quote).to.equal(3054);

        // 1 hr period
        const quote2 = await priceConsumer.getQuote(3600);

        expect(quote2).to.equal(3030);

    });

    it('should get price', async () => {

        const price = await priceConsumer.getPrice();

        expect(price).to.equal(3030);

    });


});
