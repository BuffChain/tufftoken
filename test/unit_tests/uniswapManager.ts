// SPDX-License-Identifier: agpl-3.0

import hre from "hardhat";
import {Signer} from "ethers";
import {expect} from "chai";

import {TuffVBT, UniswapManager} from "../../src/types";

type TuffVBTDiamond = TuffVBT & UniswapManager;

import {consts, TOKEN_DECIMALS, UNISWAP_POOL_BASE_FEE} from '../../utils/consts';
import {
    getUniswapPriceQuote,
    getAcctBal,
    sendTokensToAddr,
    transferTuffDUU
} from '../../utils/test_utils';

describe("UniswapManager", function () {

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

        //Prime tVBT contract with tokens
        await sendTokensToAddr(accounts.at(-1), tuffVBTDiamond.address);
        await transferTuffDUU(tuffVBTDiamond.address);
    });

    it('should swap tVBT for WETH (exact input single)', async () => {
        //Setup
        const {wethBal: startingWethBalance, tuffBal: startingTuffVBTBalance} =
            await getAcctBal(tuffVBTDiamond, tuffVBTDiamond.address);

        //Swap exactly `x` tVBT for a minimum of 1 WETH. `x` = 110% market rate of tVBT/WETH, meaning we are willing to
        // spend over market to ensure we get a min WETH amount
        const tVBTWETHQuote = await getUniswapPriceQuote(
            tuffVBTDiamond.address,
            consts("WETH9_ADDR"),
            UNISWAP_POOL_BASE_FEE,
            3600,
            true
        );
        const wethAmtOutMin = hre.ethers.utils.parseEther("1");
        // Spend at most 110% of current market price (slippage)
        const tVBTAmtIn = hre.ethers.utils.parseUnits((tVBTWETHQuote * 1.1).toFixed().toString(), TOKEN_DECIMALS);

        //Execute the swap
        await tuffVBTDiamond.swapExactInputSingle(
            tuffVBTDiamond.address,
            consts("WETH9_ADDR"),
            UNISWAP_POOL_BASE_FEE,
            tVBTAmtIn,
            wethAmtOutMin
        );

        //Assert balances after swap
        const {wethBal: endingWethBalance, tuffBal: endingTuffVBTBalance} =
            await getAcctBal(tuffVBTDiamond, tuffVBTDiamond.address);

        expect(endingTuffVBTBalance).to.equal(startingTuffVBTBalance.sub(tVBTAmtIn));
        // Since this is exact input, we do not know precisely the exact output will be
        expect(endingWethBalance).to.be.gte(startingWethBalance.add(wethAmtOutMin));
    });

    it('should swap tVBT for WETH (exact output single)', async () => {
        //Setup
        const {wethBal: startingWethBalance, tuffBal: startingTuffVBTBalance} =
            await getAcctBal(tuffVBTDiamond, tuffVBTDiamond.address);

        //Swap at most `x` tVBT for exactly 1 WETH. `x` = 110% market rate of tVBT/WETH, meaning we are willing to
        // spend over market to ensure we get the exact WETH amount
        const tVBTWETHQuote = await getUniswapPriceQuote(
            tuffVBTDiamond.address,
            consts("WETH9_ADDR"),
            UNISWAP_POOL_BASE_FEE,
            3600,
            true
        );
        const wethAmtOut = hre.ethers.utils.parseEther("1");
        // Spend at most 110% of current market price (slippage)
        const tVBTAmtInMax = hre.ethers.utils.parseUnits((tVBTWETHQuote * 1.1).toFixed().toString(), TOKEN_DECIMALS);

        //Execute the swap
        await tuffVBTDiamond.swapExactOutputSingle(
            tuffVBTDiamond.address,
            consts("WETH9_ADDR"),
            UNISWAP_POOL_BASE_FEE,
            wethAmtOut,
            tVBTAmtInMax
        );

        //Assert balances after swap
        const {wethBal: endingWethBalance, tuffBal: endingTuffVBTBalance} =
            await getAcctBal(tuffVBTDiamond, tuffVBTDiamond.address);

        // Since this is exact output, we do not know precisely the exact input will be
        expect(endingTuffVBTBalance).to.be.gte(startingTuffVBTBalance.sub(tVBTAmtInMax));
        expect(endingWethBalance).to.equal(startingWethBalance.add(wethAmtOut));
    });

    it('should swap tVBT for WETH for DAI (exact input multihop)', async () => {
        //Setup
        const {wethBal: startingWethBalance, daiBal: startingDaiBalance, tuffBal: startingTuffVBTBalance} =
            await getAcctBal(tuffVBTDiamond, tuffVBTDiamond.address);

        //Swap exactly `x` tVBT for a minimum of 1 DAI. `x` = 110% market rate of tVBT/DAI, meaning we are willing to
        // spend over market to ensure we get a min DAI amount
        const tVBTWETHQuote = await getUniswapPriceQuote(
            tuffVBTDiamond.address,
            consts("WETH9_ADDR"),
            UNISWAP_POOL_BASE_FEE,
            3600,
            true
        );
        const wethDAIQuote = await getUniswapPriceQuote(
            consts("WETH9_ADDR"),
            consts("DAI_ADDR"),
            UNISWAP_POOL_BASE_FEE,
            3600,
            false
        );
        const tVBTDAIQuote = tVBTWETHQuote * wethDAIQuote;
        // Spend at most 110% of current market price
        const tVBTAmtIn = hre.ethers.utils.parseUnits((tVBTDAIQuote * 1.1).toFixed().toString(), TOKEN_DECIMALS);
        const daiAmtOutMin = hre.ethers.utils.parseEther("1");

        //Execute the swap (TuffVBT -> WETH -> DAI)
        await tuffVBTDiamond.swapExactInputMultihop(
            tuffVBTDiamond.address,
            consts("DAI_ADDR"),
            UNISWAP_POOL_BASE_FEE,
            UNISWAP_POOL_BASE_FEE,
            tVBTAmtIn,
            daiAmtOutMin
        );

        //Assert balances after swap
        const {wethBal: endingWethBalance, daiBal: endingDaiBalance, tuffBal: endingTuffVBTBalance} =
            await getAcctBal(tuffVBTDiamond, tuffVBTDiamond.address);

        expect(endingTuffVBTBalance).to.equal(startingTuffVBTBalance.sub(tVBTAmtIn));
        expect(endingWethBalance).to.equal(startingWethBalance);
        // Since this is exact input, we do not know precisely the exact output will be
        expect(endingDaiBalance).to.be.gte(startingDaiBalance.add(daiAmtOutMin));
    });

    //TODO: add negative tests for all possible reverts
});
