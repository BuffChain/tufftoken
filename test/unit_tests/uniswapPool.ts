// SPDX-License-Identifier: agpl-3.0

import hre from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";

import { TuffVBT, IUniswapV3Factory } from "../../src/types";

import { consts, TOKEN_DECIMALS, UNISWAP_POOL_BASE_FEE } from "../../utils/consts";
import {
    swapEthForWeth, swapTokens
} from "../../utils/test_utils";
import {
    getERC20Contract,
    getSqrtPriceX96, getUniswapPriceQuote, transferTuffDUU
} from "../../utils/utils";

describe("UniswapPool Deployment", function() {

    const poolPeriod = 3600;
    let owner: SignerWithAddress;
    let accounts: SignerWithAddress[];

    let tuffVBTDiamond: TuffVBT;

    before(async function() {
        const { contractOwner } = await hre.getNamedAccounts();
        owner = await hre.ethers.getSigner(contractOwner);

        //Per `hardhat.config.ts`, the 0 and 1 index accounts are named accounts. They are reserved for deployment uses
        [, , ...accounts] = await hre.ethers.getSigners();
    });

    beforeEach(async function() {
        const { tDUU } = await hre.deployments.fixture();
        tuffVBTDiamond = await hre.ethers.getContractAt(tDUU.abi, tDUU.address, owner) as TuffVBT;

        //Increase the block time to prime the pool
        await hre.ethers.provider.send("evm_increaseTime", [poolPeriod]);
        await hre.ethers.provider.send("evm_mine", []);
    });

    it("should exist a pool between TUFF and WETH9, with liquidity", async () => {
        const uniswapV3Factory = await hre.ethers.getContractAt("UniswapV3Factory",
            consts("UNISWAP_V3_FACTORY_ADDR")) as IUniswapV3Factory;
        const tuffVBTPoolAddr = await uniswapV3Factory.getPool(
            consts("WETH9_ADDR"), tuffVBTDiamond.address, UNISWAP_POOL_BASE_FEE);
        expect(tuffVBTPoolAddr).to.not.equal(hre.ethers.constants.AddressZero);
        const tuff_weth9Pool = await hre.ethers.getContractAt("UniswapV3Pool", tuffVBTPoolAddr);

        const [fee, tickSpacing, maxLiquidityPerTick, liquidity, slot] = await Promise.all([
            tuff_weth9Pool.fee(),
            tuff_weth9Pool.tickSpacing(),
            tuff_weth9Pool.maxLiquidityPerTick(),
            tuff_weth9Pool.liquidity(),
            tuff_weth9Pool.slot0()
        ]);
        const sqrtPriceX96 = slot[0];
        const tick = slot[1];

        expect(fee).to.equal(UNISWAP_POOL_BASE_FEE);
        expect(parseInt(liquidity)).to.be.greaterThan(0);
        expect(sqrtPriceX96).to.equal(getSqrtPriceX96(consts("TUFF_STARTING_PRICE")));
    });

    it("should have accurate and precise quote", async () => {
        //Get TuffVBT <-> WETH quotes in both directions
        let actualTuffVBTWethQuote = await getUniswapPriceQuote(
            tuffVBTDiamond.address,
            consts("WETH9_ADDR"),
            UNISWAP_POOL_BASE_FEE,
            poolPeriod
        );
        let actualWethTuffVBTQuote = await getUniswapPriceQuote(
            consts("WETH9_ADDR"),
            tuffVBTDiamond.address,
            UNISWAP_POOL_BASE_FEE,
            poolPeriod
        );

        //Assert price is correct in both directions
        expect(actualTuffVBTWethQuote).to.equal(actualWethTuffVBTQuote);

        //Get DAI <-> WETH quote to calculate TuffVBT dollar ($) price. This is done via TuffVBT -> WETH -> DAI
        let daiWethQuote = await getUniswapPriceQuote(
            consts("DAI_ADDR"),
            consts("WETH9_ADDR"),
            UNISWAP_POOL_BASE_FEE,
            3600
        );

        //Determine the decimal factor to apply between TuffVBT and DAI
        const tuffVBTDecimals = await (await getERC20Contract(tuffVBTDiamond.address)).decimals();
        const daiDecimals = await (await getERC20Contract(consts("DAI_ADDR"))).decimals();
        const decimalDiff = Math.abs(tuffVBTDecimals - daiDecimals);
        const decimalFactor = Math.pow(10, decimalDiff);

        //Assert TuffVBT price with dollar ($) denomination
        const expectedTuffVBTDaiQuote = 0.01; //1 cent per tuffVBT
        const buffer = 0.000001;
        const actualTuffVBTDaiQuote = (daiWethQuote / actualTuffVBTWethQuote) / decimalFactor;
        expect(actualTuffVBTDaiQuote).to.be.approximately(expectedTuffVBTDaiQuote, buffer);
    });

    it("should swap from TUFF to WETH9", async () => {
        //Setup
        const recipient = accounts[3];
        const tuffAmt = hre.ethers.utils.parseUnits("250", TOKEN_DECIMALS);
        const wethAmt = hre.ethers.utils.parseEther("20");

        await transferTuffDUU(recipient.address);
        const { weth9Contract } = await swapEthForWeth(recipient, wethAmt);
        const startingTuffBalance = await tuffVBTDiamond.balanceOf(recipient.address);
        const startingWethBalance = await weth9Contract.balanceOf(recipient.address);

        await weth9Contract.connect(recipient).approve(consts("UNISWAP_V3_ROUTER_ADDR"), hre.ethers.constants.MaxUint256);
        await swapTokens(recipient, weth9Contract.address, tuffVBTDiamond.address, tuffAmt);

        const endingTuffBalance = await tuffVBTDiamond.balanceOf(recipient.address);
        const endingWethBalance = await weth9Contract.balanceOf(recipient.address);
        expect(endingTuffBalance).to.equal(startingTuffBalance.add(tuffAmt));
        expect(endingWethBalance).to.be.lt(startingWethBalance);
    });

    it("should swap from WETH9 to TUFF", async () => {
        //Setup
        const recipient = accounts[3];
        const startingWethAmt = hre.ethers.utils.parseEther("20");
        const swapWethAmt = hre.ethers.utils.parseUnits("1", "gwei");

        await transferTuffDUU(recipient.address, "400000");
        const { weth9Contract } = await swapEthForWeth(recipient, startingWethAmt);
        const startingTuffBalance = await tuffVBTDiamond.balanceOf(recipient.address);
        const startingWethBalance = await weth9Contract.balanceOf(recipient.address);

        await tuffVBTDiamond.connect(recipient).approve(consts("UNISWAP_V3_ROUTER_ADDR"), hre.ethers.constants.MaxUint256);
        await swapTokens(recipient, tuffVBTDiamond.address, weth9Contract.address, swapWethAmt);

        const endingTuffBalance = await tuffVBTDiamond.balanceOf(recipient.address);
        const endingWethBalance = await weth9Contract.balanceOf(recipient.address);
        expect(endingWethBalance).to.equal(startingWethBalance.add(swapWethAmt));
        expect(endingTuffBalance).to.be.lt(startingTuffBalance);
    });
});
