# Solidity API

## UniswapManager

### onlyOwner

```solidity
modifier onlyOwner()
```

### isUniswapManagerInit

```solidity
function isUniswapManagerInit() public view returns (bool)
```

### initUniswapManager

```solidity
function initUniswapManager(contract ISwapRouter _swapRouter, address wethAddr, uint24 basePoolFee) public
```

### swapExactInputSingle

```solidity
function swapExactInputSingle(address inputToken, address outputToken, uint24 poolFee, uint256 amountIn, uint256 amountOutMinimum) external returns (uint256 amountOut)
```

swapExactOutputSingle swaps a minimum possible amount of DAI for a fixed amount of WETH.

_The calling address must approve this contract to spend its DAI for this function to succeed. As the amount of input DAI is variable,
 the calling address will need to approve for a slightly higher amount, anticipating some variance._

| Name | Type | Description |
| ---- | ---- | ----------- |
| inputToken | address |  |
| outputToken | address |  |
| poolFee | uint24 |  |
| amountIn | uint256 | The exact amount of `outputToken` to receive from the swap. |
| amountOutMinimum | uint256 |  |

| Name | Type | Description |
| ---- | ---- | ----------- |
| amountOut | uint256 | The amount of DAI actually spent in the swap. |

### swapExactOutputSingle

```solidity
function swapExactOutputSingle(address inputToken, address outputToken, uint24 poolFee, uint256 amountOut, uint256 amountInMaximum) external returns (uint256 amountIn)
```

swapExactOutputSingle swaps a minimum possible amount of DAI for a fixed amount of WETH.

_The calling address must approve this contract to spend its DAI for this function to succeed. As the amount of input DAI is variable,
 the calling address will need to approve for a slightly higher amount, anticipating some variance._

| Name | Type | Description |
| ---- | ---- | ----------- |
| inputToken | address |  |
| outputToken | address |  |
| poolFee | uint24 |  |
| amountOut | uint256 | The exact amount of WETH9 to receive from the swap. |
| amountInMaximum | uint256 | The amount of DAI we are willing to spend to receive the specified amount of WETH9. |

| Name | Type | Description |
| ---- | ---- | ----------- |
| amountIn | uint256 | The amount of DAI actually spent in the swap. |

### swapExactInputMultihop

```solidity
function swapExactInputMultihop(address inputToken, address outputToken, uint24 poolAFee, uint24 poolBFee, uint256 amountIn, uint256 amountOutMinimum) external returns (uint256)
```

based on https://docs.uniswap.org/protocol/guides/swaps/multihop-swaps

