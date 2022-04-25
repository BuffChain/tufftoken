// SPDX-License-Identifier: agpl-3.0

import hre from "hardhat";
import {Signer} from "ethers";
import {expect} from "chai";

import {TuffToken} from "../../src/types/contracts/TuffToken";
import {IUniswapV3Factory} from "@uniswap/v3-periphery/typechain/IUniswapV3Factory";


import {consts, UNISWAP_POOL_BASE_FEE} from '../../utils/consts';
import {getSqrtPriceX96, getUniswapPoolContract, getWETH9Contract, runCallbackImpersonatingAcct, transferTUFF} from '../../utils/test_utils';

describe("TuffToken", function () {

  let owner: Signer;
  let accounts: Signer[];

  let tuffTokenDiamond: TuffToken;
  let uniswapV3Factory: IUniswapV3Factory;

  before(async function () {
    const {contractOwner} = await hre.getNamedAccounts();
    owner = await hre.ethers.getSigner(contractOwner);

    //Per `hardhat.config.js`, the 0 and 1 index accounts are named accounts. They are reserved for deployment uses
    [, , ...accounts] = await hre.ethers.getSigners();
  });

  beforeEach(async function () {
    const {TuffTokenDiamond} = await hre.deployments.fixture();
    tuffTokenDiamond = await hre.ethers.getContractAt(TuffTokenDiamond.abi, TuffTokenDiamond.address, owner) as TuffToken;
    uniswapV3Factory = await hre.ethers.getContractAt("UniswapV3Factory",
      consts("UNISWAP_V3_FACTORY_ADDR")) as IUniswapV3Factory;
  });

  it('should exist a pool between TUFF and WETH9, with liquidity', async () => {
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
    expect(parseInt(liquidity)).to.be.greaterThan(0);
    expect(sqrtPriceX96).to.equal(getSqrtPriceX96(consts("TUFF_STARTING_PRICE")));
  });

  it('should swap from TUFF to WETH9', async () => {
    //Setup
    const recipient = accounts[3];
    const recipientAddr = await recipient.getAddress();
    const swapDirection = false; //true for token0 to token1, false for token1 to token0
    const wethAmount = hre.ethers.utils.parseEther("2");
    const tuffAmount = hre.ethers.utils.parseEther("1");
    const price = consts("TUFF_STARTING_PRICE");
    const priceSlippage = price * 5;
    const priceLimit = price + priceSlippage;
    const sqrtPriceLimitX96 = getSqrtPriceX96(priceLimit);

    await transferTUFF(recipientAddr);
    const tuff_weth9Pool = await getUniswapPoolContract(
      consts("WETH9_ADDR"), tuffTokenDiamond.address, UNISWAP_POOL_BASE_FEE);
    await tuffTokenDiamond.approve(recipientAddr, hre.ethers.constants.MaxUint256)
    await (await getWETH9Contract()).approve(recipientAddr, hre.ethers.constants.MaxUint256)

    let amount0, amount1;
    await runCallbackImpersonatingAcct(recipient, async (acct: Signer) => {
      const acctAddr = await acct.getAddress();

      await tuffTokenDiamond.approve(acctAddr, hre.ethers.constants.MaxUint256)
      await (await getWETH9Contract()).approve(acctAddr, hre.ethers.constants.MaxUint256)

      const data = await tuff_weth9Pool.swap(
        acctAddr,
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
    const recipientAddr = await recipient.getAddress();
    const swapDirection = true; //true for token0 to token1, false for token1 to token0
    const tuffAmount = hre.ethers.utils.formatEther("2000000000000");
    const price = consts("TUFF_STARTING_PRICE");
    const priceSlippage = price * .5;
    const priceLimit = price - priceSlippage;
    const sqrtPriceLimitX96 = getSqrtPriceX96(priceLimit);

    await transferTUFF(recipientAddr);
    const tuff_weth9Pool = await getUniswapPoolContract(
      consts("WETH9_ADDR"), tuffTokenDiamond.address, UNISWAP_POOL_BASE_FEE);

    let amount0, amount1;
    await runCallbackImpersonatingAcct(recipient, async (acct: Signer) => {
      const acctAddr = await acct.getAddress();

      const data = await tuff_weth9Pool.swap(
        acctAddr,
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
