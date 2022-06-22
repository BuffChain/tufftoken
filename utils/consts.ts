// SPDX-License-Identifier: agpl-3.0

import hre from "hardhat";
const networkName = hre.network.name;
console.log(`Using [${networkName}] network config`);

const constsMap: { [key: string]: { [key: string]: any } } = {
    "kovan": {
        //Network related
        "BLOCKTIME": 4, //seconds

        //Tokens (verified tokens from https://kovan.etherscan.io)
        "WETH9_ADDR": "0xd0A1E359811322d97991E03f863a0C30C2cF029C",
        "DAI_ADDR": "0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD",
        "USDC_ADDR": "0xe22da380ee6B445bb8273C81944ADEB6E8450422",
        "USDT_ADDR": "0x13512979ADE267AB5100878E2e0f485B568328a4",
        // https://aave.github.io/aave-addresses/kovan.json, these are subject to change
        "ADAI_ADDR": "0xdCf0aF9e59C002FA3AA091a46196b37530FD48a8",
        "AUSDC_ADDR": "0xe12AFeC5aa12Cf614678f9bFeeB98cA9Bb95b5B0",
        "AUSDT_ADDR": "0xFF3c8bc103682FA918c954E84F5056aB4DD5189d",

        //Aave (https://docs.aave.com/developers/deployed-contracts/deployed-contracts)
        "AAVE_LENDINGPOOL_PROVIDER_ADDR": "0x88757f2f99175387aB4C6a4b3067c77A695b0349",
        "AAVE_PROTOCOL_DATA_PROVIDER_ADDR": "0x3c73A5E5785cAC854D468F727c606C07488a29D6",

        //Uniswap (https://docs.uniswap.org/protocol/reference/deployments)
        "UNISWAP_V3_ROUTER_ADDR": "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        "UNISWAP_V3_FACTORY_ADDR": "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        "UNISWAP_V3_NONFUNGIBLEPOSITIONMANAGER_ADDR": "0xc36442b4a4522e871399cd717abdd847ab11fe88",

        //ChainLink (https://docs.chain.link/docs/ethereum-addresses/)
        "CHAINLINK_ETH_DAI_AGGR_ADDR": "0x22B58f1EbEDfCA50feF632bD73368b2FdA96D541",
        "CHAINLINK_ETH_USDC_AGGR_ADDR": "0x64EaC61A2DFda2c3Fa04eED49AA33D021AeC8838",
        "CHAINLINK_ETH_USDT_AGGR_ADDR": "0x0bF499444525a23E7Bb61997539725cA2e928138",

        //Current: price should be $.01, 1 DAI = 0.0004930897926165828 ETH, .01 DAI = 0.000004930897926165828 ETH
        // todo: LP pool may impact whether this needs to be a constant or function
        "TUFF_STARTING_PRICE": hre.ethers.utils.formatEther("3138750000000")
    },
    "mainnet": {
        //Network related
        "BLOCKTIME": 13, //seconds

        //Tokens (verified tokens from https://etherscan.io)
        "WETH9_ADDR": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        "DAI_ADDR": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        "USDC_ADDR": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        "USDT_ADDR": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        // https://aave.github.io/aave-addresses/mainnet.json
        "ADAI_ADDR": "0x028171bCA77440897B824Ca71D1c56caC55b68A3",
        "AUSDC_ADDR": "0xBcca60bB61934080951369a648Fb03DF4F96263C",
        "AUSDT_ADDR": "0x3Ed3B47Dd13EC9a98b44e6204A523E766B225811",

        //Aave (https://docs.aave.com/developers/deployed-contracts/deployed-contracts)
        "AAVE_LENDINGPOOL_PROVIDER_ADDR": "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
        "AAVE_PROTOCOL_DATA_PROVIDER_ADDR": "0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d",

        //Uniswap (https://docs.uniswap.org/protocol/reference/deployments)
        "UNISWAP_V3_ROUTER_ADDR": "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        "UNISWAP_V3_FACTORY_ADDR": "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        "UNISWAP_V3_NONFUNGIBLEPOSITIONMANAGER_ADDR": "0xc36442b4a4522e871399cd717abdd847ab11fe88",

        //ChainLink (https://docs.chain.link/docs/ethereum-addresses/)
        "CHAINLINK_ETH_DAI_AGGR_ADDR": "0x773616E4d11A78F511299002da57A0a94577F1f4",
        "CHAINLINK_ETH_USDC_AGGR_ADDR": "0x986b5E1e1755e3C2440e960477f25201B0a8bbD4",
        "CHAINLINK_ETH_USDT_AGGR_ADDR": "0xEe9F2375b4bdF6387aa8265dD4FB8F16512A1d46",

        //Dependent on market price of ETH/USD at the time of this block
        // price should be $.01, 1 DAI = 0.0005502003937688528 ETH, .01 DAI = 0.000005502003937688528 ETH
        "TUFF_STARTING_PRICE": 0.000005502003937688528
    }
}

export function consts(constsKey: string) {
    //Our hardhat network config is a fork off of mainnet
    let networkKey = networkName === "hardhat" ? "mainnet" : networkName;

    return constsMap[networkKey][constsKey];
}

//Network agnostic constants
export const TOKEN_NAME = 'TUFF VBT: DAI USDC USDT';
export const TOKEN_SYMBOL = 'tDUU';
export const TOKEN_DECIMALS = 18;
export const TOKEN_FARM_FEE = 10;
export const TOKEN_DEV_FEE = 1;
export const TOKEN_TOTAL_SUPPLY = 1000000000;

export const TOKEN_DAYS_UNTIL_MATURITY = 6 * 365;

export const UNISWAP_POOL_BASE_FEE = 3000;
export const UNISWAP_POOL_OBSERVATION_CARDINALITY = 100;

export const AAVE_BALANCE_BUFFER_PERCENTAGE = 5;

export const BUFFCHAIN_TOTAL_TUFF_PERCENTAGE = 15; //15%, will be divided by 100 as a BigNumber
export const BUFFCHAIN_INIT_TUFF_LIQUIDITY_PERCENTAGE = 50; //50%, will be divided by 100 as a BigNumber
export const BUFFCHAIN_INIT_WETH_LIQUIDITY_WETH = hre.ethers.utils.parseEther("10");
