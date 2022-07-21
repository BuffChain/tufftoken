// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.6.0;

/// @notice UniswapManager interface used for cross solidity versions (v6 - v8)
interface IUniswapManager {
    function swapExactInputMultihop(
        address inputToken,
        address outputToken,
        uint24 poolAFee,
        uint24 poolBFee,
        uint256 amountIn,
        uint256 amountOutMinimum
    ) external returns (uint256);

    function swapExactInputSingle(
        address inputToken,
        address outputToken,
        uint24 poolFee,
        uint256 amountIn,
        uint256 amountOutMinimum
    ) external returns (uint256 amountOut);
}
