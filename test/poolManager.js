// SPDX-License-Identifier: agpl-3.0

const { expect } = require("chai");
const { ethers } = require("hardhat");
const hre = require("hardhat");
const utils = require("./utils");
const {BN} = require("@openzeppelin/test-helpers");

describe('PoolManager', function () {

    let owner;
    let accounts;
    let poolManager;

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
        const { UniswapV3PoolManager } = await hre.deployments.fixture();
        poolManager = await hre.ethers.getContractAt(UniswapV3PoolManager.abi, UniswapV3PoolManager.address, owner);
        await poolManager.setPool(tokenA, tokenB, fee);
    });

    it('should get pool', async () => {

        const poolAddress = await poolManager.getPoolAddress(tokenA, tokenB, fee);

        expect(poolAddress).to.equal("0x60594a405d53811d3BC4766596EFD80fd545A270", "unexpected pool address.")
    });

    it('should init pool', async () => {

        //    MAIN
        //    tokenB: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 USDC

        const tokenB = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

        await poolManager.setPool(tokenA, tokenB, fee);

        const poolAddress = await poolManager.getPoolAddress(tokenA, tokenB, fee);

        expect(poolAddress).to.equal("0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640", "unexpected pool address.")
    });

    it('should get quote', async () => {

        // 1 min period
        const quote = await poolManager.getQuote(60);

        expect(quote).to.equal(3054);

        // 1 hr period
        const quote2 = await poolManager.getQuote(3600);

        expect(quote2).to.equal(3030);

    });


});
