// SPDX-License-Identifier: agpl-3.0

const hre = require("hardhat");
const networkName = hre.network.name;
console.log(`Using [${networkName}] network config`)

let constsMap = {
    kovan: {
        // Tokens (verified tokens from https://kovan.etherscan.io)
        WETH9_ADDR: "0xd0A1E359811322d97991E03f863a0C30C2cF029C",
        DAI_ADDR: "0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa",
        USDC_ADDR: "0xb7a4F3E9097C08dA09517b5aB877F7a917224ede",
        USDT_ADDR: "0x07de306FF27a2B630B1141956844eB1552B956B5",
        ADAI_ADDR: "0xdcf0af9e59c002fa3aa091a46196b37530fd48a8",

        // Aave (https://docs.aave.com/developers/deployed-contracts/deployed-contracts)
        AAVE_LENDINGPOOL_PROVIDER_ADDR: "0x88757f2f99175387aB4C6a4b3067c77A695b0349",

        // Uniswap (https://docs.uniswap.org/protocol/reference/deployments)
        UNISWAP_V3_ROUTER_ADDR: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        UNISWAP_V3_FACTORY_ADDR: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        UNISWAP_WETH_DAI_POOL_ADDR: "0x89007E48d47484245805679Ab37114DB117AfAB2",
        UNISWAP_WETH_USDC_POOL_ADDR: "0xf43261E862FF94B45600d62444dEF3AB94f2a745",

        // ChainLink (https://docs.chain.link/docs/ethereum-addresses/ - ETH/USD)
        CHAINLINK_AGGREGATOR_ADDR: "0x9326BFA02ADD2366b30bacB125260Af641031331",
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

        // Uniswap (https://docs.uniswap.org/protocol/reference/deployments)
        UNISWAP_V3_ROUTER_ADDR: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        UNISWAP_V3_FACTORY_ADDR: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        UNISWAP_WETH_DAI_POOL_ADDR: "0x60594a405d53811d3BC4766596EFD80fd545A270",
        UNISWAP_WETH_USDC_POOL_ADDR: "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640",

        // ChainLink (https://docs.chain.link/docs/ethereum-addresses/ - Total USD Market Cap)
        CHAINLINK_AGGREGATOR_ADDR: "0xEC8761a0A73c34329CA5B1D3Dc7eD07F30e836e2",
    }
}

function consts(constsKey) {
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
