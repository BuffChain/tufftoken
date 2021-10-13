// SPDX-License-Identifier: agpl-3.0

const { expect } = require("chai");
const hre = require("hardhat");
const {WETH9_ADDRESS, DAI_ADDRESS, USDC_ADDRESS, UNISWAP_WETH_DAI_POOL_ADDRESS, UNISWAP_WETH_USDC_POOL_ADDRESS} = require("./utils");

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

        let fee = 500;

        const poolAddress = await poolDeployer.getPoolAddress(WETH9_ADDRESS, DAI_ADDRESS, fee);

        expect(poolAddress).to.equal(UNISWAP_WETH_DAI_POOL_ADDRESS, "unexpected pool address.")
    });

    it('should init pool', async () => {

        let fee = 500;

        await poolDeployer.setPool(WETH9_ADDRESS, USDC_ADDRESS, fee);

        const poolAddress = await poolDeployer.getPoolAddress(WETH9_ADDRESS, USDC_ADDRESS, fee);

        expect(poolAddress).to.equal(UNISWAP_WETH_USDC_POOL_ADDRESS, "unexpected pool address.")
    });

});
