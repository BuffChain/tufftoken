// SPDX-License-Identifier: agpl-3.0

const {expect} = require("chai");
const hre = require("hardhat");

const consts = require("../consts");

describe('UniswapPriceConsumer', function () {

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

    it('should get pool', async () => {
        const poolAddr = await tuffTokenDiamond.getPoolAddr(consts.WETH9_ADDR, consts.DAI_ADDR, consts.UNISWAP_POOL_BASE_FEE);

        expect(poolAddr).to.equal(consts.UNISWAP_WETH_DAI_POOL_ADDR, "unexpected pool address.");
    });

    it('should get quote', async () => {
        const quote = await tuffTokenDiamond.getQuote(3600);

        expect(quote > 0).to.equal(true, "unexpected quote.");
    });

    it('should get price', async () => {
        const price = await tuffTokenDiamond.getUniswapPrice();

        expect(price > 0).to.equal(true, "unexpected price.");
    });
});
