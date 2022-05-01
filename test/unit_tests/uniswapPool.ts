// SPDX-License-Identifier: agpl-3.0

import hre from "hardhat";
import {Signer} from "ethers";
import {expect} from "chai";

import {TuffToken} from "../../src/types";
import {IUniswapV3Factory} from "@uniswap/v3-periphery/typechain/IUniswapV3Factory";


import {consts, TOKEN_DECIMALS, UNISWAP_POOL_BASE_FEE} from '../../utils/consts';
import {
  getSqrtPriceX96, printAcctBal,
  swapEthForWeth,
  swapTokens, transferTUFF
} from '../../utils/test_utils';

describe("TuffToken", function () {

  let owner: Signer;
  let accounts: Signer[];

  let tuffTokenDiamond: TuffToken;

  before(async function () {
    const {contractOwner} = await hre.getNamedAccounts();
    owner = await hre.ethers.getSigner(contractOwner);

    //Per `hardhat.config.ts`, the 0 and 1 index accounts are named accounts. They are reserved for deployment uses
    [, , ...accounts] = await hre.ethers.getSigners();
  });

  beforeEach(async function () {
    const {TuffTokenDiamond} = await hre.deployments.fixture();
    tuffTokenDiamond = await hre.ethers.getContractAt(TuffTokenDiamond.abi, TuffTokenDiamond.address, owner) as TuffToken;
  });

  it('should exist a pool between TUFF and WETH9, with liquidity', async () => {
    const uniswapV3Factory = await hre.ethers.getContractAt("UniswapV3Factory",
      consts("UNISWAP_V3_FACTORY_ADDR")) as IUniswapV3Factory;
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
    const tuffAmt = hre.ethers.utils.parseUnits("250", TOKEN_DECIMALS);
    const wethAmt = hre.ethers.utils.parseEther("20");

    await transferTUFF(recipientAddr);
    const {weth9Contract} = await swapEthForWeth(recipient, wethAmt);
    const startingTuffBalance = await tuffTokenDiamond.balanceOf(recipientAddr);
    const startingWethBalance = await weth9Contract.balanceOf(recipientAddr);

    await weth9Contract.connect(recipient).approve(consts("UNISWAP_V3_ROUTER_ADDR"), hre.ethers.constants.MaxUint256);
    await swapTokens(recipient, weth9Contract.address, tuffTokenDiamond.address, tuffAmt);

    const endingTuffBalance = await tuffTokenDiamond.balanceOf(recipientAddr);
    const endingWethBalance = await weth9Contract.balanceOf(recipientAddr);
    expect(endingTuffBalance).to.equal(startingTuffBalance.add(tuffAmt));
    expect(endingWethBalance).to.be.lt(startingWethBalance);
  });

  it('should swap from WETH9 to TUFF', async () => {
    //Setup
    const recipient = accounts[3];
    const recipientAddr = await recipient.getAddress();
    const startingWethAmt = hre.ethers.utils.parseEther("20");
    const swapWethAmt = hre.ethers.utils.parseUnits("1", "gwei");

    await transferTUFF(recipientAddr, "400000");
    const {weth9Contract} = await swapEthForWeth(recipient, startingWethAmt);
    const startingTuffBalance = await tuffTokenDiamond.balanceOf(recipientAddr);
    const startingWethBalance = await weth9Contract.balanceOf(recipientAddr);
    await printAcctBal(tuffTokenDiamond, recipientAddr);

    await tuffTokenDiamond.connect(recipient).approve(consts("UNISWAP_V3_ROUTER_ADDR"), hre.ethers.constants.MaxUint256);
    await swapTokens(recipient, tuffTokenDiamond.address, weth9Contract.address, swapWethAmt);

    const endingTuffBalance = await tuffTokenDiamond.balanceOf(recipientAddr);
    const endingWethBalance = await weth9Contract.balanceOf(recipientAddr);
    expect(endingWethBalance).to.equal(startingWethBalance.add(swapWethAmt));
    expect(endingTuffBalance).to.be.lt(startingTuffBalance);
  });
});
