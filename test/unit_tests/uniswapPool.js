// SPDX-License-Identifier: agpl-3.0

const {expect} = require("chai");
const hre = require("hardhat");
const {consts, UNISWAP_POOL_BASE_FEE} = require("../../utils/consts");
const {getSqrtPriceX96, runCallbackImpersonatingAcct} = require("../../utils/test_utils");
const utils = require("../../utils/test_utils");

describe("TuffToken", function () {

    let owner;
    let accounts;

    let tuffTokenDiamond;
    let uniswapV3Factory;

    before(async function () {
        const {contractOwner} = await hre.getNamedAccounts();
        owner = await hre.ethers.getSigner(contractOwner);

        //Per `hardhat.config.js`, the 0 and 1 index accounts are named accounts. They are reserved for deployment uses
        [, , ...accounts] = await hre.ethers.getSigners();
    });

    beforeEach(async function () {
        const {TuffTokenDiamond} = await hre.deployments.fixture();
        tuffTokenDiamond = await hre.ethers.getContractAt(TuffTokenDiamond.abi, TuffTokenDiamond.address, owner);
        uniswapV3Factory = await hre.ethers.getContractAt("UniswapV3Factory",
            consts("UNISWAP_V3_FACTORY_ADDR"));
    });

    it('should exist a pool between TUFF and WETH9', async () => {
        const tuffTokenPoolAddr = await uniswapV3Factory.getPool(
            consts("WETH9_ADDR"), tuffTokenDiamond.address, UNISWAP_POOL_BASE_FEE);
        expect(tuffTokenPoolAddr).to.not.equal(hre.ethers.constants.AddressZero);
        const tuff_weth9Pool = await hre.ethers.getContractAt("UniswapV3Pool", tuffTokenPoolAddr);

        const [fee, tickSpacing, maxLiquidityPerTick, liquidity, slot] = await Promise.all([
            tuff_weth9Pool.fee(),
            tuff_weth9Pool.tickSpacing(),
            tuff_weth9Pool.maxLiquidityPerTick(),
            tuff_weth9Pool.liquidity(),
            tuff_weth9Pool.slot0(),
        ]);
        const sqrtPriceX96 = slot[0];
        const tick = slot[1];

        expect(fee).to.equal(UNISWAP_POOL_BASE_FEE);
        expect(tickSpacing).to.equal(UNISWAP_POOL_BASE_FEE);
        expect(maxLiquidityPerTick).to.equal(UNISWAP_POOL_BASE_FEE);
        expect(liquidity).to.equal(0);
        expect(sqrtPriceX96).to.equal(getSqrtPriceX96(consts("TUFF_STARTING_PRICE")));
        expect(tick).to.equal(-126724);
    });

    it('should swap from TUFF to WETH9', async () => {
        //Setup
        const recipient = accounts[3];
        const swapDirection = false; //true for token0 to token1, false for token1 to token0
        const wethAmount = hre.ethers.utils.parseEther("2");
        const tuffAmount = hre.ethers.utils.parseEther("1");
        const price = consts("TUFF_STARTING_PRICE");
        const priceSlippage = price * 5;
        const priceLimit = price + priceSlippage;
        const sqrtPriceLimitX96 = getSqrtPriceX96(priceLimit);

        await utils.transferTUFF(recipient.address, wethAmount);
        const tuff_weth9Pool = await utils.getUniswapPoolContract(
            consts("WETH9_ADDR"), tuffTokenDiamond.address, UNISWAP_POOL_BASE_FEE);
        await tuffTokenDiamond.approve(recipient.address, hre.ethers.constants.MaxUint256)
        await (await utils.getWETH9Contract()).approve(recipient.address, hre.ethers.constants.MaxUint256)

        let amount0, amount1;
        await runCallbackImpersonatingAcct(recipient, async (acct) => {
            await tuffTokenDiamond.approve(acct.address, hre.ethers.constants.MaxUint256)
            await (await utils.getWETH9Contract()).approve(acct.address, hre.ethers.constants.MaxUint256)

            const data = await tuff_weth9Pool.swap(
                acct.address,
                swapDirection,
                tuffAmount,
                sqrtPriceLimitX96,
                []
            );
            amount0 = data.amount0;
            amount1 = data.amount1;
        });

        expect(amount0).to.equal(0);
        expect(amount1).to.equal(wethAmount);
    });

    it('should swap from WETH9 to TUFF', async () => {
        //Setup
        const recipient = accounts[3];
        const swapDirection = true; //true for token0 to token1, false for token1 to token0
        const tuffAmount = hre.ethers.utils.formatEther("2000000000000");
        const price = consts("TUFF_STARTING_PRICE");
        const priceSlippage = price * .5;
        const priceLimit = price - priceSlippage;
        const sqrtPriceLimitX96 = sqrtPriceX96(priceLimit);

        await utils.transferTUFF(recipient.address);
        const tuff_weth9Pool = await utils.getUniswapPoolContract(
            consts("WETH9_ADDR"), tuffTokenDiamond.address, UNISWAP_POOL_BASE_FEE);

        let amount0, amount1;
        await runCallbackImpersonatingAcct(recipient, async (acct) => {
            const data = await tuff_weth9Pool.swap(
                acct.address,
                swapDirection,
                "1",
                sqrtPriceLimitX96,
                []
            );
            amount0 = data.amount0;
            amount1 = data.amount1;
        });

        expect(amount0).to.equal(tuffAmount);
        expect(amount1).to.equal(0);
    });
});
