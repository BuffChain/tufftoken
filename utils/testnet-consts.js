// SPDX-License-Identifier: agpl-3.0

// Tokens (verified tokens from https://etherscan.io)
const WETH9_ADDR = "";
const DAI_ADDR = "";
const USDC_ADDR = "";
const USDT_ADDR = "";
const ADAI_ADDR = "";

module.exports.WETH9_ADDR = WETH9_ADDR;
module.exports.DAI_ADDR = DAI_ADDR;
module.exports.USDC_ADDR = USDC_ADDR;
module.exports.USDT_ADDR = USDT_ADDR;
module.exports.ADAI_ADDR = ADAI_ADDR;

// Aave (https://docs.aave.com/developers/deployed-contracts/deployed-contracts)
const AAVE_LENDINGPOOL_PROVIDER_ADDR = "";

module.exports.AAVE_LENDINGPOOL_PROVIDER_ADDR = AAVE_LENDINGPOOL_PROVIDER_ADDR;

// Uniswap
const UNISWAP_V3_ROUTER_ADDR = "";
const UNISWAP_V3_FACTORY_ADDR = "";
const UNISWAP_WETH_DAI_POOL_ADDR = "";
const UNISWAP_WETH_USDC_POOL_ADDR = "";
const UNISWAP_POOL_BASE_FEE = 500;

module.exports.UNISWAP_V3_ROUTER_ADDR = UNISWAP_V3_ROUTER_ADDR;
module.exports.UNISWAP_V3_FACTORY_ADDR = UNISWAP_V3_FACTORY_ADDR;
module.exports.UNISWAP_WETH_DAI_POOL_ADDR = UNISWAP_WETH_DAI_POOL_ADDR;
module.exports.UNISWAP_WETH_USDC_POOL_ADDR = UNISWAP_WETH_USDC_POOL_ADDR;
module.exports.UNISWAP_POOL_BASE_FEE = UNISWAP_POOL_BASE_FEE;

// ChainLink
const CHAINLINK_ETH_USD_AGGREGATOR_ADDR = "";
const CHAINLINK_TOTAL_MARKETCAP_USD_AGGREGATOR_ADDR = "";

module.exports.CHAINLINK_ETH_USD_AGGREGATOR_ADDR = CHAINLINK_ETH_USD_AGGREGATOR_ADDR;
module.exports.CHAINLINK_TOTAL_MARKETCAP_USD_AGGREGATOR_ADDR = CHAINLINK_TOTAL_MARKETCAP_USD_AGGREGATOR_ADDR;

// PriceConsumer Enums
module.exports.CHAINLINK_PRICE_CONSUMER_ENUM = 0;
module.exports.UNISWAP_PRICE_CONSUMER_ENUM = 1;
