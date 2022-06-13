// SPDX-License-Identifier: agpl-3.0

import hre from "hardhat";
import {Signer, BigNumber} from "ethers";
import {expect} from "chai";

import {TuffVBT, ChainLinkPriceConsumer} from "../../src/types";

type TuffVBTDiamond = TuffVBT & ChainLinkPriceConsumer;

import {consts, UNISWAP_POOL_BASE_FEE} from '../../utils/consts';
import {
    getUniswapPriceQuote,
} from '../../utils/test_utils';

describe("ChainLinkPriceConsumer", function () {

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
    });

    it('should have an accurate quote (ETH to DAI)', async () => {
        //Get on-chain quote
        const ethDaiDecimals = await tuffVBTDiamond.getDecimals(
            consts("CHAINLINK_ETH_DAI_AGGR_ADDR"));
        const ethDaiQuote = await tuffVBTDiamond.getChainLinkPrice(
            consts("CHAINLINK_ETH_DAI_AGGR_ADDR"),
        );
        const expectedEthDaiQuote = (1 / ethDaiQuote.toNumber()) * Math.pow(10, ethDaiDecimals);

        //Get off-chain quote
        const actualEthDaiQuote = await getUniswapPriceQuote(
            consts("WETH9_ADDR"),
            consts("DAI_ADDR"),
            UNISWAP_POOL_BASE_FEE,
            3600
        );

        //Compare quotes. Include a buffer to account for different chainlink price feeds and for converting from
        // ethersjs BigNumbers to JavaScript numbers
        const buffer = 10; //"dollars"
        expect(actualEthDaiQuote).to.be.approximately(expectedEthDaiQuote, buffer);
    });

    it('should have similar quotes between stablecoins', async () => {
        //DAI
        const ethDAIDecimals = await tuffVBTDiamond.getDecimals(
            consts("CHAINLINK_ETH_DAI_AGGR_ADDR"));
        const ethDAIQuote = await tuffVBTDiamond.getChainLinkPrice(
            consts("CHAINLINK_ETH_DAI_AGGR_ADDR"),
        );

        //USDC
        const ethUSDCDecimals = await tuffVBTDiamond.getDecimals(
            consts("CHAINLINK_ETH_USDC_AGGR_ADDR"));
        const ethUSDCQuote = await tuffVBTDiamond.getChainLinkPrice(
            consts("CHAINLINK_ETH_USDC_AGGR_ADDR"),
        );

        //USDT
        const ethUSDTDecimals = await tuffVBTDiamond.getDecimals(
            consts("CHAINLINK_ETH_USDT_AGGR_ADDR"));
        const ethUSDTQuote = await tuffVBTDiamond.getChainLinkPrice(
            consts("CHAINLINK_ETH_USDT_AGGR_ADDR"),
        );

        //Compare decimals and quotes (while keeping everything in BigNumber format)
        expect(ethDAIDecimals).to.be.equal(ethUSDCDecimals);
        expect(ethDAIDecimals).to.be.equal(ethUSDTDecimals);
        expect(ethUSDCDecimals).to.be.equal(ethUSDTDecimals);
        // Include a buffer to account for different chainlink price feeds and current market trends. Take decimal
        // precision and move the decimal over 5 places meaning the buffer allows for .001% deviance
        const buffer = BigNumber.from(10).pow(ethDAIDecimals - 5);
        expect(BigNumber.from(buffer)).to.be.gt(ethDAIQuote.sub(ethUSDCQuote).abs());
        expect(BigNumber.from(buffer)).to.be.gt(ethDAIQuote.sub(ethUSDTQuote).abs());
        expect(BigNumber.from(buffer)).to.be.gt(ethUSDCQuote.sub(ethUSDTQuote).abs());
    });
});
