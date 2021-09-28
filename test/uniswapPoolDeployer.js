// SPDX-License-Identifier: agpl-3.0

const { expect } = require("chai");
const { ethers } = require("hardhat");
const hre = require("hardhat");
const utils = require("./utils");
const {BN} = require("@openzeppelin/test-helpers");

describe('UniswapPoolDeployer', function () {

    let owner;
    let accounts;
    let poolDeployer;

    before(async function () {
        const { contractOwner } = await hre.getNamedAccounts();
        owner = await hre.ethers.getSigner(contractOwner);

        //Per `hardhat.config.js`, the 0 and 1 index accounts are named accounts. They are reserved for deployment uses
        [,, ...accounts] = await hre.ethers.getSigners();
    });

    beforeEach(async function () {
        const { UniswapPoolDeployer } = await hre.deployments.fixture();
        poolDeployer = await hre.ethers.getContractAt(UniswapPoolDeployer.abi, UniswapPoolDeployer.address, owner);
    });

    it('should get pool', async () => {

        let tokenA = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
        let tokenB = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
        let fee = 500;

        const poolAddress = await poolDeployer.getPoolAddress(tokenA, tokenB, fee);

        expect(poolAddress).to.equal("0x60594a405d53811d3BC4766596EFD80fd545A270", "unexpected pool address.")
    });

    it('should init pool', async () => {

        //    MAIN
        //    tokenB: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 USDC

        let tokenA = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
        let tokenB = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
        let fee = 500;

        await poolDeployer.setPool(tokenA, tokenB, fee);

        const poolAddress = await poolDeployer.getPoolAddress(tokenA, tokenB, fee);

        expect(poolAddress).to.equal("0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640", "unexpected pool address.")
    });

});
