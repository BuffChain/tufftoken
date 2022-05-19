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
    swapTokens, transferTuffDUU
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

    it('should swap exact TUFF for WETH (input)', async () => {
        //Setup
        const sender = accounts[3];
        const senderAddr = await sender.getAddress();
        const recipientAddr = tuffVBTDiamond.address;
        const wethAmt = hre.ethers.utils.parseEther("20");

        await transferTuffDUU(senderAddr);
        const {weth9Contract} = await swapEthForWeth(sender, wethAmt);
        const startingTuffBalance = await tuffVBTDiamond.balanceOf(senderAddr);
        const startingWethBalance = await weth9Contract.balanceOf(recipientAddr);
        const tuffSwapAmt = startingTuffBalance.div(2);

        //Execute the swap
        await tuffVBTDiamond.connect(sender).approve(tuffVBTDiamond.address, tuffSwapAmt);
        await tuffVBTDiamond.connect(sender).swapExactInputSingle(
            tuffVBTDiamond.address,
            consts("WETH9_ADDR"),
            UNISWAP_POOL_BASE_FEE,
            tuffSwapAmt
        );

        //Assert balances after swap
        const endingTuffBalance = await tuffVBTDiamond.balanceOf(senderAddr);
        expect(endingTuffBalance).to.equal(startingTuffBalance.sub(tuffSwapAmt));

        //Since this is exact input, we do not know precisely the exact output will be
        const endingWethBalance = await weth9Contract.balanceOf(recipientAddr);
        expect(endingWethBalance).to.be.gt(startingWethBalance);
    });

    it('should swap from TUFF to WETH9', async () => {
        //Setup
        const recipient = accounts[3];
        const recipientAddr = await recipient.getAddress();
        const tuffAmt = hre.ethers.utils.parseUnits("250", TOKEN_DECIMALS);
        const wethAmt = hre.ethers.utils.parseEther("20");

        await transferTuffDUU(recipientAddr);
        const {weth9Contract} = await swapEthForWeth(recipient, wethAmt);
        const startingTuffBalance = await tuffVBTDiamond.balanceOf(recipientAddr);
        const startingWethBalance = await weth9Contract.balanceOf(recipientAddr);

        await weth9Contract.connect(recipient).approve(consts("UNISWAP_V3_ROUTER_ADDR"), hre.ethers.constants.MaxUint256);
        await swapTokens(recipient, weth9Contract.address, tuffVBTDiamond.address, tuffAmt);

        const endingTuffBalance = await tuffVBTDiamond.balanceOf(recipientAddr);
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

        await transferTuffDUU(recipientAddr, "400000");
        const {weth9Contract} = await swapEthForWeth(recipient, startingWethAmt);
        const startingTuffBalance = await tuffVBTDiamond.balanceOf(recipientAddr);
        const startingWethBalance = await weth9Contract.balanceOf(recipientAddr);

        await tuffVBTDiamond.connect(recipient).approve(consts("UNISWAP_V3_ROUTER_ADDR"), hre.ethers.constants.MaxUint256);
        await swapTokens(recipient, tuffVBTDiamond.address, weth9Contract.address, swapWethAmt);

        const endingTuffBalance = await tuffVBTDiamond.balanceOf(recipientAddr);
        const endingWethBalance = await weth9Contract.balanceOf(recipientAddr);
        expect(endingWethBalance).to.equal(startingWethBalance.add(swapWethAmt));
        expect(endingTuffBalance).to.be.lt(startingTuffBalance);
    });
});
