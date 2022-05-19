// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.6.0;

// A solidity v6 interface wrapper for our UniswapPriceConsumer
interface IUniswapPriceConsumer {
    function getUniswapQuote(
        address _tokenA,
        address _tokenB,
        uint24 _fee,
        uint32 _period,
        uint8 _decimalPrecision
    ) external view returns (uint256 quoteAmt, uint128 decimalPrecision);
}
