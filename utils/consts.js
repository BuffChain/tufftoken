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
        AAVE_PROTOCOL_DATA_PROVIDER_ADDR: "0x3c73A5E5785cAC854D468F727c606C07488a29D6",

        // Uniswap (https://docs.uniswap.org/protocol/reference/deployments)
        UNISWAP_V3_ROUTER_ADDR: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        UNISWAP_V3_FACTORY_ADDR: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        UNISWAP_WETH_DAI_POOL_ADDR: "0x89007E48d47484245805679Ab37114DB117AfAB2",
        UNISWAP_WETH_USDC_POOL_ADDR: "0xf43261E862FF94B45600d62444dEF3AB94f2a745",

        // Current: price should be $.01, 1 DAI = 0.0003139 ETH, .01 DAI = 0.00000313875 ETH
        TUFF_STARTING_PRICE: 0.00000313875 // todo: LP pool may impact whether this needs to be a constant or function

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
        AAVE_PROTOCOL_DATA_PROVIDER_ADDR: "0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d",

        // Uniswap (https://docs.uniswap.org/protocol/reference/deployments)
        UNISWAP_V3_ROUTER_ADDR: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        UNISWAP_V3_FACTORY_ADDR: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        UNISWAP_WETH_DAI_POOL_ADDR: "0x60594a405d53811d3BC4766596EFD80fd545A270",
        UNISWAP_WETH_USDC_POOL_ADDR: "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640",

        // Current: price should be $.01, 1 DAI = 0.0003139 ETH, .01 DAI = 0.00000313875 ETH
        TUFF_STARTING_PRICE: 0.00000313875 // todo: LP pool may impact whether this needs to be a constant or function

    }
}

function consts(constsKey) {
    //Our hardhat network config is a fork off of mainnet
    let networkKey = networkName === "hardhat" ? "mainnet" : networkName;

    return constsMap[networkKey][constsKey];
}

//
module.exports.UNISWAP_POOL_BASE_FEE = 3000;

// PriceConsumer Enums
module.exports.CHAINLINK_PRICE_CONSUMER_ENUM = 0;
module.exports.UNISWAP_PRICE_CONSUMER_ENUM = 1;

module.exports.consts = consts;
