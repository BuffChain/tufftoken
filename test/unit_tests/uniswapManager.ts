// SPDX-License-Identifier: agpl-3.0

import hre from "hardhat";
import {Signer} from "ethers";
import {expect} from "chai";

import {TuffToken, UniswapManager} from "../../src/types";
type TuffTokenDiamond = TuffToken & UniswapManager;

import {consts, TOKEN_DECIMALS, UNISWAP_POOL_BASE_FEE} from '../../utils/consts';
import {
  getUniswapPriceQuote, printAcctBal,
  swapEthForWeth,
  swapTokens, transferTUFF
} from '../../utils/test_utils';

describe("UniswapManager", function () {

  let owner: Signer;
  let accounts: Signer[];

  let tuffTokenDiamond: TuffTokenDiamond;

  before(async function () {
    const {contractOwner} = await hre.getNamedAccounts();
    owner = await hre.ethers.getSigner(contractOwner);

    //Per `hardhat.config.ts`, the 0 and 1 index accounts are named accounts. They are reserved for deployment uses
    [, , ...accounts] = await hre.ethers.getSigners();
  });

  beforeEach(async function () {
    const {TuffTokenDiamond} = await hre.deployments.fixture();
    tuffTokenDiamond = await hre.ethers.getContractAt(TuffTokenDiamond.abi, TuffTokenDiamond.address, owner) as TuffTokenDiamond;
  });

  it('should swap exact TUFF for WETH (input)', async () => {
    //Setup
    const recipient = accounts[3];
    const recipientAddr = await recipient.getAddress();
    const wethAmt = hre.ethers.utils.parseEther("20");

    await transferTUFF(recipientAddr);
    const {weth9Contract} = await swapEthForWeth(recipient, wethAmt);
    const startingTuffBalance = await tuffTokenDiamond.balanceOf(recipientAddr);
    const startingWethBalance = await weth9Contract.balanceOf(recipientAddr);
    const tuffSwapAmt = startingTuffBalance.div(2);

    const tuffWethQuote = await getUniswapPriceQuote(
        tuffTokenDiamond.address,
        consts("WETH9_ADDR"),
        UNISWAP_POOL_BASE_FEE,
        60
    );

    //Execute the swap
    await tuffTokenDiamond.connect(recipient).approve(tuffTokenDiamond.address, tuffSwapAmt);
    await tuffTokenDiamond.connect(recipient).swapExactInputSingle(
        tuffTokenDiamond.address,
        UNISWAP_POOL_BASE_FEE,
        consts("WETH9_ADDR"),
        tuffSwapAmt
    );

    //Assert balances after swap
    const endingTuffBalance = await tuffTokenDiamond.balanceOf(recipientAddr);
    const endingWethBalance = await weth9Contract.balanceOf(recipientAddr);
    expect(endingTuffBalance).to.equal(startingTuffBalance.sub(tuffSwapAmt));
    //Since this is exact in, we do not know precisely the exact out will be
    expect(endingWethBalance).to.be.gt(startingWethBalance);
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
