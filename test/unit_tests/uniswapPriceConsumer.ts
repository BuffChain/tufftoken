// SPDX-License-Identifier: agpl-3.0

import hre from "hardhat";
import {Signer} from "ethers";
import {expect} from "chai";

const {
    expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

import {TuffVBT, UniswapPriceConsumer} from "../../src/types";

type TuffVBTDiamond = TuffVBT & UniswapPriceConsumer;

import {consts, UNISWAP_POOL_BASE_FEE} from '../../utils/consts';
import {
    getDAIContract,
    getUniswapPriceQuote,
    getUSDCContract,
    getUSDTContract,
} from '../../utils/test_utils';

describe("UniswapPriceConsumer", function () {

    const poolPeriod = 3600;
    let owner: Signer;
    let accounts: Signer[];

    let tuffVBTDiamond: TuffVBTDiamond;

    before(async function () {
        const {contractOwner} = await hre.getNamedAccounts();
        owner = await hre.ethers.getSigner(contractOwner);

        //Per `hardhat.config.ts`, the 0 and 1 index accounts are named accounts. They are reserved for deployment uses
        [, , ...accounts] = await hre.ethers.getSigners();
    });

    beforeEach(async function () {
        const {tDUU} = await hre.deployments.fixture();
        tuffVBTDiamond = await hre.ethers.getContractAt(tDUU.abi, tDUU.address, owner) as TuffVBTDiamond;

        //Increase the block time to prime the pool
        await hre.ethers.provider.send("evm_increaseTime", [poolPeriod]);
        await hre.ethers.provider.send("evm_mine", []);
    });

    it('should have accurate and precise quote (WETH to tVBT)', async () => {
        const decimalPrecision = 9;

        //Get on-chain quote
        const [tuffVBTWethQuote, totalDecimalPrecision] = await tuffVBTDiamond.getUniswapQuote(
            consts("WETH9_ADDR"),
            tuffVBTDiamond.address,
            UNISWAP_POOL_BASE_FEE,
            poolPeriod,
            decimalPrecision
        );
        const expectedTuffVBTWethQuote = tuffVBTWethQuote.toNumber() / Math.pow(10, 9);

        //Get off-chain quote
        const actualTuffVBTWethQuote = await getUniswapPriceQuote(
            consts("WETH9_ADDR"),
            tuffVBTDiamond.address,
            UNISWAP_POOL_BASE_FEE,
            poolPeriod
        );

        //Compare quotes. Include a very small decimal buffer to allow for lost of precision when using
        // DECIMAL_PRECISION and converting from Solidity BigNumbers to JavaScript numbers
        const buffer = 1e-15;
        expect(actualTuffVBTWethQuote).to.be.approximately(expectedTuffVBTWethQuote, buffer);
    });

    it('should have accurate and precise quote (tVBT to WETH)', async () => {
        const decimalPrecision = 9;

        //Get on-chain quote
        const [tuffVBTWethQuote, totalDecimalPrecision] = await tuffVBTDiamond.getUniswapQuote(
            tuffVBTDiamond.address,
            consts("WETH9_ADDR"),
            UNISWAP_POOL_BASE_FEE,
            poolPeriod,
            decimalPrecision
        );
        const expectedTuffVBTWethQuote = tuffVBTWethQuote.toNumber() / Math.pow(10, totalDecimalPrecision.toNumber());

        //Get off-chain quote
        const actualTuffVBTWethQuote = await getUniswapPriceQuote(
            consts("WETH9_ADDR"),
            tuffVBTDiamond.address,
            UNISWAP_POOL_BASE_FEE,
            poolPeriod,
            false
        );

        //Compare quotes. Include a small integer buffer to allow for lost of precision when
        // converting from Solidity BigNumbers to JavaScript numbers
        const buffer = 1;
        expect(actualTuffVBTWethQuote).to.be.approximately(expectedTuffVBTWethQuote, buffer);
    });

    it('should have accurate and precise quote (DAI to WETH)', async () => {
        const decimalPrecision = 12;
        const dai = await getUSDTContract();

        //Get on-chain quote
        const [daiWethQuote, totalDecimalPrecision] = await tuffVBTDiamond.getUniswapQuote(
            consts("WETH9_ADDR"),
            dai.address,
            UNISWAP_POOL_BASE_FEE,
            poolPeriod,
            decimalPrecision
        );
        // const expectedDaiWethQuote = daiWethQuote.toBigInt() / BigInt(Math.pow(10, totalDecimalPrecision.toNumber()));
        const expectedDaiWethQuote = daiWethQuote.toNumber() / Math.pow(10, totalDecimalPrecision.toNumber());

        //Get off-chain quote
        const actualDaiWethQuote = await getUniswapPriceQuote(
            consts("WETH9_ADDR"),
            dai.address,
            UNISWAP_POOL_BASE_FEE,
            poolPeriod, false
        );

        //Compare quotes. Include a small integer buffer to allow for lost of precision when
        // converting from Solidity BigNumbers to JavaScript numbers
        const buffer = 1;
        console.log("~~~~~~~~~~");
        console.log(actualDaiWethQuote);
        console.log(expectedDaiWethQuote);
        console.log(daiWethQuote.toString());
        expect(actualDaiWethQuote).to.be.approximately(expectedDaiWethQuote, buffer);
    });

    it('should have similar WETH quotes between stable coins', async () => {
        const decimalPrecision = 9;
        const dai = await getDAIContract();
        const usdc = await getUSDCContract();
        const usdt = await getUSDTContract();

        //Get on-chain DAI quote
        const [daiWethQuote, totalDecimalPrecision] = await tuffVBTDiamond.getUniswapQuote(
            consts("WETH9_ADDR"),
            dai.address,
            UNISWAP_POOL_BASE_FEE,
            poolPeriod,
            decimalPrecision
        );
        const expectedDaiWethQuote = daiWethQuote.toNumber() / Math.pow(10, totalDecimalPrecision.toNumber());

        //Get on-chain USDC quote
        const [usdcWethQuote, usdcTotalDecimalPrecision] = await tuffVBTDiamond.getUniswapQuote(
            consts("WETH9_ADDR"),
            usdc.address,
            UNISWAP_POOL_BASE_FEE,
            poolPeriod,
            decimalPrecision
        );
        const expectedUSDCWethQuote = usdcWethQuote.toNumber() / Math.pow(10, usdcTotalDecimalPrecision.toNumber());

        //Get on-chain USDT quote
        const [usdtWethQuote, usdtTotalDecimalPrecision] = await tuffVBTDiamond.getUniswapQuote(
            consts("WETH9_ADDR"),
            usdt.address,
            UNISWAP_POOL_BASE_FEE,
            poolPeriod,
            decimalPrecision
        );
        const expectedUSDTWethQuote = usdtWethQuote.toNumber() / Math.pow(10, usdtTotalDecimalPrecision.toNumber());

        //Compare quotes. Allow for a $10 stable coin buffer between stable coins
        const buffer = 10;
        console.log(expectedDaiWethQuote);
        console.log(expectedUSDCWethQuote);
        console.log(expectedUSDTWethQuote);
        expect(expectedDaiWethQuote).to.be.approximately(expectedUSDCWethQuote, buffer);
        expect(expectedDaiWethQuote).to.be.approximately(expectedUSDTWethQuote, buffer);
        expect(expectedUSDCWethQuote).to.be.approximately(expectedUSDTWethQuote, buffer);
    });

    it('should revert if decimal precision is not large enough', async () => {
        const decimalPrecision = 1;

        await expectRevert(tuffVBTDiamond.getUniswapQuote(
            tuffVBTDiamond.address,
            consts("WETH9_ADDR"),
            UNISWAP_POOL_BASE_FEE,
            poolPeriod,
            decimalPrecision
        ), "LDP");
    });

    it('should work with low decimal precision if decimals are not needed', async () => {
        const decimalPrecision = 1;

        //Get on-chain quote
        const [tuffVBTWethQuote, totalDecimalPrecision] = await tuffVBTDiamond.getUniswapQuote(
            consts("WETH9_ADDR"),
            tuffVBTDiamond.address,
            UNISWAP_POOL_BASE_FEE,
            poolPeriod,
            decimalPrecision
        );
        const expectedTuffVBTWethQuote = tuffVBTWethQuote.toNumber() / Math.pow(10, totalDecimalPrecision.toNumber());

        //Get off-chain quote
        const actualTuffVBTWethQuote = await getUniswapPriceQuote(
            consts("WETH9_ADDR"),
            tuffVBTDiamond.address,
            UNISWAP_POOL_BASE_FEE,
            poolPeriod
        );

        //Compare quotes. Include a small integer buffer to allow for lost of precision when
        // converting from Solidity BigNumbers to JavaScript numbers
        const buffer = 1;
        expect(actualTuffVBTWethQuote).to.be.approximately(expectedTuffVBTWethQuote, buffer);
    });
});
