# Solidity API

## IUniswapManager

### swapExactInputMultihop

```solidity
function swapExactInputMultihop(address inputToken, address outputToken, uint24 poolAFee, uint24 poolBFee, uint256 amountIn, uint256 amountOutMinimum) external returns (uint256)
```

### swapExactInputSingle

```solidity
function swapExactInputSingle(address inputToken, address outputToken, uint24 poolFee, uint256 amountIn, uint256 amountOutMinimum) external returns (uint256 amountOut)
```

