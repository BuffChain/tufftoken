// SPDX-License-Identifier: agpl-3.0

const hre = require("hardhat");
const networkName = hre.network.name;
console.log(`Using [${networkName}] network config`)

let constsMap = {
    kovan: {
        // Tokens (verified tokens from https://etherscan.io)
        WETH9_ADDR: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        DAI_ADDR: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        USDC_ADDR: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        USDT_ADDR: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        ADAI_ADDR: "0x028171bCA77440897B824Ca71D1c56caC55b68A3",

        // Aave (https://docs.aave.com/developers/deployed-contracts/deployed-contracts)
        AAVE_LENDINGPOOL_PROVIDER_ADDR: "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",

        // Uniswap
        UNISWAP_V3_ROUTER_ADDR: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        UNISWAP_V3_FACTORY_ADDR: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        UNISWAP_WETH_DAI_POOL_ADDR: "0x60594a405d53811d3BC4766596EFD80fd545A270",
        UNISWAP_WETH_USDC_POOL_ADDR: "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640",

        // ChainLink
        CHAINLINK_ETH_USD_AGGREGATOR_ADDR: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
        CHAINLINK_TOTAL_MARKETCAP_USD_AGGREGATOR_ADDR: "0xEC8761a0A73c34329CA5B1D3Dc7eD07F30e836e2",
    },
    mainnet: {
        // Tokens (verified tokens from https://etherscan.io)
        WETH9_ADDR: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        DAI_ADDR: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        USDC_ADDR: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        USDT_ADDR: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        ADAI_ADDR: "0x028171bCA77440897B824Ca71D1c56caC55b68A3",

        // Aave (https://docs.aave.com/developers/deployed-contracts/deployed-contracts)
        AAVE_LENDINGPOOL_PROVIDER_ADDR: "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",

        // Uniswap
        UNISWAP_V3_ROUTER_ADDR: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        UNISWAP_V3_FACTORY_ADDR: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        UNISWAP_WETH_DAI_POOL_ADDR: "0x60594a405d53811d3BC4766596EFD80fd545A270",
        UNISWAP_WETH_USDC_POOL_ADDR: "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640",

        // ChainLink
        CHAINLINK_ETH_USD_AGGREGATOR_ADDR: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
        CHAINLINK_TOTAL_MARKETCAP_USD_AGGREGATOR_ADDR: "0xEC8761a0A73c34329CA5B1D3Dc7eD07F30e836e2",
    }
}

async function consts(constsKey) {
    //Our hardhat network config is a fork off of mainnet
    let networkKey = networkName === "hardhat" ? "mainnet" : networkName;

    return constsMap[networkKey][constsKey];
}

//
module.exports.UNISWAP_POOL_BASE_FEE = 500;

// PriceConsumer Enums
module.exports.CHAINLINK_PRICE_CONSUMER_ENUM = 0;
module.exports.UNISWAP_PRICE_CONSUMER_ENUM = 1;

module.exports.consts = consts;
