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
    getUniswapPriceQuote,
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

    it('should have accurate and precise quote (TokenA to TokenB)', async () => {
        const decimalPrecision = 9;

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

        //Compare quotes. Include a very small decimal buffer to allow for lost of precision when using
        // DECIMAL_PRECISION and converting from Solidity BigNumbers to JavaScript numbers
        const buffer = 1e-15;
        expect(actualTuffVBTWethQuote).to.be.approximately(expectedTuffVBTWethQuote, buffer);
    });

    it('should have accurate and precise quote (TokenB to TokenA)', async () => {
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
