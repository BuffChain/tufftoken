// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.6.0;

// A solidity v6 interface wrapper for our UniswapManager
interface IUniswapManager {
    function swapExactInputSingle(
        address inputToken,
        uint24 poolFee,
        address outputToken,
        uint256 amountIn
    ) external returns (uint256 amountOut);
}
