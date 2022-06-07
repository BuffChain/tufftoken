// SPDX-License-Identifier: agpl-3.0

import hre from "hardhat";
import {Signer} from "ethers";
import {expect} from "chai";

import {TuffVBT, UniswapManager} from "../../src/types";

type TuffVBTDiamond = TuffVBT & UniswapManager;

import {consts, TOKEN_DECIMALS, UNISWAP_POOL_BASE_FEE} from '../../utils/consts';
import {
    getUniswapPriceQuote,
    swapEthForWeth,
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
    });

    it('should swap tVBT for WETH (exact input single)', async () => {
        //Setup
        const sender = accounts[3];
        const senderAddr = await sender.getAddress();
        const recipientAddr = tuffVBTDiamond.address;
        const wethAmt = hre.ethers.utils.parseEther("20");

        await transferTuffDUU(senderAddr);
        const {weth9Contract} = await swapEthForWeth(sender, wethAmt);
        const startingTuffBalance = await tuffVBTDiamond.balanceOf(senderAddr);
        const startingWethBalance = await weth9Contract.balanceOf(recipientAddr);

        //Set swap amt to exactly `x` tVBT for about 1 WETH
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
        // Spend at most 110% of current market price
        const tVBTAmtIn = hre.ethers.utils.parseUnits((tVBTWETHQuote * 1.1).toFixed().toString(), TOKEN_DECIMALS);

        //Execute the swap
        await tuffVBTDiamond.connect(sender).approve(tuffVBTDiamond.address, tVBTAmtIn);
        await tuffVBTDiamond.connect(sender).swapExactInputSingle(
            tuffVBTDiamond.address,
            consts("WETH9_ADDR"),
            UNISWAP_POOL_BASE_FEE,
            tVBTAmtIn,
            wethAmtOutMin
        );

        //Assert balances after swap
        const endingTuffBalance = await tuffVBTDiamond.balanceOf(senderAddr);
        expect(endingTuffBalance).to.equal(startingTuffBalance.sub(tVBTAmtIn));

        //Since this is exact input, we do not know precisely the exact output will be
        const endingWethBalance = await weth9Contract.balanceOf(recipientAddr);
        expect(endingWethBalance).to.be.gte(startingWethBalance.add(wethAmtOutMin));
    });

    it('should swap tVBT for WETH (exact output single)', async () => {
        //Setup
        const sender = accounts[3];
        const senderAddr = await sender.getAddress();
        const recipientAddr = tuffVBTDiamond.address;
        const wethAmt = hre.ethers.utils.parseEther("20");

        await transferTuffDUU(senderAddr);
        const {weth9Contract} = await swapEthForWeth(sender, wethAmt);
        const startingTuffBalance = await tuffVBTDiamond.balanceOf(senderAddr);
        const startingWethBalance = await weth9Contract.balanceOf(recipientAddr);

        //Swap `x` tVBT for exactly 1 WETH. `x` <= 110% market rate of tVBT/WETH
        const tVBTWETHQuote = await getUniswapPriceQuote(
            tuffVBTDiamond.address,
            consts("WETH9_ADDR"),
            UNISWAP_POOL_BASE_FEE,
            3600,
            true
        );
        const wethAmtOut = hre.ethers.utils.parseEther("1");
        // Spend at most 110% of current market price
        const tVBTAmtInMax = hre.ethers.utils.parseUnits((tVBTWETHQuote * 1.1).toFixed().toString(), TOKEN_DECIMALS);

        //Execute the swap
        await tuffVBTDiamond.connect(sender).approve(tuffVBTDiamond.address, startingTuffBalance);
        await tuffVBTDiamond.connect(sender).swapExactOutputSingle(
            tuffVBTDiamond.address,
            consts("WETH9_ADDR"),
            UNISWAP_POOL_BASE_FEE,
            wethAmtOut,
            tVBTAmtInMax
        );

        //Assert balances after swap
        // Since this is exact output, we do not know precisely the exact input will be
        const endingTuffBalance = await tuffVBTDiamond.balanceOf(senderAddr);
        expect(endingTuffBalance).to.be.gte(startingTuffBalance.sub(tVBTAmtInMax));

        const endingWethBalance = await weth9Contract.balanceOf(recipientAddr);
        expect(endingWethBalance).to.equal(startingWethBalance.add(wethAmtOut));
    });
});
