// SPDX-License-Identifier: agpl-3.0

const { expect } = require("chai");
const { ethers } = require("hardhat");
const hre = require("hardhat");
const utils = require("./utils");
const {BN} = require("@openzeppelin/test-helpers");

describe('ChainLinkPriceConsumer', function () {

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
        const { ChainLinkPriceConsumer } = await hre.deployments.fixture();
        priceConsumer = await hre.ethers.getContractAt(ChainLinkPriceConsumer.abi, ChainLinkPriceConsumer.address, owner);
    });

    it('should get price', async () => {

        const quote = await priceConsumer.getPrice();

        expect(quote).to.equal(306406750447);

    });


});
