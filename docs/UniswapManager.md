# Solidity API

## UniswapManager

### onlyOwner

```solidity
modifier onlyOwner()
```

### uniswapManagerInitLock

```solidity
modifier uniswapManagerInitLock()
```

### isUniswapManagerInit

```solidity
function isUniswapManagerInit() public view returns (bool)
```

### initUniswapManager

```solidity
function initUniswapManager(contract ISwapRouter _swapRouter, address WETHAddress, uint24 basePoolFee) public
```

### swapExactInputMultihop

```solidity
function swapExactInputMultihop(address inputToken, uint256 poolAFee, uint256 poolBFee, address outputToken, uint256 amountIn) external returns (uint256 amountOut)
```

based on https://docs.uniswap.org/protocol/guides/swaps/multihop-swaps

### swapExactInputSingle

```solidity
function swapExactInputSingle(address inputToken, uint24 poolFee, address outputToken, uint256 amountIn) external returns (uint256 amountOut)
```

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

