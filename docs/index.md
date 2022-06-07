# Solidity API

## SafeMath

_Wrappers over Solidity's arithmetic operations with added overflow
checks.

Arithmetic operations in Solidity wrap on overflow. This can easily result
in bugs, because programmers usually assume that an overflow raises an
error, which is the standard behavior in high level programming languages.
`SafeMath` restores this intuition by reverting the transaction when an
operation overflows.

Using this library instead of the unchecked operations eliminates an entire
class of bugs, so it's recommended to use it always._

### tryAdd

```solidity
function tryAdd(uint256 a, uint256 b) internal pure returns (bool, uint256)
```

_Returns the addition of two unsigned integers, with an overflow flag.

_Available since v3.4.__

### trySub

```solidity
function trySub(uint256 a, uint256 b) internal pure returns (bool, uint256)
```

_Returns the substraction of two unsigned integers, with an overflow flag.

_Available since v3.4.__

### tryMul

```solidity
function tryMul(uint256 a, uint256 b) internal pure returns (bool, uint256)
```

_Returns the multiplication of two unsigned integers, with an overflow flag.

_Available since v3.4.__

### tryDiv

```solidity
function tryDiv(uint256 a, uint256 b) internal pure returns (bool, uint256)
```

_Returns the division of two unsigned integers, with a division by zero flag.

_Available since v3.4.__

### tryMod

```solidity
function tryMod(uint256 a, uint256 b) internal pure returns (bool, uint256)
```

_Returns the remainder of dividing two unsigned integers, with a division by zero flag.

_Available since v3.4.__

### add

```solidity
function add(uint256 a, uint256 b) internal pure returns (uint256)
```

_Returns the addition of two unsigned integers, reverting on
overflow.

Counterpart to Solidity's `+` operator.

Requirements:

- Addition cannot overflow._

### sub

```solidity
function sub(uint256 a, uint256 b) internal pure returns (uint256)
```

_Returns the subtraction of two unsigned integers, reverting on
overflow (when the result is negative).

Counterpart to Solidity's `-` operator.

Requirements:

- Subtraction cannot overflow._

### mul

```solidity
function mul(uint256 a, uint256 b) internal pure returns (uint256)
```

_Returns the multiplication of two unsigned integers, reverting on
overflow.

Counterpart to Solidity's `*` operator.

Requirements:

- Multiplication cannot overflow._

### div

```solidity
function div(uint256 a, uint256 b) internal pure returns (uint256)
```

_Returns the integer division of two unsigned integers, reverting on
division by zero. The result is rounded towards zero.

Counterpart to Solidity's `/` operator. Note: this function uses a
`revert` opcode (which leaves remaining gas untouched) while Solidity
uses an invalid opcode to revert (consuming all remaining gas).

Requirements:

- The divisor cannot be zero._

### mod

```solidity
function mod(uint256 a, uint256 b) internal pure returns (uint256)
```

_Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
reverting when dividing by zero.

Counterpart to Solidity's `%` operator. This function uses a `revert`
opcode (which leaves remaining gas untouched) while Solidity uses an
invalid opcode to revert (consuming all remaining gas).

Requirements:

- The divisor cannot be zero._

### sub

```solidity
function sub(uint256 a, uint256 b, string errorMessage) internal pure returns (uint256)
```

_Returns the subtraction of two unsigned integers, reverting with custom message on
overflow (when the result is negative).

CAUTION: This function is deprecated because it requires allocating memory for the error
message unnecessarily. For custom revert reasons use {trySub}.

Counterpart to Solidity's `-` operator.

Requirements:

- Subtraction cannot overflow._

### div

```solidity
function div(uint256 a, uint256 b, string errorMessage) internal pure returns (uint256)
```

_Returns the integer division of two unsigned integers, reverting with custom message on
division by zero. The result is rounded towards zero.

CAUTION: This function is deprecated because it requires allocating memory for the error
message unnecessarily. For custom revert reasons use {tryDiv}.

Counterpart to Solidity's `/` operator. Note: this function uses a
`revert` opcode (which leaves remaining gas untouched) while Solidity
uses an invalid opcode to revert (consuming all remaining gas).

Requirements:

- The divisor cannot be zero._

### mod

```solidity
function mod(uint256 a, uint256 b, string errorMessage) internal pure returns (uint256)
```

_Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
reverting with custom message when dividing by zero.

CAUTION: This function is deprecated because it requires allocating memory for the error
message unnecessarily. For custom revert reasons use {tryMod}.

Counterpart to Solidity's `%` operator. This function uses a `revert`
opcode (which leaves remaining gas untouched) while Solidity uses an
invalid opcode to revert (consuming all remaining gas).

Requirements:

- The divisor cannot be zero._

## IERC20

_Interface of the ERC20 standard as defined in the EIP._

### totalSupply

```solidity
function totalSupply() external view returns (uint256)
```

_Returns the amount of tokens in existence._

### balanceOf

```solidity
function balanceOf(address account) external view returns (uint256)
```

_Returns the amount of tokens owned by `account`._

### transfer

```solidity
function transfer(address recipient, uint256 amount) external returns (bool)
```

_Moves `amount` tokens from the caller's account to `recipient`.

Returns a boolean value indicating whether the operation succeeded.

Emits a {Transfer} event._

### allowance

```solidity
function allowance(address owner, address spender) external view returns (uint256)
```

_Returns the remaining number of tokens that `spender` will be
allowed to spend on behalf of `owner` through {transferFrom}. This is
zero by default.

This value changes when {approve} or {transferFrom} are called._

### approve

```solidity
function approve(address spender, uint256 amount) external returns (bool)
```

_Sets `amount` as the allowance of `spender` over the caller's tokens.

Returns a boolean value indicating whether the operation succeeded.

IMPORTANT: Beware that changing an allowance with this method brings the risk
that someone may use both the old and the new allowance by unfortunate
transaction ordering. One possible solution to mitigate this race
condition is to first reduce the spender's allowance to 0 and set the
desired value afterwards:
https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729

Emits an {Approval} event._

### transferFrom

```solidity
function transferFrom(address sender, address recipient, uint256 amount) external returns (bool)
```

_Moves `amount` tokens from `sender` to `recipient` using the
allowance mechanism. `amount` is then deducted from the caller's
allowance.

Returns a boolean value indicating whether the operation succeeded.

Emits a {Transfer} event._

### Transfer

```solidity
event Transfer(address from, address to, uint256 value)
```

_Emitted when `value` tokens are moved from one account (`from`) to
another (`to`).

Note that `value` may be zero._

### Approval

```solidity
event Approval(address owner, address spender, uint256 value)
```

_Emitted when the allowance of a `spender` for an `owner` is set by
a call to {approve}. `value` is the new allowance._

## Context

### _msgSender

```solidity
function _msgSender() internal view virtual returns (address payable)
```

### _msgData

```solidity
function _msgData() internal view virtual returns (bytes)
```

## IUniswapV3Factory

The Uniswap V3 Factory facilitates creation of Uniswap V3 pools and control over the protocol fees

### OwnerChanged

```solidity
event OwnerChanged(address oldOwner, address newOwner)
```

Emitted when the owner of the factory is changed

| Name | Type | Description |
| ---- | ---- | ----------- |
| oldOwner | address | The owner before the owner was changed |
| newOwner | address | The owner after the owner was changed |

### PoolCreated

```solidity
event PoolCreated(address token0, address token1, uint24 fee, int24 tickSpacing, address pool)
```

Emitted when a pool is created

| Name | Type | Description |
| ---- | ---- | ----------- |
| token0 | address | The first token of the pool by address sort order |
| token1 | address | The second token of the pool by address sort order |
| fee | uint24 | The fee collected upon every swap in the pool, denominated in hundredths of a bip |
| tickSpacing | int24 | The minimum number of ticks between initialized ticks |
| pool | address | The address of the created pool |

### FeeAmountEnabled

```solidity
event FeeAmountEnabled(uint24 fee, int24 tickSpacing)
```

Emitted when a new fee amount is enabled for pool creation via the factory

| Name | Type | Description |
| ---- | ---- | ----------- |
| fee | uint24 | The enabled fee, denominated in hundredths of a bip |
| tickSpacing | int24 | The minimum number of ticks between initialized ticks for pools created with the given fee |

### owner

```solidity
function owner() external view returns (address)
```

Returns the current owner of the factory

_Can be changed by the current owner via setOwner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The address of the factory owner |

### feeAmountTickSpacing

```solidity
function feeAmountTickSpacing(uint24 fee) external view returns (int24)
```

Returns the tick spacing for a given fee amount, if enabled, or 0 if not enabled

_A fee amount can never be removed, so this value should be hard coded or cached in the calling context_

| Name | Type | Description |
| ---- | ---- | ----------- |
| fee | uint24 | The enabled fee, denominated in hundredths of a bip. Returns 0 in case of unenabled fee |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | int24 | The tick spacing |

### getPool

```solidity
function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)
```

Returns the pool address for a given pair of tokens and a fee, or address 0 if it does not exist

_tokenA and tokenB may be passed in either token0/token1 or token1/token0 order_

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenA | address | The contract address of either token0 or token1 |
| tokenB | address | The contract address of the other token |
| fee | uint24 | The fee collected upon every swap in the pool, denominated in hundredths of a bip |

| Name | Type | Description |
| ---- | ---- | ----------- |
| pool | address | The pool address |

### createPool

```solidity
function createPool(address tokenA, address tokenB, uint24 fee) external returns (address pool)
```

Creates a pool for the given two tokens and fee

_tokenA and tokenB may be passed in either order: token0/token1 or token1/token0. tickSpacing is retrieved
from the fee. The call will revert if the pool already exists, the fee is invalid, or the token arguments
are invalid._

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenA | address | One of the two tokens in the desired pool |
| tokenB | address | The other of the two tokens in the desired pool |
| fee | uint24 | The desired fee for the pool |

| Name | Type | Description |
| ---- | ---- | ----------- |
| pool | address | The address of the newly created pool |

### setOwner

```solidity
function setOwner(address _owner) external
```

Updates the owner of the factory

_Must be called by the current owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _owner | address | The new owner of the factory |

### enableFeeAmount

```solidity
function enableFeeAmount(uint24 fee, int24 tickSpacing) external
```

Enables a fee amount with the given tickSpacing

_Fee amounts may never be removed once enabled_

| Name | Type | Description |
| ---- | ---- | ----------- |
| fee | uint24 | The fee amount to enable, denominated in hundredths of a bip (i.e. 1e-6) |
| tickSpacing | int24 | The spacing between ticks to be enforced for all pools created with the given fee amount |

## IUniswapV3Pool

A Uniswap pool facilitates swapping and automated market making between any two assets that strictly conform
to the ERC20 specification

_The pool interface is broken up into many smaller pieces_

## IUniswapV3PoolActions

Contains pool methods that can be called by anyone

### initialize

```solidity
function initialize(uint160 sqrtPriceX96) external
```

Sets the initial price for the pool

_Price is represented as a sqrt(amountToken1/amountToken0) Q64.96 value_

| Name | Type | Description |
| ---- | ---- | ----------- |
| sqrtPriceX96 | uint160 | the initial sqrt price of the pool as a Q64.96 |

### mint

```solidity
function mint(address recipient, int24 tickLower, int24 tickUpper, uint128 amount, bytes data) external returns (uint256 amount0, uint256 amount1)
```

Adds liquidity for the given recipient/tickLower/tickUpper position

_The caller of this method receives a callback in the form of IUniswapV3MintCallback#uniswapV3MintCallback
in which they must pay any token0 or token1 owed for the liquidity. The amount of token0/token1 due depends
on tickLower, tickUpper, the amount of liquidity, and the current price._

| Name | Type | Description |
| ---- | ---- | ----------- |
| recipient | address | The address for which the liquidity will be created |
| tickLower | int24 | The lower tick of the position in which to add liquidity |
| tickUpper | int24 | The upper tick of the position in which to add liquidity |
| amount | uint128 | The amount of liquidity to mint |
| data | bytes | Any data that should be passed through to the callback |

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount0 | uint256 | The amount of token0 that was paid to mint the given amount of liquidity. Matches the value in the callback |
| amount1 | uint256 | The amount of token1 that was paid to mint the given amount of liquidity. Matches the value in the callback |

### collect

```solidity
function collect(address recipient, int24 tickLower, int24 tickUpper, uint128 amount0Requested, uint128 amount1Requested) external returns (uint128 amount0, uint128 amount1)
```

Collects tokens owed to a position

_Does not recompute fees earned, which must be done either via mint or burn of any amount of liquidity.
Collect must be called by the position owner. To withdraw only token0 or only token1, amount0Requested or
amount1Requested may be set to zero. To withdraw all tokens owed, caller may pass any value greater than the
actual tokens owed, e.g. type(uint128).max. Tokens owed may be from accumulated swap fees or burned liquidity._

| Name | Type | Description |
| ---- | ---- | ----------- |
| recipient | address | The address which should receive the fees collected |
| tickLower | int24 | The lower tick of the position for which to collect fees |
| tickUpper | int24 | The upper tick of the position for which to collect fees |
| amount0Requested | uint128 | How much token0 should be withdrawn from the fees owed |
| amount1Requested | uint128 | How much token1 should be withdrawn from the fees owed |

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount0 | uint128 | The amount of fees collected in token0 |
| amount1 | uint128 | The amount of fees collected in token1 |

### burn

```solidity
function burn(int24 tickLower, int24 tickUpper, uint128 amount) external returns (uint256 amount0, uint256 amount1)
```

Burn liquidity from the sender and account tokens owed for the liquidity to the position

_Can be used to trigger a recalculation of fees owed to a position by calling with an amount of 0
Fees must be collected separately via a call to #collect_

| Name | Type | Description |
| ---- | ---- | ----------- |
| tickLower | int24 | The lower tick of the position for which to burn liquidity |
| tickUpper | int24 | The upper tick of the position for which to burn liquidity |
| amount | uint128 | How much liquidity to burn |

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount0 | uint256 | The amount of token0 sent to the recipient |
| amount1 | uint256 | The amount of token1 sent to the recipient |

### swap

```solidity
function swap(address recipient, bool zeroForOne, int256 amountSpecified, uint160 sqrtPriceLimitX96, bytes data) external returns (int256 amount0, int256 amount1)
```

Swap token0 for token1, or token1 for token0

_The caller of this method receives a callback in the form of IUniswapV3SwapCallback#uniswapV3SwapCallback_

| Name | Type | Description |
| ---- | ---- | ----------- |
| recipient | address | The address to receive the output of the swap |
| zeroForOne | bool | The direction of the swap, true for token0 to token1, false for token1 to token0 |
| amountSpecified | int256 | The amount of the swap, which implicitly configures the swap as exact input (positive), or exact output (negative) |
| sqrtPriceLimitX96 | uint160 | The Q64.96 sqrt price limit. If zero for one, the price cannot be less than this value after the swap. If one for zero, the price cannot be greater than this value after the swap |
| data | bytes | Any data to be passed through to the callback |

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount0 | int256 | The delta of the balance of token0 of the pool, exact when negative, minimum when positive |
| amount1 | int256 | The delta of the balance of token1 of the pool, exact when negative, minimum when positive |

### flash

```solidity
function flash(address recipient, uint256 amount0, uint256 amount1, bytes data) external
```

Receive token0 and/or token1 and pay it back, plus a fee, in the callback

_The caller of this method receives a callback in the form of IUniswapV3FlashCallback#uniswapV3FlashCallback
Can be used to donate underlying tokens pro-rata to currently in-range liquidity providers by calling
with 0 amount{0,1} and sending the donation amount(s) from the callback_

| Name | Type | Description |
| ---- | ---- | ----------- |
| recipient | address | The address which will receive the token0 and token1 amounts |
| amount0 | uint256 | The amount of token0 to send |
| amount1 | uint256 | The amount of token1 to send |
| data | bytes | Any data to be passed through to the callback |

### increaseObservationCardinalityNext

```solidity
function increaseObservationCardinalityNext(uint16 observationCardinalityNext) external
```

Increase the maximum number of price and liquidity observations that this pool will store

_This method is no-op if the pool already has an observationCardinalityNext greater than or equal to
the input observationCardinalityNext._

| Name | Type | Description |
| ---- | ---- | ----------- |
| observationCardinalityNext | uint16 | The desired minimum number of observations for the pool to store |

## IUniswapV3PoolDerivedState

Contains view functions to provide information about the pool that is computed rather than stored on the
blockchain. The functions here may have variable gas costs.

### observe

```solidity
function observe(uint32[] secondsAgos) external view returns (int56[] tickCumulatives, uint160[] secondsPerLiquidityCumulativeX128s)
```

Returns the cumulative tick and liquidity as of each timestamp `secondsAgo` from the current block timestamp

_To get a time weighted average tick or liquidity-in-range, you must call this with two values, one representing
the beginning of the period and another for the end of the period. E.g., to get the last hour time-weighted average tick,
you must call it with secondsAgos = [3600, 0].
The time weighted average tick represents the geometric time weighted average price of the pool, in
log base sqrt(1.0001) of token1 / token0. The TickMath library can be used to go from a tick value to a ratio._

| Name | Type | Description |
| ---- | ---- | ----------- |
| secondsAgos | uint32[] | From how long ago each cumulative tick and liquidity value should be returned |

| Name | Type | Description |
| ---- | ---- | ----------- |
| tickCumulatives | int56[] | Cumulative tick values as of each `secondsAgos` from the current block timestamp |
| secondsPerLiquidityCumulativeX128s | uint160[] | Cumulative seconds per liquidity-in-range value as of each `secondsAgos` from the current block timestamp |

### snapshotCumulativesInside

```solidity
function snapshotCumulativesInside(int24 tickLower, int24 tickUpper) external view returns (int56 tickCumulativeInside, uint160 secondsPerLiquidityInsideX128, uint32 secondsInside)
```

Returns a snapshot of the tick cumulative, seconds per liquidity and seconds inside a tick range

_Snapshots must only be compared to other snapshots, taken over a period for which a position existed.
I.e., snapshots cannot be compared if a position is not held for the entire period between when the first
snapshot is taken and the second snapshot is taken._

| Name | Type | Description |
| ---- | ---- | ----------- |
| tickLower | int24 | The lower tick of the range |
| tickUpper | int24 | The upper tick of the range |

| Name | Type | Description |
| ---- | ---- | ----------- |
| tickCumulativeInside | int56 | The snapshot of the tick accumulator for the range |
| secondsPerLiquidityInsideX128 | uint160 | The snapshot of seconds per liquidity for the range |
| secondsInside | uint32 | The snapshot of seconds per liquidity for the range |

## IUniswapV3PoolEvents

Contains all events emitted by the pool

### Initialize

```solidity
event Initialize(uint160 sqrtPriceX96, int24 tick)
```

Emitted exactly once by a pool when #initialize is first called on the pool

_Mint/Burn/Swap cannot be emitted by the pool before Initialize_

| Name | Type | Description |
| ---- | ---- | ----------- |
| sqrtPriceX96 | uint160 | The initial sqrt price of the pool, as a Q64.96 |
| tick | int24 | The initial tick of the pool, i.e. log base 1.0001 of the starting price of the pool |

### Mint

```solidity
event Mint(address sender, address owner, int24 tickLower, int24 tickUpper, uint128 amount, uint256 amount0, uint256 amount1)
```

Emitted when liquidity is minted for a given position

| Name | Type | Description |
| ---- | ---- | ----------- |
| sender | address | The address that minted the liquidity |
| owner | address | The owner of the position and recipient of any minted liquidity |
| tickLower | int24 | The lower tick of the position |
| tickUpper | int24 | The upper tick of the position |
| amount | uint128 | The amount of liquidity minted to the position range |
| amount0 | uint256 | How much token0 was required for the minted liquidity |
| amount1 | uint256 | How much token1 was required for the minted liquidity |

### Collect

```solidity
event Collect(address owner, address recipient, int24 tickLower, int24 tickUpper, uint128 amount0, uint128 amount1)
```

Emitted when fees are collected by the owner of a position

_Collect events may be emitted with zero amount0 and amount1 when the caller chooses not to collect fees_

| Name | Type | Description |
| ---- | ---- | ----------- |
| owner | address | The owner of the position for which fees are collected |
| recipient | address |  |
| tickLower | int24 | The lower tick of the position |
| tickUpper | int24 | The upper tick of the position |
| amount0 | uint128 | The amount of token0 fees collected |
| amount1 | uint128 | The amount of token1 fees collected |

### Burn

```solidity
event Burn(address owner, int24 tickLower, int24 tickUpper, uint128 amount, uint256 amount0, uint256 amount1)
```

Emitted when a position's liquidity is removed

_Does not withdraw any fees earned by the liquidity position, which must be withdrawn via #collect_

| Name | Type | Description |
| ---- | ---- | ----------- |
| owner | address | The owner of the position for which liquidity is removed |
| tickLower | int24 | The lower tick of the position |
| tickUpper | int24 | The upper tick of the position |
| amount | uint128 | The amount of liquidity to remove |
| amount0 | uint256 | The amount of token0 withdrawn |
| amount1 | uint256 | The amount of token1 withdrawn |

### Swap

```solidity
event Swap(address sender, address recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)
```

Emitted by the pool for any swaps between token0 and token1

| Name | Type | Description |
| ---- | ---- | ----------- |
| sender | address | The address that initiated the swap call, and that received the callback |
| recipient | address | The address that received the output of the swap |
| amount0 | int256 | The delta of the token0 balance of the pool |
| amount1 | int256 | The delta of the token1 balance of the pool |
| sqrtPriceX96 | uint160 | The sqrt(price) of the pool after the swap, as a Q64.96 |
| liquidity | uint128 | The liquidity of the pool after the swap |
| tick | int24 | The log base 1.0001 of price of the pool after the swap |

### Flash

```solidity
event Flash(address sender, address recipient, uint256 amount0, uint256 amount1, uint256 paid0, uint256 paid1)
```

Emitted by the pool for any flashes of token0/token1

| Name | Type | Description |
| ---- | ---- | ----------- |
| sender | address | The address that initiated the swap call, and that received the callback |
| recipient | address | The address that received the tokens from flash |
| amount0 | uint256 | The amount of token0 that was flashed |
| amount1 | uint256 | The amount of token1 that was flashed |
| paid0 | uint256 | The amount of token0 paid for the flash, which can exceed the amount0 plus the fee |
| paid1 | uint256 | The amount of token1 paid for the flash, which can exceed the amount1 plus the fee |

### IncreaseObservationCardinalityNext

```solidity
event IncreaseObservationCardinalityNext(uint16 observationCardinalityNextOld, uint16 observationCardinalityNextNew)
```

Emitted by the pool for increases to the number of observations that can be stored

_observationCardinalityNext is not the observation cardinality until an observation is written at the index
just before a mint/swap/burn._

| Name | Type | Description |
| ---- | ---- | ----------- |
| observationCardinalityNextOld | uint16 | The previous value of the next observation cardinality |
| observationCardinalityNextNew | uint16 | The updated value of the next observation cardinality |

### SetFeeProtocol

```solidity
event SetFeeProtocol(uint8 feeProtocol0Old, uint8 feeProtocol1Old, uint8 feeProtocol0New, uint8 feeProtocol1New)
```

Emitted when the protocol fee is changed by the pool

| Name | Type | Description |
| ---- | ---- | ----------- |
| feeProtocol0Old | uint8 | The previous value of the token0 protocol fee |
| feeProtocol1Old | uint8 | The previous value of the token1 protocol fee |
| feeProtocol0New | uint8 | The updated value of the token0 protocol fee |
| feeProtocol1New | uint8 | The updated value of the token1 protocol fee |

### CollectProtocol

```solidity
event CollectProtocol(address sender, address recipient, uint128 amount0, uint128 amount1)
```

Emitted when the collected protocol fees are withdrawn by the factory owner

| Name | Type | Description |
| ---- | ---- | ----------- |
| sender | address | The address that collects the protocol fees |
| recipient | address | The address that receives the collected protocol fees |
| amount0 | uint128 | The amount of token0 protocol fees that is withdrawn |
| amount1 | uint128 |  |

## IUniswapV3PoolImmutables

These parameters are fixed for a pool forever, i.e., the methods will always return the same values

### factory

```solidity
function factory() external view returns (address)
```

The contract that deployed the pool, which must adhere to the IUniswapV3Factory interface

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The contract address |

### token0

```solidity
function token0() external view returns (address)
```

The first of the two tokens of the pool, sorted by address

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The token contract address |

### token1

```solidity
function token1() external view returns (address)
```

The second of the two tokens of the pool, sorted by address

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The token contract address |

### fee

```solidity
function fee() external view returns (uint24)
```

The pool's fee in hundredths of a bip, i.e. 1e-6

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint24 | The fee |

### tickSpacing

```solidity
function tickSpacing() external view returns (int24)
```

The pool tick spacing

_Ticks can only be used at multiples of this value, minimum of 1 and always positive
e.g.: a tickSpacing of 3 means ticks can be initialized every 3rd tick, i.e., ..., -6, -3, 0, 3, 6, ...
This value is an int24 to avoid casting even though it is always positive._

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | int24 | The tick spacing |

### maxLiquidityPerTick

```solidity
function maxLiquidityPerTick() external view returns (uint128)
```

The maximum amount of position liquidity that can use any tick in the range

_This parameter is enforced per tick to prevent liquidity from overflowing a uint128 at any point, and
also prevents out-of-range liquidity from being used to prevent adding in-range liquidity to a pool_

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint128 | The max amount of liquidity per tick |

## IUniswapV3PoolOwnerActions

Contains pool methods that may only be called by the factory owner

### setFeeProtocol

```solidity
function setFeeProtocol(uint8 feeProtocol0, uint8 feeProtocol1) external
```

Set the denominator of the protocol's % share of the fees

| Name | Type | Description |
| ---- | ---- | ----------- |
| feeProtocol0 | uint8 | new protocol fee for token0 of the pool |
| feeProtocol1 | uint8 | new protocol fee for token1 of the pool |

### collectProtocol

```solidity
function collectProtocol(address recipient, uint128 amount0Requested, uint128 amount1Requested) external returns (uint128 amount0, uint128 amount1)
```

Collect the protocol fee accrued to the pool

| Name | Type | Description |
| ---- | ---- | ----------- |
| recipient | address | The address to which collected protocol fees should be sent |
| amount0Requested | uint128 | The maximum amount of token0 to send, can be 0 to collect fees in only token1 |
| amount1Requested | uint128 | The maximum amount of token1 to send, can be 0 to collect fees in only token0 |

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount0 | uint128 | The protocol fee collected in token0 |
| amount1 | uint128 | The protocol fee collected in token1 |

## IUniswapV3PoolState

These methods compose the pool's state, and can change with any frequency including multiple times
per transaction

### slot0

```solidity
function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)
```

The 0th storage slot in the pool stores many values, and is exposed as a single method to save gas
when accessed externally.

| Name | Type | Description |
| ---- | ---- | ----------- |
| sqrtPriceX96 | uint160 | The current price of the pool as a sqrt(token1/token0) Q64.96 value tick The current tick of the pool, i.e. according to the last tick transition that was run. This value may not always be equal to SqrtTickMath.getTickAtSqrtRatio(sqrtPriceX96) if the price is on a tick boundary. observationIndex The index of the last oracle observation that was written, observationCardinality The current maximum number of observations stored in the pool, observationCardinalityNext The next maximum number of observations, to be updated when the observation. feeProtocol The protocol fee for both tokens of the pool. Encoded as two 4 bit values, where the protocol fee of token1 is shifted 4 bits and the protocol fee of token0 is the lower 4 bits. Used as the denominator of a fraction of the swap fee, e.g. 4 means 1/4th of the swap fee. unlocked Whether the pool is currently locked to reentrancy |
| tick | int24 |  |
| observationIndex | uint16 |  |
| observationCardinality | uint16 |  |
| observationCardinalityNext | uint16 |  |
| feeProtocol | uint8 |  |
| unlocked | bool |  |

### feeGrowthGlobal0X128

```solidity
function feeGrowthGlobal0X128() external view returns (uint256)
```

The fee growth as a Q128.128 fees of token0 collected per unit of liquidity for the entire life of the pool

_This value can overflow the uint256_

### feeGrowthGlobal1X128

```solidity
function feeGrowthGlobal1X128() external view returns (uint256)
```

The fee growth as a Q128.128 fees of token1 collected per unit of liquidity for the entire life of the pool

_This value can overflow the uint256_

### protocolFees

```solidity
function protocolFees() external view returns (uint128 token0, uint128 token1)
```

The amounts of token0 and token1 that are owed to the protocol

_Protocol fees will never exceed uint128 max in either token_

### liquidity

```solidity
function liquidity() external view returns (uint128)
```

The currently in range liquidity available to the pool

_This value has no relationship to the total liquidity across all ticks_

### ticks

```solidity
function ticks(int24 tick) external view returns (uint128 liquidityGross, int128 liquidityNet, uint256 feeGrowthOutside0X128, uint256 feeGrowthOutside1X128, int56 tickCumulativeOutside, uint160 secondsPerLiquidityOutsideX128, uint32 secondsOutside, bool initialized)
```

Look up information about a specific tick in the pool

| Name | Type | Description |
| ---- | ---- | ----------- |
| tick | int24 | The tick to look up |

| Name | Type | Description |
| ---- | ---- | ----------- |
| liquidityGross | uint128 | the total amount of position liquidity that uses the pool either as tick lower or tick upper, liquidityNet how much liquidity changes when the pool price crosses the tick, feeGrowthOutside0X128 the fee growth on the other side of the tick from the current tick in token0, feeGrowthOutside1X128 the fee growth on the other side of the tick from the current tick in token1, tickCumulativeOutside the cumulative tick value on the other side of the tick from the current tick secondsPerLiquidityOutsideX128 the seconds spent per liquidity on the other side of the tick from the current tick, secondsOutside the seconds spent on the other side of the tick from the current tick, initialized Set to true if the tick is initialized, i.e. liquidityGross is greater than 0, otherwise equal to false. Outside values can only be used if the tick is initialized, i.e. if liquidityGross is greater than 0. In addition, these values are only relative and must be used only in comparison to previous snapshots for a specific position. |
| liquidityNet | int128 |  |
| feeGrowthOutside0X128 | uint256 |  |
| feeGrowthOutside1X128 | uint256 |  |
| tickCumulativeOutside | int56 |  |
| secondsPerLiquidityOutsideX128 | uint160 |  |
| secondsOutside | uint32 |  |
| initialized | bool |  |

### tickBitmap

```solidity
function tickBitmap(int16 wordPosition) external view returns (uint256)
```

Returns 256 packed tick initialized boolean values. See TickBitmap for more information

### positions

```solidity
function positions(bytes32 key) external view returns (uint128 _liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)
```

Returns the information about a position by the position's key

| Name | Type | Description |
| ---- | ---- | ----------- |
| key | bytes32 | The position's key is a hash of a preimage composed by the owner, tickLower and tickUpper |

| Name | Type | Description |
| ---- | ---- | ----------- |
| _liquidity | uint128 | The amount of liquidity in the position, Returns feeGrowthInside0LastX128 fee growth of token0 inside the tick range as of the last mint/burn/poke, Returns feeGrowthInside1LastX128 fee growth of token1 inside the tick range as of the last mint/burn/poke, Returns tokensOwed0 the computed amount of token0 owed to the position as of the last mint/burn/poke, Returns tokensOwed1 the computed amount of token1 owed to the position as of the last mint/burn/poke |
| feeGrowthInside0LastX128 | uint256 |  |
| feeGrowthInside1LastX128 | uint256 |  |
| tokensOwed0 | uint128 |  |
| tokensOwed1 | uint128 |  |

### observations

```solidity
function observations(uint256 index) external view returns (uint32 blockTimestamp, int56 tickCumulative, uint160 secondsPerLiquidityCumulativeX128, bool initialized)
```

Returns data about a specific observation index

_You most likely want to use #observe() instead of this method to get an observation as of some amount of time
ago, rather than at a specific index in the array._

| Name | Type | Description |
| ---- | ---- | ----------- |
| index | uint256 | The element of the observations array to fetch |

| Name | Type | Description |
| ---- | ---- | ----------- |
| blockTimestamp | uint32 | The timestamp of the observation, Returns tickCumulative the tick multiplied by seconds elapsed for the life of the pool as of the observation timestamp, Returns secondsPerLiquidityCumulativeX128 the seconds per in range liquidity for the life of the pool as of the observation timestamp, Returns initialized whether the observation has been initialized and the values are safe to use |
| tickCumulative | int56 |  |
| secondsPerLiquidityCumulativeX128 | uint160 |  |
| initialized | bool |  |

## FullMath

Facilitates multiplication and division that can have overflow of an intermediate value without any loss of precision

_Handles "phantom overflow" i.e., allows multiplication and division where an intermediate value overflows 256 bits_

### mulDiv

```solidity
function mulDiv(uint256 a, uint256 b, uint256 denominator) internal pure returns (uint256 result)
```

Calculates floor(a×b÷denominator) with full precision. Throws if result overflows a uint256 or denominator == 0

_Credit to Remco Bloemen under MIT license https://xn--2-umb.com/21/muldiv_

| Name | Type | Description |
| ---- | ---- | ----------- |
| a | uint256 | The multiplicand |
| b | uint256 | The multiplier |
| denominator | uint256 | The divisor |

| Name | Type | Description |
| ---- | ---- | ----------- |
| result | uint256 | The 256-bit result |

### mulDivRoundingUp

```solidity
function mulDivRoundingUp(uint256 a, uint256 b, uint256 denominator) internal pure returns (uint256 result)
```

/ @notice Calculates ceil(a×b÷denominator) with full precision. Throws if result overflows a uint256 or denominator == 0

| Name | Type | Description |
| ---- | ---- | ----------- |
| a | uint256 | The multiplicand |
| b | uint256 | The multiplier |
| denominator | uint256 | The divisor |

| Name | Type | Description |
| ---- | ---- | ----------- |
| result | uint256 | The 256-bit result |

## TickMath

Computes sqrt price for ticks of size 1.0001, i.e. sqrt(1.0001^tick) as fixed point Q64.96 numbers. Supports
prices between 2**-128 and 2**128

### MIN_TICK

```solidity
int24 MIN_TICK
```

_The minimum tick that may be passed to #getSqrtRatioAtTick computed from log base 1.0001 of 2**-128_

### MAX_TICK

```solidity
int24 MAX_TICK
```

_The maximum tick that may be passed to #getSqrtRatioAtTick computed from log base 1.0001 of 2**128_

### MIN_SQRT_RATIO

```solidity
uint160 MIN_SQRT_RATIO
```

_The minimum value that can be returned from #getSqrtRatioAtTick. Equivalent to getSqrtRatioAtTick(MIN_TICK)_

### MAX_SQRT_RATIO

```solidity
uint160 MAX_SQRT_RATIO
```

_The maximum value that can be returned from #getSqrtRatioAtTick. Equivalent to getSqrtRatioAtTick(MAX_TICK)_

### getSqrtRatioAtTick

```solidity
function getSqrtRatioAtTick(int24 tick) internal pure returns (uint160 sqrtPriceX96)
```

Calculates sqrt(1.0001^tick) * 2^96

_Throws if |tick| > max tick_

| Name | Type | Description |
| ---- | ---- | ----------- |
| tick | int24 | The input tick for the above formula |

| Name | Type | Description |
| ---- | ---- | ----------- |
| sqrtPriceX96 | uint160 | A Fixed point Q64.96 number representing the sqrt of the ratio of the two assets (token1/token0) at the given tick |

### getTickAtSqrtRatio

```solidity
function getTickAtSqrtRatio(uint160 sqrtPriceX96) internal pure returns (int24 tick)
```

Calculates the greatest tick value such that getRatioAtTick(tick) <= ratio

_Throws in case sqrtPriceX96 < MIN_SQRT_RATIO, as MIN_SQRT_RATIO is the lowest value getRatioAtTick may
ever return._

| Name | Type | Description |
| ---- | ---- | ----------- |
| sqrtPriceX96 | uint160 | The sqrt ratio for which to compute the tick as a Q64.96 |

| Name | Type | Description |
| ---- | ---- | ----------- |
| tick | int24 | The greatest tick for which the ratio is less than or equal to the input ratio |

## OracleLibrary

Provides functions to integrate with V3 pool oracle

### consult

```solidity
function consult(address pool, uint32 secondsAgo) internal view returns (int24 arithmeticMeanTick, uint128 harmonicMeanLiquidity)
```

Calculates time-weighted means of tick and liquidity for a given Uniswap V3 pool

| Name | Type | Description |
| ---- | ---- | ----------- |
| pool | address | Address of the pool that we want to observe |
| secondsAgo | uint32 | Number of seconds in the past from which to calculate the time-weighted means |

| Name | Type | Description |
| ---- | ---- | ----------- |
| arithmeticMeanTick | int24 | The arithmetic mean tick from (block.timestamp - secondsAgo) to block.timestamp |
| harmonicMeanLiquidity | uint128 | The harmonic mean liquidity from (block.timestamp - secondsAgo) to block.timestamp |

### getQuoteAtTick

```solidity
function getQuoteAtTick(int24 tick, uint128 baseAmount, address baseToken, address quoteToken) internal pure returns (uint256 quoteAmount)
```

Given a tick and a token amount, calculates the amount of token received in exchange

| Name | Type | Description |
| ---- | ---- | ----------- |
| tick | int24 | Tick value used to calculate the quote |
| baseAmount | uint128 | Amount of token to be converted |
| baseToken | address | Address of an ERC20 token contract used as the baseAmount denomination |
| quoteToken | address | Address of an ERC20 token contract used as the quoteAmount denomination |

| Name | Type | Description |
| ---- | ---- | ----------- |
| quoteAmount | uint256 | Amount of quoteToken received for baseAmount of baseToken |

### getOldestObservationSecondsAgo

```solidity
function getOldestObservationSecondsAgo(address pool) internal view returns (uint32 secondsAgo)
```

Given a pool, it returns the number of seconds ago of the oldest stored observation

| Name | Type | Description |
| ---- | ---- | ----------- |
| pool | address | Address of Uniswap V3 pool that we want to observe |

| Name | Type | Description |
| ---- | ---- | ----------- |
| secondsAgo | uint32 | The number of seconds ago of the oldest observation stored for the pool |

### getBlockStartingTickAndLiquidity

```solidity
function getBlockStartingTickAndLiquidity(address pool) internal view returns (int24, uint128)
```

Given a pool, it returns the tick value as of the start of the current block

| Name | Type | Description |
| ---- | ---- | ----------- |
| pool | address | Address of Uniswap V3 pool |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | int24 | The tick that the pool was in at the start of the current block |
| [1] | uint128 |  |

### WeightedTickData

```solidity
struct WeightedTickData {
  int24 tick;
  uint128 weight;
}
```

### getWeightedArithmeticMeanTick

```solidity
function getWeightedArithmeticMeanTick(struct OracleLibrary.WeightedTickData[] weightedTickData) internal pure returns (int24 weightedArithmeticMeanTick)
```

Given an array of ticks and weights, calculates the weighted arithmetic mean tick

_Each entry of `weightedTickData` should represents ticks from pools with the same underlying pool tokens. If they do not,
extreme care must be taken to ensure that ticks are comparable (including decimal differences).
Note that the weighted arithmetic mean tick corresponds to the weighted geometric mean price._

| Name | Type | Description |
| ---- | ---- | ----------- |
| weightedTickData | struct OracleLibrary.WeightedTickData[] | An array of ticks and weights |

| Name | Type | Description |
| ---- | ---- | ----------- |
| weightedArithmeticMeanTick | int24 | The weighted arithmetic mean tick |

## ITuffOwnerV7

### requireOnlyOwner

```solidity
function requireOnlyOwner(address sender) external view
```

## UniswapPriceConsumer

### onlyOwner

```solidity
modifier onlyOwner()
```

### uniswapPriceConsumerInitLock

```solidity
modifier uniswapPriceConsumerInitLock()
```

### isUniswapPriceConsumerInit

```solidity
function isUniswapPriceConsumerInit() public view returns (bool)
```

### initUniswapPriceConsumer

```solidity
function initUniswapPriceConsumer(address _factoryAddr) public
```

### getUniswapQuote

```solidity
function getUniswapQuote(address _tokenA, address _tokenB, uint24 _fee, uint32 _period) external view returns (uint256 quoteAmount)
```

## UniswapPriceConsumerLib

### NAMESPACE

```solidity
string NAMESPACE
```

### POSITION

```solidity
bytes32 POSITION
```

### StateStorage

```solidity
struct StateStorage {
  bool isInit;
  address factoryAddr;
}
```

### getState

```solidity
function getState() internal pure returns (struct UniswapPriceConsumerLib.StateStorage stateStorage)
```

## KeeperCompatibleInterface

### checkUpkeep

```solidity
function checkUpkeep(bytes checkData) external returns (bool upkeepNeeded, bytes performData)
```

method that is simulated by the keepers to see if any work actually
needs to be performed. This method does does not actually need to be
executable, and since it is only ever simulated it can consume lots of gas.

_To ensure that it is never called, you may want to add the
cannotExecute modifier from KeeperBase to your implementation of this
method._

| Name | Type | Description |
| ---- | ---- | ----------- |
| checkData | bytes | specified in the upkeep registration so it is always the same for a registered upkeep. This can easily be broken down into specific arguments using `abi.decode`, so multiple upkeeps can be registered on the same contract and easily differentiated by the contract. |

| Name | Type | Description |
| ---- | ---- | ----------- |
| upkeepNeeded | bool | boolean to indicate whether the keeper should call performUpkeep or not. |
| performData | bytes | bytes that the keeper should call performUpkeep with, if upkeep is needed. If you would like to encode data to decode later, try `abi.encode`. |

### performUpkeep

```solidity
function performUpkeep(bytes performData) external
```

method that is actually executed by the keepers, via the registry.
The data returned by the checkUpkeep simulation will be passed into
this method to actually be executed.

_The input to this method should not be trusted, and the caller of the
method should not even be restricted to any single registry. Anyone should
be able call it, and the input should be validated, there is no guarantee
that the data passed in is the performData returned from checkUpkeep. This
could happen due to malicious keepers, racing keepers, or simply a state
change while the performUpkeep transaction is waiting for confirmation.
Always validate the data passed in._

| Name | Type | Description |
| ---- | ---- | ----------- |
| performData | bytes | is the data which was passed back from the checkData simulation. If it is encoded, it can easily be decoded into other types by calling `abi.decode`. This data should not be trusted, and should be validated against the contract's current state. |

## AccessControl

_Contract module that allows children to implement role-based access
control mechanisms. This is a lightweight version that doesn't allow enumerating role
members except through off-chain means by accessing the contract event logs. Some
applications may benefit from on-chain enumerability, for those cases see
{AccessControlEnumerable}.

Roles are referred to by their `bytes32` identifier. These should be exposed
in the external API and be unique. The best way to achieve this is by
using `public constant` hash digests:

```
bytes32 public constant MY_ROLE = keccak256("MY_ROLE");
```

Roles can be used to represent a set of permissions. To restrict access to a
function call, use {hasRole}:

```
function foo() public {
    require(hasRole(MY_ROLE, msg.sender));
    ...
}
```

Roles can be granted and revoked dynamically via the {grantRole} and
{revokeRole} functions. Each role has an associated admin role, and only
accounts that have a role's admin role can call {grantRole} and {revokeRole}.

By default, the admin role for all roles is `DEFAULT_ADMIN_ROLE`, which means
that only accounts with this role will be able to grant or revoke other
roles. More complex role relationships can be created by using
{_setRoleAdmin}.

WARNING: The `DEFAULT_ADMIN_ROLE` is also its own admin: it has permission to
grant and revoke this role. Extra precautions should be taken to secure
accounts that have been granted it._

### RoleData

```solidity
struct RoleData {
  mapping(address &#x3D;&gt; bool) members;
  bytes32 adminRole;
}
```

### _roles

```solidity
mapping(bytes32 => struct AccessControl.RoleData) _roles
```

### DEFAULT_ADMIN_ROLE

```solidity
bytes32 DEFAULT_ADMIN_ROLE
```

### onlyRole

```solidity
modifier onlyRole(bytes32 role)
```

_Modifier that checks that an account has a specific role. Reverts
with a standardized message including the required role.

The format of the revert reason is given by the following regular expression:

 /^AccessControl: account (0x[0-9a-f]{40}) is missing role (0x[0-9a-f]{64})$/

_Available since v4.1.__

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view virtual returns (bool)
```

_See {IERC165-supportsInterface}._

### hasRole

```solidity
function hasRole(bytes32 role, address account) public view virtual returns (bool)
```

_Returns `true` if `account` has been granted `role`._

### _checkRole

```solidity
function _checkRole(bytes32 role, address account) internal view virtual
```

_Revert with a standard message if `account` is missing `role`.

The format of the revert reason is given by the following regular expression:

 /^AccessControl: account (0x[0-9a-f]{40}) is missing role (0x[0-9a-f]{64})$/_

### getRoleAdmin

```solidity
function getRoleAdmin(bytes32 role) public view virtual returns (bytes32)
```

_Returns the admin role that controls `role`. See {grantRole} and
{revokeRole}.

To change a role's admin, use {_setRoleAdmin}._

### grantRole

```solidity
function grantRole(bytes32 role, address account) public virtual
```

_Grants `role` to `account`.

If `account` had not been already granted `role`, emits a {RoleGranted}
event.

Requirements:

- the caller must have ``role``'s admin role._

### revokeRole

```solidity
function revokeRole(bytes32 role, address account) public virtual
```

_Revokes `role` from `account`.

If `account` had been granted `role`, emits a {RoleRevoked} event.

Requirements:

- the caller must have ``role``'s admin role._

### renounceRole

```solidity
function renounceRole(bytes32 role, address account) public virtual
```

_Revokes `role` from the calling account.

Roles are often managed via {grantRole} and {revokeRole}: this function's
purpose is to provide a mechanism for accounts to lose their privileges
if they are compromised (such as when a trusted device is misplaced).

If the calling account had been revoked `role`, emits a {RoleRevoked}
event.

Requirements:

- the caller must be `account`._

### _setupRole

```solidity
function _setupRole(bytes32 role, address account) internal virtual
```

_Grants `role` to `account`.

If `account` had not been already granted `role`, emits a {RoleGranted}
event. Note that unlike {grantRole}, this function doesn't perform any
checks on the calling account.

[WARNING]
====
This function should only be called from the constructor when setting
up the initial roles for the system.

Using this function in any other way is effectively circumventing the admin
system imposed by {AccessControl}.
====

NOTE: This function is deprecated in favor of {_grantRole}._

### _setRoleAdmin

```solidity
function _setRoleAdmin(bytes32 role, bytes32 adminRole) internal virtual
```

_Sets `adminRole` as ``role``'s admin role.

Emits a {RoleAdminChanged} event._

### _grantRole

```solidity
function _grantRole(bytes32 role, address account) internal virtual
```

_Grants `role` to `account`.

Internal function without access restriction._

### _revokeRole

```solidity
function _revokeRole(bytes32 role, address account) internal virtual
```

_Revokes `role` from `account`.

Internal function without access restriction._

## IAccessControl

_External interface of AccessControl declared to support ERC165 detection._

### RoleAdminChanged

```solidity
event RoleAdminChanged(bytes32 role, bytes32 previousAdminRole, bytes32 newAdminRole)
```

_Emitted when `newAdminRole` is set as ``role``'s admin role, replacing `previousAdminRole`

`DEFAULT_ADMIN_ROLE` is the starting admin for all roles, despite
{RoleAdminChanged} not being emitted signaling this.

_Available since v3.1.__

### RoleGranted

```solidity
event RoleGranted(bytes32 role, address account, address sender)
```

_Emitted when `account` is granted `role`.

`sender` is the account that originated the contract call, an admin role
bearer except when using {AccessControl-_setupRole}._

### RoleRevoked

```solidity
event RoleRevoked(bytes32 role, address account, address sender)
```

_Emitted when `account` is revoked `role`.

`sender` is the account that originated the contract call:
  - if using `revokeRole`, it is the admin role bearer
  - if using `renounceRole`, it is the role bearer (i.e. `account`)_

### hasRole

```solidity
function hasRole(bytes32 role, address account) external view returns (bool)
```

_Returns `true` if `account` has been granted `role`._

### getRoleAdmin

```solidity
function getRoleAdmin(bytes32 role) external view returns (bytes32)
```

_Returns the admin role that controls `role`. See {grantRole} and
{revokeRole}.

To change a role's admin, use {AccessControl-_setRoleAdmin}._

### grantRole

```solidity
function grantRole(bytes32 role, address account) external
```

_Grants `role` to `account`.

If `account` had not been already granted `role`, emits a {RoleGranted}
event.

Requirements:

- the caller must have ``role``'s admin role._

### revokeRole

```solidity
function revokeRole(bytes32 role, address account) external
```

_Revokes `role` from `account`.

If `account` had been granted `role`, emits a {RoleRevoked} event.

Requirements:

- the caller must have ``role``'s admin role._

### renounceRole

```solidity
function renounceRole(bytes32 role, address account) external
```

_Revokes `role` from the calling account.

Roles are often managed via {grantRole} and {revokeRole}: this function's
purpose is to provide a mechanism for accounts to lose their privileges
if they are compromised (such as when a trusted device is misplaced).

If the calling account had been granted `role`, emits a {RoleRevoked}
event.

Requirements:

- the caller must be `account`._

## Ownable

_Contract module which provides a basic access control mechanism, where
there is an account (an owner) that can be granted exclusive access to
specific functions.

By default, the owner account will be the one that deploys the contract. This
can later be changed with {transferOwnership}.

This module is used through inheritance. It will make available the modifier
`onlyOwner`, which can be applied to your functions to restrict their use to
the owner._

### _owner

```solidity
address _owner
```

### OwnershipTransferred

```solidity
event OwnershipTransferred(address previousOwner, address newOwner)
```

### constructor

```solidity
constructor() internal
```

_Initializes the contract setting the deployer as the initial owner._

### owner

```solidity
function owner() public view virtual returns (address)
```

_Returns the address of the current owner._

### onlyOwner

```solidity
modifier onlyOwner()
```

_Throws if called by any account other than the owner._

### renounceOwnership

```solidity
function renounceOwnership() public virtual
```

_Leaves the contract without owner. It will not be possible to call
`onlyOwner` functions anymore. Can only be called by the current owner.

NOTE: Renouncing ownership will leave the contract without an owner,
thereby removing any functionality that is only available to the owner._

### transferOwnership

```solidity
function transferOwnership(address newOwner) public virtual
```

_Transfers ownership of the contract to a new account (`newOwner`).
Can only be called by the current owner._

### _transferOwnership

```solidity
function _transferOwnership(address newOwner) internal virtual
```

_Transfers ownership of the contract to a new account (`newOwner`).
Internal function without access restriction._

## Governor

_Core of the governance system, designed to be extended though various modules.

This contract is abstract and requires several function to be implemented in various modules:

- A counting module must implement {quorum}, {_quorumReached}, {_voteSucceeded} and {_countVote}
- A voting module must implement {getVotes}
- Additionanly, the {votingPeriod} must also be implemented

_Available since v4.3.__

### BALLOT_TYPEHASH

```solidity
bytes32 BALLOT_TYPEHASH
```

### ProposalCore

```solidity
struct ProposalCore {
  struct Timers.BlockNumber voteStart;
  struct Timers.BlockNumber voteEnd;
  bool executed;
  bool canceled;
}
```

### _name

```solidity
string _name
```

### _proposals

```solidity
mapping(uint256 => struct Governor.ProposalCore) _proposals
```

### onlyGovernance

```solidity
modifier onlyGovernance()
```

_Restrict access of functions to the governance executor, which may be the Governor itself or a timelock
contract, as specified by {_executor}. This generally means that function with this modifier must be voted on and
executed through the governance protocol._

### constructor

```solidity
constructor(string name_) internal
```

_Sets the value for {name} and {version}_

### receive

```solidity
receive() external payable virtual
```

_Function to receive ETH that will be handled by the governor (disabled if executor is a third party contract)_

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view virtual returns (bool)
```

_See {IERC165-supportsInterface}._

### name

```solidity
function name() public view virtual returns (string)
```

_See {IGovernor-name}._

### version

```solidity
function version() public view virtual returns (string)
```

_See {IGovernor-version}._

### hashProposal

```solidity
function hashProposal(address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash) public pure virtual returns (uint256)
```

_See {IGovernor-hashProposal}.

The proposal id is produced by hashing the RLC encoded `targets` array, the `values` array, the `calldatas` array
and the descriptionHash (bytes32 which itself is the keccak256 hash of the description string). This proposal id
can be produced from the proposal data which is part of the {ProposalCreated} event. It can even be computed in
advance, before the proposal is submitted.

Note that the chainId and the governor address are not part of the proposal id computation. Consequently, the
same proposal (with same operation and same description) will have the same id if submitted on multiple governors
accross multiple networks. This also means that in order to execute the same operation twice (on the same
governor) the proposer will have to change the description in order to avoid proposal id conflicts._

### state

```solidity
function state(uint256 proposalId) public view virtual returns (enum IGovernor.ProposalState)
```

_See {IGovernor-state}._

### proposalSnapshot

```solidity
function proposalSnapshot(uint256 proposalId) public view virtual returns (uint256)
```

_See {IGovernor-proposalSnapshot}._

### proposalDeadline

```solidity
function proposalDeadline(uint256 proposalId) public view virtual returns (uint256)
```

_See {IGovernor-proposalDeadline}._

### proposalThreshold

```solidity
function proposalThreshold() public view virtual returns (uint256)
```

_Part of the Governor Bravo's interface: _"The number of votes required in order for a voter to become a proposer"_._

### _quorumReached

```solidity
function _quorumReached(uint256 proposalId) internal view virtual returns (bool)
```

_Amount of votes already cast passes the threshold limit._

### _voteSucceeded

```solidity
function _voteSucceeded(uint256 proposalId) internal view virtual returns (bool)
```

_Is the proposal successful or not._

### _countVote

```solidity
function _countVote(uint256 proposalId, address account, uint8 support, uint256 weight) internal virtual
```

_Register a vote with a given support and voting weight.

Note: Support is generic and can represent various things depending on the voting system used._

### propose

```solidity
function propose(address[] targets, uint256[] values, bytes[] calldatas, string description) public virtual returns (uint256)
```

_See {IGovernor-propose}._

### execute

```solidity
function execute(address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash) public payable virtual returns (uint256)
```

_See {IGovernor-execute}._

### _execute

```solidity
function _execute(uint256, address[] targets, uint256[] values, bytes[] calldatas, bytes32) internal virtual
```

_Internal execution mechanism. Can be overriden to implement different execution mechanism_

### _cancel

```solidity
function _cancel(address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash) internal virtual returns (uint256)
```

_Internal cancel mechanism: locks up the proposal timer, preventing it from being re-submitted. Marks it as
canceled to allow distinguishing it from executed proposals.

Emits a {IGovernor-ProposalCanceled} event._

### castVote

```solidity
function castVote(uint256 proposalId, uint8 support) public virtual returns (uint256)
```

_See {IGovernor-castVote}._

### castVoteWithReason

```solidity
function castVoteWithReason(uint256 proposalId, uint8 support, string reason) public virtual returns (uint256)
```

_See {IGovernor-castVoteWithReason}._

### castVoteBySig

```solidity
function castVoteBySig(uint256 proposalId, uint8 support, uint8 v, bytes32 r, bytes32 s) public virtual returns (uint256)
```

_See {IGovernor-castVoteBySig}._

### _castVote

```solidity
function _castVote(uint256 proposalId, address account, uint8 support, string reason) internal virtual returns (uint256)
```

_Internal vote casting mechanism: Check that the vote is pending, that it has not been cast yet, retrieve
voting weight using {IGovernor-getVotes} and call the {_countVote} internal function.

Emits a {IGovernor-VoteCast} event._

### relay

```solidity
function relay(address target, uint256 value, bytes data) external virtual
```

_Relays a transaction or function call to an arbitrary target. In cases where the governance executor
is some contract other than the governor itself, like when using a timelock, this function can be invoked
in a governance proposal to recover tokens or Ether that was sent to the governor contract by mistake.
Note that if the executor is simply the governor itself, use of `relay` is redundant._

### _executor

```solidity
function _executor() internal view virtual returns (address)
```

_Address through which the governor executes action. Will be overloaded by module that execute actions
through another contract such as a timelock._

## IGovernor

_Interface of the {Governor} core.

_Available since v4.3.__

### ProposalState

```solidity
enum ProposalState {
  Pending,
  Active,
  Canceled,
  Defeated,
  Succeeded,
  Queued,
  Expired,
  Executed
}
```

### ProposalCreated

```solidity
event ProposalCreated(uint256 proposalId, address proposer, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, uint256 startBlock, uint256 endBlock, string description)
```

_Emitted when a proposal is created._

### ProposalCanceled

```solidity
event ProposalCanceled(uint256 proposalId)
```

_Emitted when a proposal is canceled._

### ProposalExecuted

```solidity
event ProposalExecuted(uint256 proposalId)
```

_Emitted when a proposal is executed._

### VoteCast

```solidity
event VoteCast(address voter, uint256 proposalId, uint8 support, uint256 weight, string reason)
```

_Emitted when a vote is cast.

Note: `support` values should be seen as buckets. There interpretation depends on the voting module used._

### name

```solidity
function name() public view virtual returns (string)
```

module:core

_Name of the governor instance (used in building the ERC712 domain separator)._

### version

```solidity
function version() public view virtual returns (string)
```

module:core

_Version of the governor instance (used in building the ERC712 domain separator). Default: "1"_

### COUNTING_MODE

```solidity
function COUNTING_MODE() public pure virtual returns (string)
```

module:voting

_A description of the possible `support` values for {castVote} and the way these votes are counted, meant to
be consumed by UIs to show correct vote options and interpret the results. The string is a URL-encoded sequence of
key-value pairs that each describe one aspect, for example `support=bravo&quorum=for,abstain`.

There are 2 standard keys: `support` and `quorum`.

- `support=bravo` refers to the vote options 0 = Against, 1 = For, 2 = Abstain, as in `GovernorBravo`.
- `quorum=bravo` means that only For votes are counted towards quorum.
- `quorum=for,abstain` means that both For and Abstain votes are counted towards quorum.

NOTE: The string can be decoded by the standard
https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams[`URLSearchParams`]
JavaScript class._

### hashProposal

```solidity
function hashProposal(address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash) public pure virtual returns (uint256)
```

module:core

_Hashing function used to (re)build the proposal id from the proposal details.._

### state

```solidity
function state(uint256 proposalId) public view virtual returns (enum IGovernor.ProposalState)
```

module:core

_Current state of a proposal, following Compound's convention_

### proposalSnapshot

```solidity
function proposalSnapshot(uint256 proposalId) public view virtual returns (uint256)
```

module:core

_Block number used to retrieve user's votes and quorum. As per Compound's Comp and OpenZeppelin's
ERC20Votes, the snapshot is performed at the end of this block. Hence, voting for this proposal starts at the
beginning of the following block._

### proposalDeadline

```solidity
function proposalDeadline(uint256 proposalId) public view virtual returns (uint256)
```

module:core

_Block number at which votes close. Votes close at the end of this block, so it is possible to cast a vote
during this block._

### votingDelay

```solidity
function votingDelay() public view virtual returns (uint256)
```

module:user-config

_Delay, in number of block, between the proposal is created and the vote starts. This can be increassed to
leave time for users to buy voting power, of delegate it, before the voting of a proposal starts._

### votingPeriod

```solidity
function votingPeriod() public view virtual returns (uint256)
```

module:user-config

_Delay, in number of blocks, between the vote start and vote ends.

NOTE: The {votingDelay} can delay the start of the vote. This must be considered when setting the voting
duration compared to the voting delay._

### quorum

```solidity
function quorum(uint256 blockNumber) public view virtual returns (uint256)
```

module:user-config

_Minimum number of cast voted required for a proposal to be successful.

Note: The `blockNumber` parameter corresponds to the snaphot used for counting vote. This allows to scale the
quroum depending on values such as the totalSupply of a token at this block (see {ERC20Votes})._

### getVotes

```solidity
function getVotes(address account, uint256 blockNumber) public view virtual returns (uint256)
```

module:reputation

_Voting power of an `account` at a specific `blockNumber`.

Note: this can be implemented in a number of ways, for example by reading the delegated balance from one (or
multiple), {ERC20Votes} tokens._

### hasVoted

```solidity
function hasVoted(uint256 proposalId, address account) public view virtual returns (bool)
```

module:voting

_Returns weither `account` has cast a vote on `proposalId`._

### propose

```solidity
function propose(address[] targets, uint256[] values, bytes[] calldatas, string description) public virtual returns (uint256 proposalId)
```

_Create a new proposal. Vote start {IGovernor-votingDelay} blocks after the proposal is created and ends
{IGovernor-votingPeriod} blocks after the voting starts.

Emits a {ProposalCreated} event._

### execute

```solidity
function execute(address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash) public payable virtual returns (uint256 proposalId)
```

_Execute a successful proposal. This requires the quorum to be reached, the vote to be successful, and the
deadline to be reached.

Emits a {ProposalExecuted} event.

Note: some module can modify the requirements for execution, for example by adding an additional timelock._

### castVote

```solidity
function castVote(uint256 proposalId, uint8 support) public virtual returns (uint256 balance)
```

_Cast a vote

Emits a {VoteCast} event._

### castVoteWithReason

```solidity
function castVoteWithReason(uint256 proposalId, uint8 support, string reason) public virtual returns (uint256 balance)
```

_Cast a vote with a reason

Emits a {VoteCast} event._

### castVoteBySig

```solidity
function castVoteBySig(uint256 proposalId, uint8 support, uint8 v, bytes32 r, bytes32 s) public virtual returns (uint256 balance)
```

_Cast a vote using the user cryptographic signature.

Emits a {VoteCast} event._

## TimelockController

_Contract module which acts as a timelocked controller. When set as the
owner of an `Ownable` smart contract, it enforces a timelock on all
`onlyOwner` maintenance operations. This gives time for users of the
controlled contract to exit before a potentially dangerous maintenance
operation is applied.

By default, this contract is self administered, meaning administration tasks
have to go through the timelock process. The proposer (resp executor) role
is in charge of proposing (resp executing) operations. A common use case is
to position this {TimelockController} as the owner of a smart contract, with
a multisig or a DAO as the sole proposer.

_Available since v3.3.__

### TIMELOCK_ADMIN_ROLE

```solidity
bytes32 TIMELOCK_ADMIN_ROLE
```

### PROPOSER_ROLE

```solidity
bytes32 PROPOSER_ROLE
```

### EXECUTOR_ROLE

```solidity
bytes32 EXECUTOR_ROLE
```

### _DONE_TIMESTAMP

```solidity
uint256 _DONE_TIMESTAMP
```

### _timestamps

```solidity
mapping(bytes32 => uint256) _timestamps
```

### _minDelay

```solidity
uint256 _minDelay
```

### CallScheduled

```solidity
event CallScheduled(bytes32 id, uint256 index, address target, uint256 value, bytes data, bytes32 predecessor, uint256 delay)
```

_Emitted when a call is scheduled as part of operation `id`._

### CallExecuted

```solidity
event CallExecuted(bytes32 id, uint256 index, address target, uint256 value, bytes data)
```

_Emitted when a call is performed as part of operation `id`._

### Cancelled

```solidity
event Cancelled(bytes32 id)
```

_Emitted when operation `id` is cancelled._

### MinDelayChange

```solidity
event MinDelayChange(uint256 oldDuration, uint256 newDuration)
```

_Emitted when the minimum delay for future operations is modified._

### constructor

```solidity
constructor(uint256 minDelay, address[] proposers, address[] executors) public
```

_Initializes the contract with a given `minDelay`._

### onlyRoleOrOpenRole

```solidity
modifier onlyRoleOrOpenRole(bytes32 role)
```

_Modifier to make a function callable only by a certain role. In
addition to checking the sender's role, `address(0)` 's role is also
considered. Granting a role to `address(0)` is equivalent to enabling
this role for everyone._

### receive

```solidity
receive() external payable
```

_Contract might receive/hold ETH as part of the maintenance process._

### isOperation

```solidity
function isOperation(bytes32 id) public view virtual returns (bool pending)
```

_Returns whether an id correspond to a registered operation. This
includes both Pending, Ready and Done operations._

### isOperationPending

```solidity
function isOperationPending(bytes32 id) public view virtual returns (bool pending)
```

_Returns whether an operation is pending or not._

### isOperationReady

```solidity
function isOperationReady(bytes32 id) public view virtual returns (bool ready)
```

_Returns whether an operation is ready or not._

### isOperationDone

```solidity
function isOperationDone(bytes32 id) public view virtual returns (bool done)
```

_Returns whether an operation is done or not._

### getTimestamp

```solidity
function getTimestamp(bytes32 id) public view virtual returns (uint256 timestamp)
```

_Returns the timestamp at with an operation becomes ready (0 for
unset operations, 1 for done operations)._

### getMinDelay

```solidity
function getMinDelay() public view virtual returns (uint256 duration)
```

_Returns the minimum delay for an operation to become valid.

This value can be changed by executing an operation that calls `updateDelay`._

### hashOperation

```solidity
function hashOperation(address target, uint256 value, bytes data, bytes32 predecessor, bytes32 salt) public pure virtual returns (bytes32 hash)
```

_Returns the identifier of an operation containing a single
transaction._

### hashOperationBatch

```solidity
function hashOperationBatch(address[] targets, uint256[] values, bytes[] datas, bytes32 predecessor, bytes32 salt) public pure virtual returns (bytes32 hash)
```

_Returns the identifier of an operation containing a batch of
transactions._

### schedule

```solidity
function schedule(address target, uint256 value, bytes data, bytes32 predecessor, bytes32 salt, uint256 delay) public virtual
```

_Schedule an operation containing a single transaction.

Emits a {CallScheduled} event.

Requirements:

- the caller must have the 'proposer' role._

### scheduleBatch

```solidity
function scheduleBatch(address[] targets, uint256[] values, bytes[] datas, bytes32 predecessor, bytes32 salt, uint256 delay) public virtual
```

_Schedule an operation containing a batch of transactions.

Emits one {CallScheduled} event per transaction in the batch.

Requirements:

- the caller must have the 'proposer' role._

### _schedule

```solidity
function _schedule(bytes32 id, uint256 delay) private
```

_Schedule an operation that is to becomes valid after a given delay._

### cancel

```solidity
function cancel(bytes32 id) public virtual
```

_Cancel an operation.

Requirements:

- the caller must have the 'proposer' role._

### execute

```solidity
function execute(address target, uint256 value, bytes data, bytes32 predecessor, bytes32 salt) public payable virtual
```

_Execute an (ready) operation containing a single transaction.

Emits a {CallExecuted} event.

Requirements:

- the caller must have the 'executor' role._

### executeBatch

```solidity
function executeBatch(address[] targets, uint256[] values, bytes[] datas, bytes32 predecessor, bytes32 salt) public payable virtual
```

_Execute an (ready) operation containing a batch of transactions.

Emits one {CallExecuted} event per transaction in the batch.

Requirements:

- the caller must have the 'executor' role._

### _beforeCall

```solidity
function _beforeCall(bytes32 id, bytes32 predecessor) private view
```

_Checks before execution of an operation's calls._

### _afterCall

```solidity
function _afterCall(bytes32 id) private
```

_Checks after execution of an operation's calls._

### _call

```solidity
function _call(bytes32 id, uint256 index, address target, uint256 value, bytes data) private
```

_Execute an operation's call.

Emits a {CallExecuted} event._

### updateDelay

```solidity
function updateDelay(uint256 newDelay) external virtual
```

_Changes the minimum timelock duration for future operations.

Emits a {MinDelayChange} event.

Requirements:

- the caller must be the timelock itself. This can only be achieved by scheduling and later executing
an operation where the timelock is the target and the data is the ABI-encoded call to this function._

## GovernorCompatibilityBravo

_Compatibility layer that implements GovernorBravo compatibility on to of {Governor}.

This compatibility layer includes a voting system and requires a {IGovernorTimelock} compatible module to be added
through inheritance. It does not include token bindings, not does it include any variable upgrade patterns.

NOTE: When using this module, you may need to enable the Solidity optimizer to avoid hitting the contract size limit.

_Available since v4.3.__

### VoteType

```solidity
enum VoteType {
  Against,
  For,
  Abstain
}
```

### ProposalDetails

```solidity
struct ProposalDetails {
  address proposer;
  address[] targets;
  uint256[] values;
  string[] signatures;
  bytes[] calldatas;
  uint256 forVotes;
  uint256 againstVotes;
  uint256 abstainVotes;
  mapping(address &#x3D;&gt; struct IGovernorCompatibilityBravo.Receipt) receipts;
  bytes32 descriptionHash;
}
```

### _proposalDetails

```solidity
mapping(uint256 => struct GovernorCompatibilityBravo.ProposalDetails) _proposalDetails
```

### COUNTING_MODE

```solidity
function COUNTING_MODE() public pure virtual returns (string)
```

module:voting

_A description of the possible `support` values for {castVote} and the way these votes are counted, meant to
be consumed by UIs to show correct vote options and interpret the results. The string is a URL-encoded sequence of
key-value pairs that each describe one aspect, for example `support=bravo&quorum=for,abstain`.

There are 2 standard keys: `support` and `quorum`.

- `support=bravo` refers to the vote options 0 = Against, 1 = For, 2 = Abstain, as in `GovernorBravo`.
- `quorum=bravo` means that only For votes are counted towards quorum.
- `quorum=for,abstain` means that both For and Abstain votes are counted towards quorum.

NOTE: The string can be decoded by the standard
https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams[`URLSearchParams`]
JavaScript class._

### propose

```solidity
function propose(address[] targets, uint256[] values, bytes[] calldatas, string description) public virtual returns (uint256)
```

_See {IGovernor-propose}._

### propose

```solidity
function propose(address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, string description) public virtual returns (uint256)
```

_See {IGovernorCompatibilityBravo-propose}._

### queue

```solidity
function queue(uint256 proposalId) public virtual
```

_See {IGovernorCompatibilityBravo-queue}._

### execute

```solidity
function execute(uint256 proposalId) public payable virtual
```

_See {IGovernorCompatibilityBravo-execute}._

### cancel

```solidity
function cancel(uint256 proposalId) public virtual
```

_Cancels a proposal only if sender is the proposer, or proposer delegates dropped below proposal threshold._

### _encodeCalldata

```solidity
function _encodeCalldata(string[] signatures, bytes[] calldatas) private pure returns (bytes[])
```

_Encodes calldatas with optional function signature._

### _storeProposal

```solidity
function _storeProposal(address proposer, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, string description) private
```

_Store proposal metadata for later lookup_

### proposals

```solidity
function proposals(uint256 proposalId) public view virtual returns (uint256 id, address proposer, uint256 eta, uint256 startBlock, uint256 endBlock, uint256 forVotes, uint256 againstVotes, uint256 abstainVotes, bool canceled, bool executed)
```

_See {IGovernorCompatibilityBravo-proposals}._

### getActions

```solidity
function getActions(uint256 proposalId) public view virtual returns (address[] targets, uint256[] values, string[] signatures, bytes[] calldatas)
```

_See {IGovernorCompatibilityBravo-getActions}._

### getReceipt

```solidity
function getReceipt(uint256 proposalId, address voter) public view virtual returns (struct IGovernorCompatibilityBravo.Receipt)
```

_See {IGovernorCompatibilityBravo-getReceipt}._

### quorumVotes

```solidity
function quorumVotes() public view virtual returns (uint256)
```

_See {IGovernorCompatibilityBravo-quorumVotes}._

### hasVoted

```solidity
function hasVoted(uint256 proposalId, address account) public view virtual returns (bool)
```

_See {IGovernor-hasVoted}._

### _quorumReached

```solidity
function _quorumReached(uint256 proposalId) internal view virtual returns (bool)
```

_See {Governor-_quorumReached}. In this module, only forVotes count toward the quorum._

### _voteSucceeded

```solidity
function _voteSucceeded(uint256 proposalId) internal view virtual returns (bool)
```

_See {Governor-_voteSucceeded}. In this module, the forVotes must be scritly over the againstVotes._

### _countVote

```solidity
function _countVote(uint256 proposalId, address account, uint8 support, uint256 weight) internal virtual
```

_See {Governor-_countVote}. In this module, the support follows Governor Bravo._

## IGovernorCompatibilityBravo

_Interface extension that adds missing functions to the {Governor} core to provide `GovernorBravo` compatibility.

_Available since v4.3.__

### Proposal

```solidity
struct Proposal {
  uint256 id;
  address proposer;
  uint256 eta;
  address[] targets;
  uint256[] values;
  string[] signatures;
  bytes[] calldatas;
  uint256 startBlock;
  uint256 endBlock;
  uint256 forVotes;
  uint256 againstVotes;
  uint256 abstainVotes;
  bool canceled;
  bool executed;
  mapping(address &#x3D;&gt; struct IGovernorCompatibilityBravo.Receipt) receipts;
}
```

### Receipt

```solidity
struct Receipt {
  bool hasVoted;
  uint8 support;
  uint96 votes;
}
```

### quorumVotes

```solidity
function quorumVotes() public view virtual returns (uint256)
```

_Part of the Governor Bravo's interface._

### proposals

```solidity
function proposals(uint256) public view virtual returns (uint256 id, address proposer, uint256 eta, uint256 startBlock, uint256 endBlock, uint256 forVotes, uint256 againstVotes, uint256 abstainVotes, bool canceled, bool executed)
```

_Part of the Governor Bravo's interface: _"The official record of all proposals ever proposed"_._

### propose

```solidity
function propose(address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, string description) public virtual returns (uint256)
```

_Part of the Governor Bravo's interface: _"Function used to propose a new proposal"_._

### queue

```solidity
function queue(uint256 proposalId) public virtual
```

_Part of the Governor Bravo's interface: _"Queues a proposal of state succeeded"_._

### execute

```solidity
function execute(uint256 proposalId) public payable virtual
```

_Part of the Governor Bravo's interface: _"Executes a queued proposal if eta has passed"_._

### cancel

```solidity
function cancel(uint256 proposalId) public virtual
```

_Cancels a proposal only if sender is the proposer, or proposer delegates dropped below proposal threshold._

### getActions

```solidity
function getActions(uint256 proposalId) public view virtual returns (address[] targets, uint256[] values, string[] signatures, bytes[] calldatas)
```

_Part of the Governor Bravo's interface: _"Gets actions of a proposal"_._

### getReceipt

```solidity
function getReceipt(uint256 proposalId, address voter) public view virtual returns (struct IGovernorCompatibilityBravo.Receipt)
```

_Part of the Governor Bravo's interface: _"Gets the receipt for a voter on a given proposal"_._

## GovernorTimelockControl

_Extension of {Governor} that binds the execution process to an instance of {TimelockController}. This adds a
delay, enforced by the {TimelockController} to all successful proposal (in addition to the voting duration). The
{Governor} needs the proposer (and ideally the executor) roles for the {Governor} to work properly.

Using this model means the proposal will be operated by the {TimelockController} and not by the {Governor}. Thus,
the assets and permissions must be attached to the {TimelockController}. Any asset sent to the {Governor} will be
inaccessible.

WARNING: Setting up the TimelockController to have additional proposers besides the governor is very risky, as it
grants them powers that they must be trusted or known not to use: 1) {onlyGovernance} functions like {relay} are
available to them through the timelock, and 2) approved governance proposals can be blocked by them, effectively
executing a Denial of Service attack. This risk will be mitigated in a future release.

_Available since v4.3.__

### _timelock

```solidity
contract TimelockController _timelock
```

### _timelockIds

```solidity
mapping(uint256 => bytes32) _timelockIds
```

### TimelockChange

```solidity
event TimelockChange(address oldTimelock, address newTimelock)
```

_Emitted when the timelock controller used for proposal execution is modified._

### constructor

```solidity
constructor(contract TimelockController timelockAddress) internal
```

_Set the timelock._

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view virtual returns (bool)
```

_See {IERC165-supportsInterface}._

### state

```solidity
function state(uint256 proposalId) public view virtual returns (enum IGovernor.ProposalState)
```

_Overriden version of the {Governor-state} function with added support for the `Queued` status._

### timelock

```solidity
function timelock() public view virtual returns (address)
```

_Public accessor to check the address of the timelock_

### proposalEta

```solidity
function proposalEta(uint256 proposalId) public view virtual returns (uint256)
```

_Public accessor to check the eta of a queued proposal_

### queue

```solidity
function queue(address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash) public virtual returns (uint256)
```

_Function to queue a proposal to the timelock._

### _execute

```solidity
function _execute(uint256, address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash) internal virtual
```

_Overriden execute function that run the already queued proposal through the timelock._

### _cancel

```solidity
function _cancel(address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash) internal virtual returns (uint256)
```

_Overriden version of the {Governor-_cancel} function to cancel the timelocked proposal if it as already
been queued._

### _executor

```solidity
function _executor() internal view virtual returns (address)
```

_Address through which the governor executes action. In this case, the timelock._

### updateTimelock

```solidity
function updateTimelock(contract TimelockController newTimelock) external virtual
```

_Public endpoint to update the underlying timelock instance. Restricted to the timelock itself, so updates
must be proposed, scheduled, and executed through governance proposals.

CAUTION: It is not recommended to change the timelock while there are other queued governance proposals._

### _updateTimelock

```solidity
function _updateTimelock(contract TimelockController newTimelock) private
```

## GovernorVotes

_Extension of {Governor} for voting weight extraction from an {ERC20Votes} token, or since v4.5 an {ERC721Votes} token.

_Available since v4.3.__

### token

```solidity
contract IVotes token
```

### constructor

```solidity
constructor(contract IVotes tokenAddress) internal
```

### getVotes

```solidity
function getVotes(address account, uint256 blockNumber) public view virtual returns (uint256)
```

Read the voting weight from the token's built in snapshot mechanism (see {IGovernor-getVotes}).

## GovernorVotesQuorumFraction

_Extension of {Governor} for voting weight extraction from an {ERC20Votes} token and a quorum expressed as a
fraction of the total supply.

_Available since v4.3.__

### _quorumNumerator

```solidity
uint256 _quorumNumerator
```

### QuorumNumeratorUpdated

```solidity
event QuorumNumeratorUpdated(uint256 oldQuorumNumerator, uint256 newQuorumNumerator)
```

### constructor

```solidity
constructor(uint256 quorumNumeratorValue) internal
```

_Initialize quorum as a fraction of the token's total supply.

The fraction is specified as `numerator / denominator`. By default the denominator is 100, so quorum is
specified as a percent: a numerator of 10 corresponds to quorum being 10% of total supply. The denominator can be
customized by overriding {quorumDenominator}._

### quorumNumerator

```solidity
function quorumNumerator() public view virtual returns (uint256)
```

_Returns the current quorum numerator. See {quorumDenominator}._

### quorumDenominator

```solidity
function quorumDenominator() public view virtual returns (uint256)
```

_Returns the quorum denominator. Defaults to 100, but may be overridden._

### quorum

```solidity
function quorum(uint256 blockNumber) public view virtual returns (uint256)
```

_Returns the quorum for a block number, in terms of number of votes: `supply * numerator / denominator`._

### updateQuorumNumerator

```solidity
function updateQuorumNumerator(uint256 newQuorumNumerator) external virtual
```

_Changes the quorum numerator.

Emits a {QuorumNumeratorUpdated} event.

Requirements:

- Must be called through a governance proposal.
- New numerator must be smaller or equal to the denominator._

### _updateQuorumNumerator

```solidity
function _updateQuorumNumerator(uint256 newQuorumNumerator) internal virtual
```

_Changes the quorum numerator.

Emits a {QuorumNumeratorUpdated} event.

Requirements:

- New numerator must be smaller or equal to the denominator._

## IGovernorTimelock

_Extension of the {IGovernor} for timelock supporting modules.

_Available since v4.3.__

### ProposalQueued

```solidity
event ProposalQueued(uint256 proposalId, uint256 eta)
```

### timelock

```solidity
function timelock() public view virtual returns (address)
```

### proposalEta

```solidity
function proposalEta(uint256 proposalId) public view virtual returns (uint256)
```

### queue

```solidity
function queue(address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash) public virtual returns (uint256 proposalId)
```

## IVotes

_Common interface for {ERC20Votes}, {ERC721Votes}, and other {Votes}-enabled contracts.

_Available since v4.5.__

### DelegateChanged

```solidity
event DelegateChanged(address delegator, address fromDelegate, address toDelegate)
```

_Emitted when an account changes their delegate._

### DelegateVotesChanged

```solidity
event DelegateVotesChanged(address delegate, uint256 previousBalance, uint256 newBalance)
```

_Emitted when a token transfer or delegate change results in changes to a delegate's number of votes._

### getVotes

```solidity
function getVotes(address account) external view returns (uint256)
```

_Returns the current amount of votes that `account` has._

### getPastVotes

```solidity
function getPastVotes(address account, uint256 blockNumber) external view returns (uint256)
```

_Returns the amount of votes that `account` had at the end of a past block (`blockNumber`)._

### getPastTotalSupply

```solidity
function getPastTotalSupply(uint256 blockNumber) external view returns (uint256)
```

_Returns the total supply of votes available at the end of a past block (`blockNumber`).

NOTE: This value is the sum of all available votes, which is not necessarily the sum of all delegated votes.
Votes that have not been delegated are still part of total supply, even though they would not participate in a
vote._

### delegates

```solidity
function delegates(address account) external view returns (address)
```

_Returns the delegate that `account` has chosen._

### delegate

```solidity
function delegate(address delegatee) external
```

_Delegates votes from the sender to `delegatee`._

### delegateBySig

```solidity
function delegateBySig(address delegatee, uint256 nonce, uint256 expiry, uint8 v, bytes32 r, bytes32 s) external
```

_Delegates votes from signer to `delegatee`._

## ERC20

_Implementation of the {IERC20} interface.

This implementation is agnostic to the way tokens are created. This means
that a supply mechanism has to be added in a derived contract using {_mint}.
For a generic mechanism see {ERC20PresetMinterPauser}.

TIP: For a detailed writeup see our guide
https://forum.zeppelin.solutions/t/how-to-implement-erc20-supply-mechanisms/226[How
to implement supply mechanisms].

We have followed general OpenZeppelin Contracts guidelines: functions revert
instead returning `false` on failure. This behavior is nonetheless
conventional and does not conflict with the expectations of ERC20
applications.

Additionally, an {Approval} event is emitted on calls to {transferFrom}.
This allows applications to reconstruct the allowance for all accounts just
by listening to said events. Other implementations of the EIP may not emit
these events, as it isn't required by the specification.

Finally, the non-standard {decreaseAllowance} and {increaseAllowance}
functions have been added to mitigate the well-known issues around setting
allowances. See {IERC20-approve}._

### _balances

```solidity
mapping(address => uint256) _balances
```

### _allowances

```solidity
mapping(address => mapping(address => uint256)) _allowances
```

### _totalSupply

```solidity
uint256 _totalSupply
```

### _name

```solidity
string _name
```

### _symbol

```solidity
string _symbol
```

### constructor

```solidity
constructor(string name_, string symbol_) public
```

_Sets the values for {name} and {symbol}.

The default value of {decimals} is 18. To select a different value for
{decimals} you should overload it.

All two of these values are immutable: they can only be set once during
construction._

### name

```solidity
function name() public view virtual returns (string)
```

_Returns the name of the token._

### symbol

```solidity
function symbol() public view virtual returns (string)
```

_Returns the symbol of the token, usually a shorter version of the
name._

### decimals

```solidity
function decimals() public view virtual returns (uint8)
```

_Returns the number of decimals used to get its user representation.
For example, if `decimals` equals `2`, a balance of `505` tokens should
be displayed to a user as `5.05` (`505 / 10 ** 2`).

Tokens usually opt for a value of 18, imitating the relationship between
Ether and Wei. This is the value {ERC20} uses, unless this function is
overridden;

NOTE: This information is only used for _display_ purposes: it in
no way affects any of the arithmetic of the contract, including
{IERC20-balanceOf} and {IERC20-transfer}._

### totalSupply

```solidity
function totalSupply() public view virtual returns (uint256)
```

_See {IERC20-totalSupply}._

### balanceOf

```solidity
function balanceOf(address account) public view virtual returns (uint256)
```

_See {IERC20-balanceOf}._

### transfer

```solidity
function transfer(address to, uint256 amount) public virtual returns (bool)
```

_See {IERC20-transfer}.

Requirements:

- `to` cannot be the zero address.
- the caller must have a balance of at least `amount`._

### allowance

```solidity
function allowance(address owner, address spender) public view virtual returns (uint256)
```

_See {IERC20-allowance}._

### approve

```solidity
function approve(address spender, uint256 amount) public virtual returns (bool)
```

_See {IERC20-approve}.

NOTE: If `amount` is the maximum `uint256`, the allowance is not updated on
`transferFrom`. This is semantically equivalent to an infinite approval.

Requirements:

- `spender` cannot be the zero address._

### transferFrom

```solidity
function transferFrom(address from, address to, uint256 amount) public virtual returns (bool)
```

_See {IERC20-transferFrom}.

Emits an {Approval} event indicating the updated allowance. This is not
required by the EIP. See the note at the beginning of {ERC20}.

NOTE: Does not update the allowance if the current allowance
is the maximum `uint256`.

Requirements:

- `from` and `to` cannot be the zero address.
- `from` must have a balance of at least `amount`.
- the caller must have allowance for ``from``'s tokens of at least
`amount`._

### increaseAllowance

```solidity
function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool)
```

_Atomically increases the allowance granted to `spender` by the caller.

This is an alternative to {approve} that can be used as a mitigation for
problems described in {IERC20-approve}.

Emits an {Approval} event indicating the updated allowance.

Requirements:

- `spender` cannot be the zero address._

### decreaseAllowance

```solidity
function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool)
```

_Atomically decreases the allowance granted to `spender` by the caller.

This is an alternative to {approve} that can be used as a mitigation for
problems described in {IERC20-approve}.

Emits an {Approval} event indicating the updated allowance.

Requirements:

- `spender` cannot be the zero address.
- `spender` must have allowance for the caller of at least
`subtractedValue`._

### _transfer

```solidity
function _transfer(address from, address to, uint256 amount) internal virtual
```

_Moves `amount` of tokens from `sender` to `recipient`.

This internal function is equivalent to {transfer}, and can be used to
e.g. implement automatic token fees, slashing mechanisms, etc.

Emits a {Transfer} event.

Requirements:

- `from` cannot be the zero address.
- `to` cannot be the zero address.
- `from` must have a balance of at least `amount`._

### _mint

```solidity
function _mint(address account, uint256 amount) internal virtual
```

_Creates `amount` tokens and assigns them to `account`, increasing
the total supply.

Emits a {Transfer} event with `from` set to the zero address.

Requirements:

- `account` cannot be the zero address._

### _burn

```solidity
function _burn(address account, uint256 amount) internal virtual
```

_Destroys `amount` tokens from `account`, reducing the
total supply.

Emits a {Transfer} event with `to` set to the zero address.

Requirements:

- `account` cannot be the zero address.
- `account` must have at least `amount` tokens._

### _approve

```solidity
function _approve(address owner, address spender, uint256 amount) internal virtual
```

_Sets `amount` as the allowance of `spender` over the `owner` s tokens.

This internal function is equivalent to `approve`, and can be used to
e.g. set automatic allowances for certain subsystems, etc.

Emits an {Approval} event.

Requirements:

- `owner` cannot be the zero address.
- `spender` cannot be the zero address._

### _spendAllowance

```solidity
function _spendAllowance(address owner, address spender, uint256 amount) internal virtual
```

_Spend `amount` form the allowance of `owner` toward `spender`.

Does not update the allowance amount in case of infinite allowance.
Revert if not enough allowance is available.

Might emit an {Approval} event._

### _beforeTokenTransfer

```solidity
function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual
```

_Hook that is called before any transfer of tokens. This includes
minting and burning.

Calling conditions:

- when `from` and `to` are both non-zero, `amount` of ``from``'s tokens
will be transferred to `to`.
- when `from` is zero, `amount` tokens will be minted for `to`.
- when `to` is zero, `amount` of ``from``'s tokens will be burned.
- `from` and `to` are never both zero.

To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks]._

### _afterTokenTransfer

```solidity
function _afterTokenTransfer(address from, address to, uint256 amount) internal virtual
```

_Hook that is called after any transfer of tokens. This includes
minting and burning.

Calling conditions:

- when `from` and `to` are both non-zero, `amount` of ``from``'s tokens
has been transferred to `to`.
- when `from` is zero, `amount` tokens have been minted for `to`.
- when `to` is zero, `amount` of ``from``'s tokens have been burned.
- `from` and `to` are never both zero.

To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks]._

## IERC20

_Interface of the ERC20 standard as defined in the EIP._

### totalSupply

```solidity
function totalSupply() external view returns (uint256)
```

_Returns the amount of tokens in existence._

### balanceOf

```solidity
function balanceOf(address account) external view returns (uint256)
```

_Returns the amount of tokens owned by `account`._

### transfer

```solidity
function transfer(address to, uint256 amount) external returns (bool)
```

_Moves `amount` tokens from the caller's account to `to`.

Returns a boolean value indicating whether the operation succeeded.

Emits a {Transfer} event._

### allowance

```solidity
function allowance(address owner, address spender) external view returns (uint256)
```

_Returns the remaining number of tokens that `spender` will be
allowed to spend on behalf of `owner` through {transferFrom}. This is
zero by default.

This value changes when {approve} or {transferFrom} are called._

### approve

```solidity
function approve(address spender, uint256 amount) external returns (bool)
```

_Sets `amount` as the allowance of `spender` over the caller's tokens.

Returns a boolean value indicating whether the operation succeeded.

IMPORTANT: Beware that changing an allowance with this method brings the risk
that someone may use both the old and the new allowance by unfortunate
transaction ordering. One possible solution to mitigate this race
condition is to first reduce the spender's allowance to 0 and set the
desired value afterwards:
https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729

Emits an {Approval} event._

### transferFrom

```solidity
function transferFrom(address from, address to, uint256 amount) external returns (bool)
```

_Moves `amount` tokens from `from` to `to` using the
allowance mechanism. `amount` is then deducted from the caller's
allowance.

Returns a boolean value indicating whether the operation succeeded.

Emits a {Transfer} event._

### Transfer

```solidity
event Transfer(address from, address to, uint256 value)
```

_Emitted when `value` tokens are moved from one account (`from`) to
another (`to`).

Note that `value` may be zero._

### Approval

```solidity
event Approval(address owner, address spender, uint256 value)
```

_Emitted when the allowance of a `spender` for an `owner` is set by
a call to {approve}. `value` is the new allowance._

## ERC20Votes

_Extension of ERC20 to support Compound-like voting and delegation. This version is more generic than Compound's,
and supports token supply up to 2^224^ - 1, while COMP is limited to 2^96^ - 1.

NOTE: If exact COMP compatibility is required, use the {ERC20VotesComp} variant of this module.

This extension keeps a history (checkpoints) of each account's vote power. Vote power can be delegated either
by calling the {delegate} function directly, or by providing a signature to be used with {delegateBySig}. Voting
power can be queried through the public accessors {getVotes} and {getPastVotes}.

By default, token balance does not account for voting power. This makes transfers cheaper. The downside is that it
requires users to delegate to themselves in order to activate checkpoints and have their voting power tracked.

_Available since v4.2.__

### Checkpoint

```solidity
struct Checkpoint {
  uint32 fromBlock;
  uint224 votes;
}
```

### _DELEGATION_TYPEHASH

```solidity
bytes32 _DELEGATION_TYPEHASH
```

### _delegates

```solidity
mapping(address => address) _delegates
```

### _checkpoints

```solidity
mapping(address => struct ERC20Votes.Checkpoint[]) _checkpoints
```

### _totalSupplyCheckpoints

```solidity
struct ERC20Votes.Checkpoint[] _totalSupplyCheckpoints
```

### checkpoints

```solidity
function checkpoints(address account, uint32 pos) public view virtual returns (struct ERC20Votes.Checkpoint)
```

_Get the `pos`-th checkpoint for `account`._

### numCheckpoints

```solidity
function numCheckpoints(address account) public view virtual returns (uint32)
```

_Get number of checkpoints for `account`._

### delegates

```solidity
function delegates(address account) public view virtual returns (address)
```

_Get the address `account` is currently delegating to._

### getVotes

```solidity
function getVotes(address account) public view virtual returns (uint256)
```

_Gets the current votes balance for `account`_

### getPastVotes

```solidity
function getPastVotes(address account, uint256 blockNumber) public view virtual returns (uint256)
```

_Retrieve the number of votes for `account` at the end of `blockNumber`.

Requirements:

- `blockNumber` must have been already mined_

### getPastTotalSupply

```solidity
function getPastTotalSupply(uint256 blockNumber) public view virtual returns (uint256)
```

_Retrieve the `totalSupply` at the end of `blockNumber`. Note, this value is the sum of all balances.
It is but NOT the sum of all the delegated votes!

Requirements:

- `blockNumber` must have been already mined_

### _checkpointsLookup

```solidity
function _checkpointsLookup(struct ERC20Votes.Checkpoint[] ckpts, uint256 blockNumber) private view returns (uint256)
```

_Lookup a value in a list of (sorted) checkpoints._

### delegate

```solidity
function delegate(address delegatee) public virtual
```

_Delegate votes from the sender to `delegatee`._

### delegateBySig

```solidity
function delegateBySig(address delegatee, uint256 nonce, uint256 expiry, uint8 v, bytes32 r, bytes32 s) public virtual
```

_Delegates votes from signer to `delegatee`_

### _maxSupply

```solidity
function _maxSupply() internal view virtual returns (uint224)
```

_Maximum token supply. Defaults to `type(uint224).max` (2^224^ - 1)._

### _mint

```solidity
function _mint(address account, uint256 amount) internal virtual
```

_Snapshots the totalSupply after it has been increased._

### _burn

```solidity
function _burn(address account, uint256 amount) internal virtual
```

_Snapshots the totalSupply after it has been decreased._

### _afterTokenTransfer

```solidity
function _afterTokenTransfer(address from, address to, uint256 amount) internal virtual
```

_Move voting power when tokens are transferred.

Emits a {DelegateVotesChanged} event._

### _delegate

```solidity
function _delegate(address delegator, address delegatee) internal virtual
```

_Change delegation for `delegator` to `delegatee`.

Emits events {DelegateChanged} and {DelegateVotesChanged}._

### _moveVotingPower

```solidity
function _moveVotingPower(address src, address dst, uint256 amount) private
```

### _writeCheckpoint

```solidity
function _writeCheckpoint(struct ERC20Votes.Checkpoint[] ckpts, function (uint256,uint256) view returns (uint256) op, uint256 delta) private returns (uint256 oldWeight, uint256 newWeight)
```

### _add

```solidity
function _add(uint256 a, uint256 b) private pure returns (uint256)
```

### _subtract

```solidity
function _subtract(uint256 a, uint256 b) private pure returns (uint256)
```

## IERC20Metadata

_Interface for the optional metadata functions from the ERC20 standard.

_Available since v4.1.__

### name

```solidity
function name() external view returns (string)
```

_Returns the name of the token._

### symbol

```solidity
function symbol() external view returns (string)
```

_Returns the symbol of the token._

### decimals

```solidity
function decimals() external view returns (uint8)
```

_Returns the decimals places of the token._

## ERC20Permit

_Implementation of the ERC20 Permit extension allowing approvals to be made via signatures, as defined in
https://eips.ethereum.org/EIPS/eip-2612[EIP-2612].

Adds the {permit} method, which can be used to change an account's ERC20 allowance (see {IERC20-allowance}) by
presenting a message signed by the account. By not relying on `{IERC20-approve}`, the token holder account doesn't
need to send a transaction, and thus is not required to hold Ether at all.

_Available since v3.4.__

### _nonces

```solidity
mapping(address => struct Counters.Counter) _nonces
```

### _PERMIT_TYPEHASH

```solidity
bytes32 _PERMIT_TYPEHASH
```

### constructor

```solidity
constructor(string name) internal
```

_Initializes the {EIP712} domain separator using the `name` parameter, and setting `version` to `"1"`.

It's a good idea to use the same `name` that is defined as the ERC20 token name._

### permit

```solidity
function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) public virtual
```

_See {IERC20Permit-permit}._

### nonces

```solidity
function nonces(address owner) public view virtual returns (uint256)
```

_See {IERC20Permit-nonces}._

### DOMAIN_SEPARATOR

```solidity
function DOMAIN_SEPARATOR() external view returns (bytes32)
```

_See {IERC20Permit-DOMAIN_SEPARATOR}._

### _useNonce

```solidity
function _useNonce(address owner) internal virtual returns (uint256 current)
```

_"Consume a nonce": return the current value and increment.

_Available since v4.1.__

## IERC20Permit

_Interface of the ERC20 Permit extension allowing approvals to be made via signatures, as defined in
https://eips.ethereum.org/EIPS/eip-2612[EIP-2612].

Adds the {permit} method, which can be used to change an account's ERC20 allowance (see {IERC20-allowance}) by
presenting a message signed by the account. By not relying on {IERC20-approve}, the token holder account doesn't
need to send a transaction, and thus is not required to hold Ether at all._

### permit

```solidity
function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external
```

_Sets `value` as the allowance of `spender` over ``owner``'s tokens,
given ``owner``'s signed approval.

IMPORTANT: The same issues {IERC20-approve} has related to transaction
ordering also apply here.

Emits an {Approval} event.

Requirements:

- `spender` cannot be the zero address.
- `deadline` must be a timestamp in the future.
- `v`, `r` and `s` must be a valid `secp256k1` signature from `owner`
over the EIP712-formatted function arguments.
- the signature must use ``owner``'s current nonce (see {nonces}).

For more information on the signature format, see the
https://eips.ethereum.org/EIPS/eip-2612#specification[relevant EIP
section]._

### nonces

```solidity
function nonces(address owner) external view returns (uint256)
```

_Returns the current nonce for `owner`. This value must be
included whenever a signature is generated for {permit}.

Every successful call to {permit} increases ``owner``'s nonce by one. This
prevents a signature from being used multiple times._

### DOMAIN_SEPARATOR

```solidity
function DOMAIN_SEPARATOR() external view returns (bytes32)
```

_Returns the domain separator used in the encoding of the signature for {permit}, as defined by {EIP712}._

## Address

_Collection of functions related to the address type_

### isContract

```solidity
function isContract(address account) internal view returns (bool)
```

_Returns true if `account` is a contract.

[IMPORTANT]
====
It is unsafe to assume that an address for which this function returns
false is an externally-owned account (EOA) and not a contract.

Among others, `isContract` will return false for the following
types of addresses:

 - an externally-owned account
 - a contract in construction
 - an address where a contract will be created
 - an address where a contract lived, but was destroyed
====

[IMPORTANT]
====
You shouldn't rely on `isContract` to protect against flash loan attacks!

Preventing calls from contracts is highly discouraged. It breaks composability, breaks support for smart wallets
like Gnosis Safe, and does not provide security since it can be circumvented by calling from a contract
constructor.
====_

### sendValue

```solidity
function sendValue(address payable recipient, uint256 amount) internal
```

_Replacement for Solidity's `transfer`: sends `amount` wei to
`recipient`, forwarding all available gas and reverting on errors.

https://eips.ethereum.org/EIPS/eip-1884[EIP1884] increases the gas cost
of certain opcodes, possibly making contracts go over the 2300 gas limit
imposed by `transfer`, making them unable to receive funds via
`transfer`. {sendValue} removes this limitation.

https://diligence.consensys.net/posts/2019/09/stop-using-soliditys-transfer-now/[Learn more].

IMPORTANT: because control is transferred to `recipient`, care must be
taken to not create reentrancy vulnerabilities. Consider using
{ReentrancyGuard} or the
https://solidity.readthedocs.io/en/v0.5.11/security-considerations.html#use-the-checks-effects-interactions-pattern[checks-effects-interactions pattern]._

### functionCall

```solidity
function functionCall(address target, bytes data) internal returns (bytes)
```

_Performs a Solidity function call using a low level `call`. A
plain `call` is an unsafe replacement for a function call: use this
function instead.

If `target` reverts with a revert reason, it is bubbled up by this
function (like regular Solidity function calls).

Returns the raw returned data. To convert to the expected return value,
use https://solidity.readthedocs.io/en/latest/units-and-global-variables.html?highlight=abi.decode#abi-encoding-and-decoding-functions[`abi.decode`].

Requirements:

- `target` must be a contract.
- calling `target` with `data` must not revert.

_Available since v3.1.__

### functionCall

```solidity
function functionCall(address target, bytes data, string errorMessage) internal returns (bytes)
```

_Same as {xref-Address-functionCall-address-bytes-}[`functionCall`], but with
`errorMessage` as a fallback revert reason when `target` reverts.

_Available since v3.1.__

### functionCallWithValue

```solidity
function functionCallWithValue(address target, bytes data, uint256 value) internal returns (bytes)
```

_Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
but also transferring `value` wei to `target`.

Requirements:

- the calling contract must have an ETH balance of at least `value`.
- the called Solidity function must be `payable`.

_Available since v3.1.__

### functionCallWithValue

```solidity
function functionCallWithValue(address target, bytes data, uint256 value, string errorMessage) internal returns (bytes)
```

_Same as {xref-Address-functionCallWithValue-address-bytes-uint256-}[`functionCallWithValue`], but
with `errorMessage` as a fallback revert reason when `target` reverts.

_Available since v3.1.__

### functionStaticCall

```solidity
function functionStaticCall(address target, bytes data) internal view returns (bytes)
```

_Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
but performing a static call.

_Available since v3.3.__

### functionStaticCall

```solidity
function functionStaticCall(address target, bytes data, string errorMessage) internal view returns (bytes)
```

_Same as {xref-Address-functionCall-address-bytes-string-}[`functionCall`],
but performing a static call.

_Available since v3.3.__

### functionDelegateCall

```solidity
function functionDelegateCall(address target, bytes data) internal returns (bytes)
```

_Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
but performing a delegate call.

_Available since v3.4.__

### functionDelegateCall

```solidity
function functionDelegateCall(address target, bytes data, string errorMessage) internal returns (bytes)
```

_Same as {xref-Address-functionCall-address-bytes-string-}[`functionCall`],
but performing a delegate call.

_Available since v3.4.__

### verifyCallResult

```solidity
function verifyCallResult(bool success, bytes returndata, string errorMessage) internal pure returns (bytes)
```

_Tool to verifies that a low level call was successful, and revert if it wasn't, either by bubbling the
revert reason using the provided one.

_Available since v4.3.__

## Context

_Provides information about the current execution context, including the
sender of the transaction and its data. While these are generally available
via msg.sender and msg.data, they should not be accessed in such a direct
manner, since when dealing with meta-transactions the account sending and
paying for execution may not be the actual sender (as far as an application
is concerned).

This contract is only required for intermediate, library-like contracts._

### _msgSender

```solidity
function _msgSender() internal view virtual returns (address)
```

### _msgData

```solidity
function _msgData() internal view virtual returns (bytes)
```

## Counters

_Provides counters that can only be incremented, decremented or reset. This can be used e.g. to track the number
of elements in a mapping, issuing ERC721 ids, or counting request ids.

Include with `using Counters for Counters.Counter;`_

### Counter

```solidity
struct Counter {
  uint256 _value;
}
```

### current

```solidity
function current(struct Counters.Counter counter) internal view returns (uint256)
```

### increment

```solidity
function increment(struct Counters.Counter counter) internal
```

### decrement

```solidity
function decrement(struct Counters.Counter counter) internal
```

### reset

```solidity
function reset(struct Counters.Counter counter) internal
```

## Strings

_String operations._

### _HEX_SYMBOLS

```solidity
bytes16 _HEX_SYMBOLS
```

### toString

```solidity
function toString(uint256 value) internal pure returns (string)
```

_Converts a `uint256` to its ASCII `string` decimal representation._

### toHexString

```solidity
function toHexString(uint256 value) internal pure returns (string)
```

_Converts a `uint256` to its ASCII `string` hexadecimal representation._

### toHexString

```solidity
function toHexString(uint256 value, uint256 length) internal pure returns (string)
```

_Converts a `uint256` to its ASCII `string` hexadecimal representation with fixed length._

## Timers

_Tooling for timepoints, timers and delays_

### Timestamp

```solidity
struct Timestamp {
  uint64 _deadline;
}
```

### getDeadline

```solidity
function getDeadline(struct Timers.Timestamp timer) internal pure returns (uint64)
```

### setDeadline

```solidity
function setDeadline(struct Timers.Timestamp timer, uint64 timestamp) internal
```

### reset

```solidity
function reset(struct Timers.Timestamp timer) internal
```

### isUnset

```solidity
function isUnset(struct Timers.Timestamp timer) internal pure returns (bool)
```

### isStarted

```solidity
function isStarted(struct Timers.Timestamp timer) internal pure returns (bool)
```

### isPending

```solidity
function isPending(struct Timers.Timestamp timer) internal view returns (bool)
```

### isExpired

```solidity
function isExpired(struct Timers.Timestamp timer) internal view returns (bool)
```

### BlockNumber

```solidity
struct BlockNumber {
  uint64 _deadline;
}
```

### getDeadline

```solidity
function getDeadline(struct Timers.BlockNumber timer) internal pure returns (uint64)
```

### setDeadline

```solidity
function setDeadline(struct Timers.BlockNumber timer, uint64 timestamp) internal
```

### reset

```solidity
function reset(struct Timers.BlockNumber timer) internal
```

### isUnset

```solidity
function isUnset(struct Timers.BlockNumber timer) internal pure returns (bool)
```

### isStarted

```solidity
function isStarted(struct Timers.BlockNumber timer) internal pure returns (bool)
```

### isPending

```solidity
function isPending(struct Timers.BlockNumber timer) internal view returns (bool)
```

### isExpired

```solidity
function isExpired(struct Timers.BlockNumber timer) internal view returns (bool)
```

## ECDSA

_Elliptic Curve Digital Signature Algorithm (ECDSA) operations.

These functions can be used to verify that a message was signed by the holder
of the private keys of a given address._

### RecoverError

```solidity
enum RecoverError {
  NoError,
  InvalidSignature,
  InvalidSignatureLength,
  InvalidSignatureS,
  InvalidSignatureV
}
```

### _throwError

```solidity
function _throwError(enum ECDSA.RecoverError error) private pure
```

### tryRecover

```solidity
function tryRecover(bytes32 hash, bytes signature) internal pure returns (address, enum ECDSA.RecoverError)
```

_Returns the address that signed a hashed message (`hash`) with
`signature` or error string. This address can then be used for verification purposes.

The `ecrecover` EVM opcode allows for malleable (non-unique) signatures:
this function rejects them by requiring the `s` value to be in the lower
half order, and the `v` value to be either 27 or 28.

IMPORTANT: `hash` _must_ be the result of a hash operation for the
verification to be secure: it is possible to craft signatures that
recover to arbitrary addresses for non-hashed data. A safe way to ensure
this is by receiving a hash of the original message (which may otherwise
be too long), and then calling {toEthSignedMessageHash} on it.

Documentation for signature generation:
- with https://web3js.readthedocs.io/en/v1.3.4/web3-eth-accounts.html#sign[Web3.js]
- with https://docs.ethers.io/v5/api/signer/#Signer-signMessage[ethers]

_Available since v4.3.__

### recover

```solidity
function recover(bytes32 hash, bytes signature) internal pure returns (address)
```

_Returns the address that signed a hashed message (`hash`) with
`signature`. This address can then be used for verification purposes.

The `ecrecover` EVM opcode allows for malleable (non-unique) signatures:
this function rejects them by requiring the `s` value to be in the lower
half order, and the `v` value to be either 27 or 28.

IMPORTANT: `hash` _must_ be the result of a hash operation for the
verification to be secure: it is possible to craft signatures that
recover to arbitrary addresses for non-hashed data. A safe way to ensure
this is by receiving a hash of the original message (which may otherwise
be too long), and then calling {toEthSignedMessageHash} on it._

### tryRecover

```solidity
function tryRecover(bytes32 hash, bytes32 r, bytes32 vs) internal pure returns (address, enum ECDSA.RecoverError)
```

_Overload of {ECDSA-tryRecover} that receives the `r` and `vs` short-signature fields separately.

See https://eips.ethereum.org/EIPS/eip-2098[EIP-2098 short signatures]

_Available since v4.3.__

### recover

```solidity
function recover(bytes32 hash, bytes32 r, bytes32 vs) internal pure returns (address)
```

_Overload of {ECDSA-recover} that receives the `r and `vs` short-signature fields separately.

_Available since v4.2.__

### tryRecover

```solidity
function tryRecover(bytes32 hash, uint8 v, bytes32 r, bytes32 s) internal pure returns (address, enum ECDSA.RecoverError)
```

_Overload of {ECDSA-tryRecover} that receives the `v`,
`r` and `s` signature fields separately.

_Available since v4.3.__

### recover

```solidity
function recover(bytes32 hash, uint8 v, bytes32 r, bytes32 s) internal pure returns (address)
```

_Overload of {ECDSA-recover} that receives the `v`,
`r` and `s` signature fields separately.
/_

### toEthSignedMessageHash

```solidity
function toEthSignedMessageHash(bytes32 hash) internal pure returns (bytes32)
```

_Returns an Ethereum Signed Message, created from a `hash`. This
produces hash corresponding to the one signed with the
https://eth.wiki/json-rpc/API#eth_sign[`eth_sign`]
JSON-RPC method as part of EIP-191.

See {recover}.
/_

### toEthSignedMessageHash

```solidity
function toEthSignedMessageHash(bytes s) internal pure returns (bytes32)
```

_Returns an Ethereum Signed Message, created from `s`. This
produces hash corresponding to the one signed with the
https://eth.wiki/json-rpc/API#eth_sign[`eth_sign`]
JSON-RPC method as part of EIP-191.

See {recover}.
/_

### toTypedDataHash

```solidity
function toTypedDataHash(bytes32 domainSeparator, bytes32 structHash) internal pure returns (bytes32)
```

_Returns an Ethereum Signed Typed Data, created from a
`domainSeparator` and a `structHash`. This produces hash corresponding
to the one signed with the
https://eips.ethereum.org/EIPS/eip-712[`eth_signTypedData`]
JSON-RPC method as part of EIP-712.

See {recover}.
/_

## EIP712

_https://eips.ethereum.org/EIPS/eip-712[EIP 712] is a standard for hashing and signing of typed structured data.

The encoding specified in the EIP is very generic, and such a generic implementation in Solidity is not feasible,
thus this contract does not implement the encoding itself. Protocols need to implement the type-specific encoding
they need in their contracts using a combination of `abi.encode` and `keccak256`.

This contract implements the EIP 712 domain separator ({_domainSeparatorV4}) that is used as part of the encoding
scheme, and the final step of the encoding to obtain the message digest that is then signed via ECDSA
({_hashTypedDataV4}).

The implementation of the domain separator was designed to be as efficient as possible while still properly updating
the chain id to protect against replay attacks on an eventual fork of the chain.

NOTE: This contract implements the version of the encoding known as "v4", as implemented by the JSON RPC method
https://docs.metamask.io/guide/signing-data.html[`eth_signTypedDataV4` in MetaMask].

_Available since v3.4.__

### _CACHED_DOMAIN_SEPARATOR

```solidity
bytes32 _CACHED_DOMAIN_SEPARATOR
```

### _CACHED_CHAIN_ID

```solidity
uint256 _CACHED_CHAIN_ID
```

### _CACHED_THIS

```solidity
address _CACHED_THIS
```

### _HASHED_NAME

```solidity
bytes32 _HASHED_NAME
```

### _HASHED_VERSION

```solidity
bytes32 _HASHED_VERSION
```

### _TYPE_HASH

```solidity
bytes32 _TYPE_HASH
```

### constructor

```solidity
constructor(string name, string version) internal
```

_Initializes the domain separator and parameter caches.

The meaning of `name` and `version` is specified in
https://eips.ethereum.org/EIPS/eip-712#definition-of-domainseparator[EIP 712]:

- `name`: the user readable name of the signing domain, i.e. the name of the DApp or the protocol.
- `version`: the current major version of the signing domain.

NOTE: These parameters cannot be changed except through a xref:learn::upgrading-smart-contracts.adoc[smart
contract upgrade]._

### _domainSeparatorV4

```solidity
function _domainSeparatorV4() internal view returns (bytes32)
```

_Returns the domain separator for the current chain._

### _buildDomainSeparator

```solidity
function _buildDomainSeparator(bytes32 typeHash, bytes32 nameHash, bytes32 versionHash) private view returns (bytes32)
```

### _hashTypedDataV4

```solidity
function _hashTypedDataV4(bytes32 structHash) internal view virtual returns (bytes32)
```

_Given an already https://eips.ethereum.org/EIPS/eip-712#definition-of-hashstruct[hashed struct], this
function returns the hash of the fully encoded EIP712 message for this domain.

This hash can be used together with {ECDSA-recover} to obtain the signer of a message. For example:

```solidity
bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(
    keccak256("Mail(address to,string contents)"),
    mailTo,
    keccak256(bytes(mailContents))
)));
address signer = ECDSA.recover(digest, signature);
```_

## ERC165

_Implementation of the {IERC165} interface.

Contracts that want to implement ERC165 should inherit from this contract and override {supportsInterface} to check
for the additional interface id that will be supported. For example:

```solidity
function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
    return interfaceId == type(MyInterface).interfaceId || super.supportsInterface(interfaceId);
}
```

Alternatively, {ERC165Storage} provides an easier to use but more expensive implementation._

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view virtual returns (bool)
```

_See {IERC165-supportsInterface}._

## IERC165

_Interface of the ERC165 standard, as defined in the
https://eips.ethereum.org/EIPS/eip-165[EIP].

Implementers can declare support of contract interfaces, which can then be
queried by others ({ERC165Checker}).

For an implementation, see {ERC165}._

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool)
```

_Returns true if this contract implements the interface defined by
`interfaceId`. See the corresponding
https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section]
to learn more about how these ids are created.

This function call must use less than 30 000 gas._

## Math

_Standard math utilities missing in the Solidity language._

### max

```solidity
function max(uint256 a, uint256 b) internal pure returns (uint256)
```

_Returns the largest of two numbers._

### min

```solidity
function min(uint256 a, uint256 b) internal pure returns (uint256)
```

_Returns the smallest of two numbers._

### average

```solidity
function average(uint256 a, uint256 b) internal pure returns (uint256)
```

_Returns the average of two numbers. The result is rounded towards
zero._

### ceilDiv

```solidity
function ceilDiv(uint256 a, uint256 b) internal pure returns (uint256)
```

_Returns the ceiling of the division of two numbers.

This differs from standard division with `/` in that it rounds up instead
of rounding down._

## SafeCast

_Wrappers over Solidity's uintXX/intXX casting operators with added overflow
checks.

Downcasting from uint256/int256 in Solidity does not revert on overflow. This can
easily result in undesired exploitation or bugs, since developers usually
assume that overflows raise errors. `SafeCast` restores this intuition by
reverting the transaction when such an operation overflows.

Using this library instead of the unchecked operations eliminates an entire
class of bugs, so it's recommended to use it always.

Can be combined with {SafeMath} and {SignedSafeMath} to extend it to smaller types, by performing
all math on `uint256` and `int256` and then downcasting._

### toUint224

```solidity
function toUint224(uint256 value) internal pure returns (uint224)
```

_Returns the downcasted uint224 from uint256, reverting on
overflow (when the input is greater than largest uint224).

Counterpart to Solidity's `uint224` operator.

Requirements:

- input must fit into 224 bits_

### toUint128

```solidity
function toUint128(uint256 value) internal pure returns (uint128)
```

_Returns the downcasted uint128 from uint256, reverting on
overflow (when the input is greater than largest uint128).

Counterpart to Solidity's `uint128` operator.

Requirements:

- input must fit into 128 bits_

### toUint96

```solidity
function toUint96(uint256 value) internal pure returns (uint96)
```

_Returns the downcasted uint96 from uint256, reverting on
overflow (when the input is greater than largest uint96).

Counterpart to Solidity's `uint96` operator.

Requirements:

- input must fit into 96 bits_

### toUint64

```solidity
function toUint64(uint256 value) internal pure returns (uint64)
```

_Returns the downcasted uint64 from uint256, reverting on
overflow (when the input is greater than largest uint64).

Counterpart to Solidity's `uint64` operator.

Requirements:

- input must fit into 64 bits_

### toUint32

```solidity
function toUint32(uint256 value) internal pure returns (uint32)
```

_Returns the downcasted uint32 from uint256, reverting on
overflow (when the input is greater than largest uint32).

Counterpart to Solidity's `uint32` operator.

Requirements:

- input must fit into 32 bits_

### toUint16

```solidity
function toUint16(uint256 value) internal pure returns (uint16)
```

_Returns the downcasted uint16 from uint256, reverting on
overflow (when the input is greater than largest uint16).

Counterpart to Solidity's `uint16` operator.

Requirements:

- input must fit into 16 bits_

### toUint8

```solidity
function toUint8(uint256 value) internal pure returns (uint8)
```

_Returns the downcasted uint8 from uint256, reverting on
overflow (when the input is greater than largest uint8).

Counterpart to Solidity's `uint8` operator.

Requirements:

- input must fit into 8 bits._

### toUint256

```solidity
function toUint256(int256 value) internal pure returns (uint256)
```

_Converts a signed int256 into an unsigned uint256.

Requirements:

- input must be greater than or equal to 0._

### toInt128

```solidity
function toInt128(int256 value) internal pure returns (int128)
```

_Returns the downcasted int128 from int256, reverting on
overflow (when the input is less than smallest int128 or
greater than largest int128).

Counterpart to Solidity's `int128` operator.

Requirements:

- input must fit into 128 bits

_Available since v3.1.__

### toInt64

```solidity
function toInt64(int256 value) internal pure returns (int64)
```

_Returns the downcasted int64 from int256, reverting on
overflow (when the input is less than smallest int64 or
greater than largest int64).

Counterpart to Solidity's `int64` operator.

Requirements:

- input must fit into 64 bits

_Available since v3.1.__

### toInt32

```solidity
function toInt32(int256 value) internal pure returns (int32)
```

_Returns the downcasted int32 from int256, reverting on
overflow (when the input is less than smallest int32 or
greater than largest int32).

Counterpart to Solidity's `int32` operator.

Requirements:

- input must fit into 32 bits

_Available since v3.1.__

### toInt16

```solidity
function toInt16(int256 value) internal pure returns (int16)
```

_Returns the downcasted int16 from int256, reverting on
overflow (when the input is less than smallest int16 or
greater than largest int16).

Counterpart to Solidity's `int16` operator.

Requirements:

- input must fit into 16 bits

_Available since v3.1.__

### toInt8

```solidity
function toInt8(int256 value) internal pure returns (int8)
```

_Returns the downcasted int8 from int256, reverting on
overflow (when the input is less than smallest int8 or
greater than largest int8).

Counterpart to Solidity's `int8` operator.

Requirements:

- input must fit into 8 bits.

_Available since v3.1.__

### toInt256

```solidity
function toInt256(uint256 value) internal pure returns (int256)
```

_Converts an unsigned uint256 into a signed int256.

Requirements:

- input must be less than or equal to maxInt256._

## SafeMath

_Wrappers over Solidity's arithmetic operations.

NOTE: `SafeMath` is generally not needed starting with Solidity 0.8, since the compiler
now has built in overflow checking._

### tryAdd

```solidity
function tryAdd(uint256 a, uint256 b) internal pure returns (bool, uint256)
```

_Returns the addition of two unsigned integers, with an overflow flag.

_Available since v3.4.__

### trySub

```solidity
function trySub(uint256 a, uint256 b) internal pure returns (bool, uint256)
```

_Returns the substraction of two unsigned integers, with an overflow flag.

_Available since v3.4.__

### tryMul

```solidity
function tryMul(uint256 a, uint256 b) internal pure returns (bool, uint256)
```

_Returns the multiplication of two unsigned integers, with an overflow flag.

_Available since v3.4.__

### tryDiv

```solidity
function tryDiv(uint256 a, uint256 b) internal pure returns (bool, uint256)
```

_Returns the division of two unsigned integers, with a division by zero flag.

_Available since v3.4.__

### tryMod

```solidity
function tryMod(uint256 a, uint256 b) internal pure returns (bool, uint256)
```

_Returns the remainder of dividing two unsigned integers, with a division by zero flag.

_Available since v3.4.__

### add

```solidity
function add(uint256 a, uint256 b) internal pure returns (uint256)
```

_Returns the addition of two unsigned integers, reverting on
overflow.

Counterpart to Solidity's `+` operator.

Requirements:

- Addition cannot overflow._

### sub

```solidity
function sub(uint256 a, uint256 b) internal pure returns (uint256)
```

_Returns the subtraction of two unsigned integers, reverting on
overflow (when the result is negative).

Counterpart to Solidity's `-` operator.

Requirements:

- Subtraction cannot overflow._

### mul

```solidity
function mul(uint256 a, uint256 b) internal pure returns (uint256)
```

_Returns the multiplication of two unsigned integers, reverting on
overflow.

Counterpart to Solidity's `*` operator.

Requirements:

- Multiplication cannot overflow._

### div

```solidity
function div(uint256 a, uint256 b) internal pure returns (uint256)
```

_Returns the integer division of two unsigned integers, reverting on
division by zero. The result is rounded towards zero.

Counterpart to Solidity's `/` operator.

Requirements:

- The divisor cannot be zero._

### mod

```solidity
function mod(uint256 a, uint256 b) internal pure returns (uint256)
```

_Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
reverting when dividing by zero.

Counterpart to Solidity's `%` operator. This function uses a `revert`
opcode (which leaves remaining gas untouched) while Solidity uses an
invalid opcode to revert (consuming all remaining gas).

Requirements:

- The divisor cannot be zero._

### sub

```solidity
function sub(uint256 a, uint256 b, string errorMessage) internal pure returns (uint256)
```

_Returns the subtraction of two unsigned integers, reverting with custom message on
overflow (when the result is negative).

CAUTION: This function is deprecated because it requires allocating memory for the error
message unnecessarily. For custom revert reasons use {trySub}.

Counterpart to Solidity's `-` operator.

Requirements:

- Subtraction cannot overflow._

### div

```solidity
function div(uint256 a, uint256 b, string errorMessage) internal pure returns (uint256)
```

_Returns the integer division of two unsigned integers, reverting with custom message on
division by zero. The result is rounded towards zero.

Counterpart to Solidity's `/` operator. Note: this function uses a
`revert` opcode (which leaves remaining gas untouched) while Solidity
uses an invalid opcode to revert (consuming all remaining gas).

Requirements:

- The divisor cannot be zero._

### mod

```solidity
function mod(uint256 a, uint256 b, string errorMessage) internal pure returns (uint256)
```

_Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
reverting with custom message when dividing by zero.

CAUTION: This function is deprecated because it requires allocating memory for the error
message unnecessarily. For custom revert reasons use {tryMod}.

Counterpart to Solidity's `%` operator. This function uses a `revert`
opcode (which leaves remaining gas untouched) while Solidity uses an
invalid opcode to revert (consuming all remaining gas).

Requirements:

- The divisor cannot be zero._

## IUniswapV3SwapCallback

Any contract that calls IUniswapV3PoolActions#swap must implement this interface

### uniswapV3SwapCallback

```solidity
function uniswapV3SwapCallback(int256 amount0Delta, int256 amount1Delta, bytes data) external
```

Called to `msg.sender` after executing a swap via IUniswapV3Pool#swap.

_In the implementation you must pay the pool tokens owed for the swap.
The caller of this method must be checked to be a UniswapV3Pool deployed by the canonical UniswapV3Factory.
amount0Delta and amount1Delta can both be 0 if no tokens were swapped._

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount0Delta | int256 | The amount of token0 that was sent (negative) or must be received (positive) by the pool by the end of the swap. If positive, the callback must send that amount of token0 to the pool. |
| amount1Delta | int256 | The amount of token1 that was sent (negative) or must be received (positive) by the pool by the end of the swap. If positive, the callback must send that amount of token1 to the pool. |
| data | bytes | Any data passed through by the caller via the IUniswapV3PoolActions#swap call |

## ISwapRouter

Functions for swapping tokens via Uniswap V3

### ExactInputSingleParams

```solidity
struct ExactInputSingleParams {
  address tokenIn;
  address tokenOut;
  uint24 fee;
  address recipient;
  uint256 deadline;
  uint256 amountIn;
  uint256 amountOutMinimum;
  uint160 sqrtPriceLimitX96;
}
```

### exactInputSingle

```solidity
function exactInputSingle(struct ISwapRouter.ExactInputSingleParams params) external payable returns (uint256 amountOut)
```

Swaps `amountIn` of one token for as much as possible of another token

| Name | Type | Description |
| ---- | ---- | ----------- |
| params | struct ISwapRouter.ExactInputSingleParams | The parameters necessary for the swap, encoded as `ExactInputSingleParams` in calldata |

| Name | Type | Description |
| ---- | ---- | ----------- |
| amountOut | uint256 | The amount of the received token |

### ExactInputParams

```solidity
struct ExactInputParams {
  bytes path;
  address recipient;
  uint256 deadline;
  uint256 amountIn;
  uint256 amountOutMinimum;
}
```

### exactInput

```solidity
function exactInput(struct ISwapRouter.ExactInputParams params) external payable returns (uint256 amountOut)
```

Swaps `amountIn` of one token for as much as possible of another along the specified path

| Name | Type | Description |
| ---- | ---- | ----------- |
| params | struct ISwapRouter.ExactInputParams | The parameters necessary for the multi-hop swap, encoded as `ExactInputParams` in calldata |

| Name | Type | Description |
| ---- | ---- | ----------- |
| amountOut | uint256 | The amount of the received token |

### ExactOutputSingleParams

```solidity
struct ExactOutputSingleParams {
  address tokenIn;
  address tokenOut;
  uint24 fee;
  address recipient;
  uint256 deadline;
  uint256 amountOut;
  uint256 amountInMaximum;
  uint160 sqrtPriceLimitX96;
}
```

### exactOutputSingle

```solidity
function exactOutputSingle(struct ISwapRouter.ExactOutputSingleParams params) external payable returns (uint256 amountIn)
```

Swaps as little as possible of one token for `amountOut` of another token

| Name | Type | Description |
| ---- | ---- | ----------- |
| params | struct ISwapRouter.ExactOutputSingleParams | The parameters necessary for the swap, encoded as `ExactOutputSingleParams` in calldata |

| Name | Type | Description |
| ---- | ---- | ----------- |
| amountIn | uint256 | The amount of the input token |

### ExactOutputParams

```solidity
struct ExactOutputParams {
  bytes path;
  address recipient;
  uint256 deadline;
  uint256 amountOut;
  uint256 amountInMaximum;
}
```

### exactOutput

```solidity
function exactOutput(struct ISwapRouter.ExactOutputParams params) external payable returns (uint256 amountIn)
```

Swaps as little as possible of one token for `amountOut` of another along the specified path (reversed)

| Name | Type | Description |
| ---- | ---- | ----------- |
| params | struct ISwapRouter.ExactOutputParams | The parameters necessary for the multi-hop swap, encoded as `ExactOutputParams` in calldata |

| Name | Type | Description |
| ---- | ---- | ----------- |
| amountIn | uint256 | The amount of the input token |

## TransferHelper

### safeTransferFrom

```solidity
function safeTransferFrom(address token, address from, address to, uint256 value) internal
```

Transfers tokens from the targeted address to the given destination
Errors with 'STF' if transfer fails

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | address | The contract address of the token to be transferred |
| from | address | The originating address from which the tokens will be transferred |
| to | address | The destination address of the transfer |
| value | uint256 | The amount to be transferred |

### safeTransfer

```solidity
function safeTransfer(address token, address to, uint256 value) internal
```

Transfers tokens from msg.sender to a recipient

_Errors with ST if transfer fails_

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | address | The contract address of the token which will be transferred |
| to | address | The recipient of the transfer |
| value | uint256 | The value of the transfer |

### safeApprove

```solidity
function safeApprove(address token, address to, uint256 value) internal
```

Approves the stipulated contract to spend the given allowance in the given token

_Errors with 'SA' if transfer fails_

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | address | The contract address of the token to be approved |
| to | address | The target of the approval |
| value | uint256 | The amount of the given token the target will be allowed to spend |

### safeTransferETH

```solidity
function safeTransferETH(address to, uint256 value) internal
```

Transfers ETH to the recipient address

_Fails with `STE`_

| Name | Type | Description |
| ---- | ---- | ----------- |
| to | address | The destination of the transfer |
| value | uint256 | The value to be transferred |

## IAaveLPManager

### getAllAaveSupportedTokens

```solidity
function getAllAaveSupportedTokens() external view returns (address[])
```

### liquidateAaveTreasury

```solidity
function liquidateAaveTreasury() external returns (bool)
```

### balanceAaveLendingPool

```solidity
function balanceAaveLendingPool() external
```

## IWETH9

### deposit

```solidity
function deposit() external payable
```

### withdraw

```solidity
function withdraw(uint256 wad) external
```

### balanceOf

```solidity
function balanceOf(address account) external view returns (uint256)
```

## TokenMaturity

### onlyOwner

```solidity
modifier onlyOwner()
```

### tokenMaturityInitLock

```solidity
modifier tokenMaturityInitLock()
```

### initTokenMaturity

```solidity
function initTokenMaturity(uint256 daysUntilMaturity) public
```

### TokenMatured

```solidity
event TokenMatured(uint256 balance, uint256 totalSupply)
```

_Emitted when treasury has been liquidated
with the contract's ETH balance and total supply of redeemable tokens_

### Redeemed

```solidity
event Redeemed(address holder, uint256 tuffBalance, uint256 ethAmount)
```

_Emitted when holder redeems tokens for ETH_

### isTokenMaturityInit

```solidity
function isTokenMaturityInit() public view returns (bool)
```

### getContractMaturityTimestamp

```solidity
function getContractMaturityTimestamp() public view returns (uint256)
```

### setContractMaturityTimestamp

```solidity
function setContractMaturityTimestamp(uint256 timestamp) public
```

### isTokenMatured

```solidity
function isTokenMatured(uint256 timestamp) public view returns (bool)
```

### totalSupplyForRedemption

```solidity
function totalSupplyForRedemption() public view returns (uint256)
```

### setTotalSupplyForRedemption

```solidity
function setTotalSupplyForRedemption(uint256 _totalSupplyForRedemption) public
```

### getContractStartingEthBalance

```solidity
function getContractStartingEthBalance() public view returns (uint256)
```

### setContractStartingEthBalance

```solidity
function setContractStartingEthBalance(uint256 startingEthBalance) public
```

### getRedemptionAmount

```solidity
function getRedemptionAmount(uint256 ownerBalance) public view returns (uint256)
```

### getIsTreasuryLiquidated

```solidity
function getIsTreasuryLiquidated() public view returns (bool)
```

### setIsTreasuryLiquidated

```solidity
function setIsTreasuryLiquidated(bool _isTreasuryLiquidated) public
```

### redeem

```solidity
function redeem() public
```

### hasRedeemed

```solidity
function hasRedeemed(address account) public view returns (bool, uint256)
```

### balanceOfEth

```solidity
function balanceOfEth(address account) public view returns (uint256)
```

### getCurrentContractEthBalance

```solidity
function getCurrentContractEthBalance() public view returns (uint256)
```

### onTokenMaturity

```solidity
function onTokenMaturity() public
```

### liquidateTreasury

```solidity
function liquidateTreasury() public
```

### swapForWETH

```solidity
function swapForWETH(address token, uint256 amount) public returns (uint256)
```

### unwrapWETH

```solidity
function unwrapWETH() public returns (uint256)
```

## TokenMaturityLib

### NAMESPACE

```solidity
string NAMESPACE
```

### POSITION

```solidity
bytes32 POSITION
```

### StateStorage

```solidity
struct StateStorage {
  bool isInit;
  mapping(address &#x3D;&gt; bool) ownersRedeemed;
  mapping(address &#x3D;&gt; uint256) ownersRedemptionBalances;
  uint256 contractMaturityTimestamp;
  bool isTreasuryLiquidated;
  uint256 totalSupplyForRedemption;
  uint256 startingEthBalance;
}
```

### getState

```solidity
function getState() internal pure returns (struct TokenMaturityLib.StateStorage stateStorage)
```

## TuffGovernor

Implementation of openzepplin governance https://docs.openzeppelin.com/contracts/4.x/governance#governor

### _votingDelay

```solidity
uint256 _votingDelay
```

### _votingPeriod

```solidity
uint256 _votingPeriod
```

### _proposalThreshold

```solidity
uint256 _proposalThreshold
```

### constructor

```solidity
constructor(contract ERC20Votes _token, contract TimelockController _timelock) public
```

### votingDelay

```solidity
function votingDelay() public view returns (uint256)
```

module:user-config

_Delay, in number of block, between the proposal is created and the vote starts. This can be increassed to
leave time for users to buy voting power, of delegate it, before the voting of a proposal starts._

### setVotingDelay

```solidity
function setVotingDelay(uint256 delay) public
```

### votingPeriod

```solidity
function votingPeriod() public view returns (uint256)
```

module:user-config

_Delay, in number of blocks, between the vote start and vote ends.

NOTE: The {votingDelay} can delay the start of the vote. This must be considered when setting the voting
duration compared to the voting delay._

### setVotingPeriod

```solidity
function setVotingPeriod(uint256 period) public
```

### proposalThreshold

```solidity
function proposalThreshold() public view returns (uint256)
```

_Part of the Governor Bravo's interface: _"The number of votes required in order for a voter to become a proposer"_._

### setProposalThreshold

```solidity
function setProposalThreshold(uint256 threshold) public
```

### quorum

```solidity
function quorum(uint256 blockNumber) public view returns (uint256)
```

### getVotes

```solidity
function getVotes(address account, uint256 blockNumber) public view returns (uint256)
```

### state

```solidity
function state(uint256 proposalId) public view returns (enum IGovernor.ProposalState)
```

### propose

```solidity
function propose(address[] targets, uint256[] values, bytes[] calldatas, string description) public returns (uint256)
```

### _execute

```solidity
function _execute(uint256 proposalId, address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash) internal
```

### _cancel

```solidity
function _cancel(address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash) internal returns (uint256)
```

### _executor

```solidity
function _executor() internal view returns (address)
```

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view returns (bool)
```

### doPropose

```solidity
function doPropose(address[] targets, uint256[] values, bytes[] calldatas, string description) public returns (uint256)
```

### doQueue

```solidity
function doQueue(address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash) public returns (uint256)
```

### doExecute

```solidity
function doExecute(address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash) public payable returns (uint256)
```

## TuffKeeper

### onlyOwner

```solidity
modifier onlyOwner()
```

### initTuffKeeperLock

```solidity
modifier initTuffKeeperLock()
```

### isTuffKeeperInit

```solidity
function isTuffKeeperInit() public view returns (bool)
```

### initTuffKeeper

```solidity
function initTuffKeeper() public
```

### setTokenMaturityInterval

```solidity
function setTokenMaturityInterval(uint256 _tokenMaturityInterval) public
```

### getTokenMaturityInterval

```solidity
function getTokenMaturityInterval() public view returns (uint256)
```

### setBalanceAssetsInterval

```solidity
function setBalanceAssetsInterval(uint256 _balanceAssetsInterval) public
```

### getBalanceAssetsInterval

```solidity
function getBalanceAssetsInterval() public view returns (uint256)
```

### setLastTokenMaturityTimestamp

```solidity
function setLastTokenMaturityTimestamp(uint256 _lastTimestamp) public
```

### getLastTokenMaturityTimestamp

```solidity
function getLastTokenMaturityTimestamp() public view returns (uint256)
```

### setLastBalanceAssetsTimestamp

```solidity
function setLastBalanceAssetsTimestamp(uint256 _lastTimestamp) public
```

### getLastBalanceAssetsTimestamp

```solidity
function getLastBalanceAssetsTimestamp() public view returns (uint256)
```

### isIntervalComplete

```solidity
function isIntervalComplete(uint256 timestamp, uint256 lastTimestamp, uint256 interval) private view returns (bool)
```

### checkUpkeep

```solidity
function checkUpkeep(bytes) external view returns (bool needed, bytes performData)
```

### performUpkeep

```solidity
function performUpkeep(bytes) external
```

## TuffKeeperLib

### NAMESPACE

```solidity
string NAMESPACE
```

### POSITION

```solidity
bytes32 POSITION
```

### StateStorage

```solidity
struct StateStorage {
  bool isInit;
  uint256 tokenMaturityInterval;
  uint256 lastTokenMaturityTimestamp;
  uint256 balanceAssetsInterval;
  uint256 lastBalanceAssetsTimestamp;
}
```

### getState

```solidity
function getState() internal pure returns (struct TuffKeeperLib.StateStorage stateStorage)
```

## TuffOwner

_inspired by https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol
owner() is already defined in the TuffTokenDiamond, we cannot import openzepplin's Ownable contract as it shadows
the existing definition and we need to allow calls coming from other facets on the diamond contract._

### tuffOwnerInitLock

```solidity
modifier tuffOwnerInitLock()
```

### isTuffOwnerInit

```solidity
function isTuffOwnerInit() public view returns (bool)
```

### initTuffOwner

```solidity
function initTuffOwner(address initialOwner) public
```

### OwnershipTransferred

```solidity
event OwnershipTransferred(address previousOwner, address newOwner)
```

### getTuffOwner

```solidity
function getTuffOwner() public view virtual returns (address)
```

_Returns the address of the current owner._

### onlyOwner

```solidity
modifier onlyOwner()
```

### requireOnlyOwner

```solidity
function requireOnlyOwner(address sender) public view
```

_Throws if called by any account other than the owner._

### renounceOwnership

```solidity
function renounceOwnership() public virtual
```

_Leaves the contract without owner. It will not be possible to call
`onlyOwner` functions anymore. Can only be called by the current owner.

NOTE: Renouncing ownership will leave the contract without an owner,
thereby removing any functionality that is only available to the owner._

### transferTuffOwnership

```solidity
function transferTuffOwnership(address newOwner) public virtual
```

_Transfers ownership of the contract to a new account (`newOwner`).
Can only be called by the current owner._

### _transferOwnership

```solidity
function _transferOwnership(address newOwner) internal virtual
```

_Transfers ownership of the contract to a new account (`newOwner`).
Internal function without access restriction._

## TuffOwnerLib

### NAMESPACE

```solidity
string NAMESPACE
```

### POSITION

```solidity
bytes32 POSITION
```

### StateStorage

```solidity
struct StateStorage {
  bool isInit;
  address _owner;
}
```

### getState

```solidity
function getState() internal pure returns (struct TuffOwnerLib.StateStorage stateStorage)
```

## TuffToken

Implementation of openzepplin governance https://docs.openzeppelin.com/contracts/4.x/governance
In order to have voting power, an account must hold TuffToken.
They must also delegate themselves (or another holder if they so choose) to be granted voting power.
Voting power is determined simply by token balance.

### _name

```solidity
string _name
```

### _symbol

```solidity
string _symbol
```

### _decimals

```solidity
uint8 _decimals
```

### constructor

```solidity
constructor(string name_, string symbol_) public
```

### name

```solidity
function name() public view returns (string)
```

_Returns the name of the token._

### symbol

```solidity
function symbol() public view returns (string)
```

_Returns the symbol of the token, usually a shorter version of the
name._

### decimals

```solidity
function decimals() public view returns (uint8)
```

_Returns the number of decimals used to get its user representation.
For example, if `decimals` equals `2`, a balance of `505` tokens should
be displayed to a user as `5.05` (`505 / 10 ** 2`).

Tokens usually opt for a value of 18, imitating the relationship between
Ether and Wei. This is the value {ERC20} uses, unless this function is
overridden;

NOTE: This information is only used for _display_ purposes: it in
no way affects any of the arithmetic of the contract, including
{IERC20-balanceOf} and {IERC20-transfer}._

### _afterTokenTransfer

```solidity
function _afterTokenTransfer(address from, address to, uint256 amount) internal
```

### _mint

```solidity
function _mint(address to, uint256 amount) internal
```

### _burn

```solidity
function _burn(address account, uint256 amount) internal
```

## TuffVBT

### onlyOwner

```solidity
modifier onlyOwner()
```

### tuffVBTInitLock

```solidity
modifier tuffVBTInitLock()
```

### initTuffVBT

```solidity
function initTuffVBT(address initialOwner, string name, string symbol, uint8 decimals, uint256 farmFee, uint256 devFee, address devWalletAddress, uint256 totalSupply) public
```

### isTuffVBTInit

```solidity
function isTuffVBTInit() public view returns (bool)
```

### name

```solidity
function name() public view returns (string)
```

### symbol

```solidity
function symbol() public view returns (string)
```

### decimals

```solidity
function decimals() public view returns (uint8)
```

### totalSupply

```solidity
function totalSupply() public view returns (uint256)
```

_Returns the amount of tokens in existence._

### getFarmFee

```solidity
function getFarmFee() public view returns (uint256)
```

### setFarmFee

```solidity
function setFarmFee(uint256 _farmFee) public
```

### getDevFee

```solidity
function getDevFee() public view returns (uint256)
```

### setDevFee

```solidity
function setDevFee(uint256 _devFee) public
```

### getDevWalletAddress

```solidity
function getDevWalletAddress() public view returns (address)
```

### setDevWalletAddress

```solidity
function setDevWalletAddress(address _devWalletAddress) public
```

### balanceOf

```solidity
function balanceOf(address account) public view returns (uint256)
```

_Returns the amount of tokens owned by `account`._

### transfer

```solidity
function transfer(address recipient, uint256 amount) public returns (bool)
```

### allowance

```solidity
function allowance(address owner, address spender) public view returns (uint256)
```

_Returns the remaining number of tokens that `spender` will be
allowed to spend on behalf of `owner` through {transferFrom}. This is
zero by default.

This value changes when {approve} or {transferFrom} are called._

### approve

```solidity
function approve(address spender, uint256 amount) public returns (bool)
```

_Sets `amount` as the allowance of `spender` over the caller's tokens.

Returns a boolean value indicating whether the operation succeeded.

IMPORTANT: Beware that changing an allowance with this method brings the risk
that someone may use both the old and the new allowance by unfortunate
transaction ordering. One possible solution to mitigate this race
condition is to first reduce the spender's allowance to 0 and set the
desired value afterwards:
https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729

Emits an {Approval} event._

### transferFrom

```solidity
function transferFrom(address from, address to, uint256 amount) public returns (bool)
```

_Moves `amount` tokens from `from` to `to` using the
allowance mechanism. `amount` is then deducted from the caller's
allowance.

Returns a boolean value indicating whether the operation succeeded.

Emits a {Transfer} event._

### _spendAllowance

```solidity
function _spendAllowance(address owner, address spender, uint256 amount) internal virtual
```

_Updates `owner` s allowance for `spender` based on spent `amount`.

Does not update the allowance amount in case of infinite allowance.
Revert if not enough allowance is available.

Might emit an {Approval} event._

### increaseAllowance

```solidity
function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool)
```

_Atomically increases the allowance granted to `spender` by the caller.

This is an alternative to {approve} that can be used as a mitigation for
problems described in {IERC20-approve}.

Emits an {Approval} event indicating the updated allowance.

Requirements:

- `spender` cannot be the zero address._

### decreaseAllowance

```solidity
function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool)
```

_Atomically decreases the allowance granted to `spender` by the caller.

This is an alternative to {approve} that can be used as a mitigation for
problems described in {IERC20-approve}.

Emits an {Approval} event indicating the updated allowance.

Requirements:

- `spender` cannot be the zero address.
- `spender` must have allowance for the caller of at least
`subtractedValue`._

### excludeFromFee

```solidity
function excludeFromFee(address account) public
```

### includeInFee

```solidity
function includeInFee(address account) public
```

### isExcludedFromFee

```solidity
function isExcludedFromFee(address account) public view returns (bool)
```

### calculateFee

```solidity
function calculateFee(uint256 _amount, uint256 feePercent, bool takeFee) public view returns (uint256)
```

### _approve

```solidity
function _approve(address owner, address spender, uint256 amount) private
```

_Sets `amount` as the allowance of `spender` over the `owner` s tokens.

This internal function is equivalent to `approve`, and can be used to
e.g. set automatic allowances for certain subsystems, etc.

Emits an {Approval} event.

Requirements:

- `owner` cannot be the zero address.
- `spender` cannot be the zero address._

### _transfer

```solidity
function _transfer(address from, address to, uint256 amount) internal virtual
```

_Moves `amount` of tokens from `sender` to `recipient`.

This internal function is equivalent to {transfer}, and can be used to
e.g. implement automatic token fees, slashing mechanisms, etc.

Emits a {Transfer} event.

Requirements:

- `from` cannot be the zero address.
- `to` cannot be the zero address.
- `from` must have a balance of at least `amount`._

### burn

```solidity
function burn(address account, uint256 amount) public
```

### receive

```solidity
receive() external payable
```

## TuffVBTLib

### NAMESPACE

```solidity
string NAMESPACE
```

### POSITION

```solidity
bytes32 POSITION
```

### StateStorage

```solidity
struct StateStorage {
  bool isInit;
  mapping(address &#x3D;&gt; uint256) balances;
  mapping(address &#x3D;&gt; mapping(address &#x3D;&gt; uint256)) allowances;
  mapping(address &#x3D;&gt; bool) isExcludedFromFee;
  string name;
  string symbol;
  uint8 decimals;
  uint256 farmFee;
  uint256 devFee;
  address devWalletAddress;
  uint256 totalSupply;
}
```

### getState

```solidity
function getState() internal pure returns (struct TuffVBTLib.StateStorage stateStorage)
```

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

## UniswapManagerLib

### NAMESPACE

```solidity
string NAMESPACE
```

### POSITION

```solidity
bytes32 POSITION
```

### StateStorage

```solidity
struct StateStorage {
  bool isInit;
  contract ISwapRouter swapRouter;
  address WETHAddress;
  uint24 basePoolFee;
}
```

### getState

```solidity
function getState() internal pure returns (struct UniswapManagerLib.StateStorage stateStorage)
```

## console

### CONSOLE_ADDRESS

```solidity
address CONSOLE_ADDRESS
```

### _sendLogPayload

```solidity
function _sendLogPayload(bytes payload) private view
```

### log

```solidity
function log() internal view
```

### logInt

```solidity
function logInt(int256 p0) internal view
```

### logUint

```solidity
function logUint(uint256 p0) internal view
```

### logString

```solidity
function logString(string p0) internal view
```

### logBool

```solidity
function logBool(bool p0) internal view
```

### logAddress

```solidity
function logAddress(address p0) internal view
```

### logBytes

```solidity
function logBytes(bytes p0) internal view
```

### logBytes1

```solidity
function logBytes1(bytes1 p0) internal view
```

### logBytes2

```solidity
function logBytes2(bytes2 p0) internal view
```

### logBytes3

```solidity
function logBytes3(bytes3 p0) internal view
```

### logBytes4

```solidity
function logBytes4(bytes4 p0) internal view
```

### logBytes5

```solidity
function logBytes5(bytes5 p0) internal view
```

### logBytes6

```solidity
function logBytes6(bytes6 p0) internal view
```

### logBytes7

```solidity
function logBytes7(bytes7 p0) internal view
```

### logBytes8

```solidity
function logBytes8(bytes8 p0) internal view
```

### logBytes9

```solidity
function logBytes9(bytes9 p0) internal view
```

### logBytes10

```solidity
function logBytes10(bytes10 p0) internal view
```

### logBytes11

```solidity
function logBytes11(bytes11 p0) internal view
```

### logBytes12

```solidity
function logBytes12(bytes12 p0) internal view
```

### logBytes13

```solidity
function logBytes13(bytes13 p0) internal view
```

### logBytes14

```solidity
function logBytes14(bytes14 p0) internal view
```

### logBytes15

```solidity
function logBytes15(bytes15 p0) internal view
```

### logBytes16

```solidity
function logBytes16(bytes16 p0) internal view
```

### logBytes17

```solidity
function logBytes17(bytes17 p0) internal view
```

### logBytes18

```solidity
function logBytes18(bytes18 p0) internal view
```

### logBytes19

```solidity
function logBytes19(bytes19 p0) internal view
```

### logBytes20

```solidity
function logBytes20(bytes20 p0) internal view
```

### logBytes21

```solidity
function logBytes21(bytes21 p0) internal view
```

### logBytes22

```solidity
function logBytes22(bytes22 p0) internal view
```

### logBytes23

```solidity
function logBytes23(bytes23 p0) internal view
```

### logBytes24

```solidity
function logBytes24(bytes24 p0) internal view
```

### logBytes25

```solidity
function logBytes25(bytes25 p0) internal view
```

### logBytes26

```solidity
function logBytes26(bytes26 p0) internal view
```

### logBytes27

```solidity
function logBytes27(bytes27 p0) internal view
```

### logBytes28

```solidity
function logBytes28(bytes28 p0) internal view
```

### logBytes29

```solidity
function logBytes29(bytes29 p0) internal view
```

### logBytes30

```solidity
function logBytes30(bytes30 p0) internal view
```

### logBytes31

```solidity
function logBytes31(bytes31 p0) internal view
```

### logBytes32

```solidity
function logBytes32(bytes32 p0) internal view
```

### log

```solidity
function log(uint256 p0) internal view
```

### log

```solidity
function log(string p0) internal view
```

### log

```solidity
function log(bool p0) internal view
```

### log

```solidity
function log(address p0) internal view
```

### log

```solidity
function log(uint256 p0, uint256 p1) internal view
```

### log

```solidity
function log(uint256 p0, string p1) internal view
```

### log

```solidity
function log(uint256 p0, bool p1) internal view
```

### log

```solidity
function log(uint256 p0, address p1) internal view
```

### log

```solidity
function log(string p0, uint256 p1) internal view
```

### log

```solidity
function log(string p0, string p1) internal view
```

### log

```solidity
function log(string p0, bool p1) internal view
```

### log

```solidity
function log(string p0, address p1) internal view
```

### log

```solidity
function log(bool p0, uint256 p1) internal view
```

### log

```solidity
function log(bool p0, string p1) internal view
```

### log

```solidity
function log(bool p0, bool p1) internal view
```

### log

```solidity
function log(bool p0, address p1) internal view
```

### log

```solidity
function log(address p0, uint256 p1) internal view
```

### log

```solidity
function log(address p0, string p1) internal view
```

### log

```solidity
function log(address p0, bool p1) internal view
```

### log

```solidity
function log(address p0, address p1) internal view
```

### log

```solidity
function log(uint256 p0, uint256 p1, uint256 p2) internal view
```

### log

```solidity
function log(uint256 p0, uint256 p1, string p2) internal view
```

### log

```solidity
function log(uint256 p0, uint256 p1, bool p2) internal view
```

### log

```solidity
function log(uint256 p0, uint256 p1, address p2) internal view
```

### log

```solidity
function log(uint256 p0, string p1, uint256 p2) internal view
```

### log

```solidity
function log(uint256 p0, string p1, string p2) internal view
```

### log

```solidity
function log(uint256 p0, string p1, bool p2) internal view
```

### log

```solidity
function log(uint256 p0, string p1, address p2) internal view
```

### log

```solidity
function log(uint256 p0, bool p1, uint256 p2) internal view
```

### log

```solidity
function log(uint256 p0, bool p1, string p2) internal view
```

### log

```solidity
function log(uint256 p0, bool p1, bool p2) internal view
```

### log

```solidity
function log(uint256 p0, bool p1, address p2) internal view
```

### log

```solidity
function log(uint256 p0, address p1, uint256 p2) internal view
```

### log

```solidity
function log(uint256 p0, address p1, string p2) internal view
```

### log

```solidity
function log(uint256 p0, address p1, bool p2) internal view
```

### log

```solidity
function log(uint256 p0, address p1, address p2) internal view
```

### log

```solidity
function log(string p0, uint256 p1, uint256 p2) internal view
```

### log

```solidity
function log(string p0, uint256 p1, string p2) internal view
```

### log

```solidity
function log(string p0, uint256 p1, bool p2) internal view
```

### log

```solidity
function log(string p0, uint256 p1, address p2) internal view
```

### log

```solidity
function log(string p0, string p1, uint256 p2) internal view
```

### log

```solidity
function log(string p0, string p1, string p2) internal view
```

### log

```solidity
function log(string p0, string p1, bool p2) internal view
```

### log

```solidity
function log(string p0, string p1, address p2) internal view
```

### log

```solidity
function log(string p0, bool p1, uint256 p2) internal view
```

### log

```solidity
function log(string p0, bool p1, string p2) internal view
```

### log

```solidity
function log(string p0, bool p1, bool p2) internal view
```

### log

```solidity
function log(string p0, bool p1, address p2) internal view
```

### log

```solidity
function log(string p0, address p1, uint256 p2) internal view
```

### log

```solidity
function log(string p0, address p1, string p2) internal view
```

### log

```solidity
function log(string p0, address p1, bool p2) internal view
```

### log

```solidity
function log(string p0, address p1, address p2) internal view
```

### log

```solidity
function log(bool p0, uint256 p1, uint256 p2) internal view
```

### log

```solidity
function log(bool p0, uint256 p1, string p2) internal view
```

### log

```solidity
function log(bool p0, uint256 p1, bool p2) internal view
```

### log

```solidity
function log(bool p0, uint256 p1, address p2) internal view
```

### log

```solidity
function log(bool p0, string p1, uint256 p2) internal view
```

### log

```solidity
function log(bool p0, string p1, string p2) internal view
```

### log

```solidity
function log(bool p0, string p1, bool p2) internal view
```

### log

```solidity
function log(bool p0, string p1, address p2) internal view
```

### log

```solidity
function log(bool p0, bool p1, uint256 p2) internal view
```

### log

```solidity
function log(bool p0, bool p1, string p2) internal view
```

### log

```solidity
function log(bool p0, bool p1, bool p2) internal view
```

### log

```solidity
function log(bool p0, bool p1, address p2) internal view
```

### log

```solidity
function log(bool p0, address p1, uint256 p2) internal view
```

### log

```solidity
function log(bool p0, address p1, string p2) internal view
```

### log

```solidity
function log(bool p0, address p1, bool p2) internal view
```

### log

```solidity
function log(bool p0, address p1, address p2) internal view
```

### log

```solidity
function log(address p0, uint256 p1, uint256 p2) internal view
```

### log

```solidity
function log(address p0, uint256 p1, string p2) internal view
```

### log

```solidity
function log(address p0, uint256 p1, bool p2) internal view
```

### log

```solidity
function log(address p0, uint256 p1, address p2) internal view
```

### log

```solidity
function log(address p0, string p1, uint256 p2) internal view
```

### log

```solidity
function log(address p0, string p1, string p2) internal view
```

### log

```solidity
function log(address p0, string p1, bool p2) internal view
```

### log

```solidity
function log(address p0, string p1, address p2) internal view
```

### log

```solidity
function log(address p0, bool p1, uint256 p2) internal view
```

### log

```solidity
function log(address p0, bool p1, string p2) internal view
```

### log

```solidity
function log(address p0, bool p1, bool p2) internal view
```

### log

```solidity
function log(address p0, bool p1, address p2) internal view
```

### log

```solidity
function log(address p0, address p1, uint256 p2) internal view
```

### log

```solidity
function log(address p0, address p1, string p2) internal view
```

### log

```solidity
function log(address p0, address p1, bool p2) internal view
```

### log

```solidity
function log(address p0, address p1, address p2) internal view
```

### log

```solidity
function log(uint256 p0, uint256 p1, uint256 p2, uint256 p3) internal view
```

### log

```solidity
function log(uint256 p0, uint256 p1, uint256 p2, string p3) internal view
```

### log

```solidity
function log(uint256 p0, uint256 p1, uint256 p2, bool p3) internal view
```

### log

```solidity
function log(uint256 p0, uint256 p1, uint256 p2, address p3) internal view
```

### log

```solidity
function log(uint256 p0, uint256 p1, string p2, uint256 p3) internal view
```

### log

```solidity
function log(uint256 p0, uint256 p1, string p2, string p3) internal view
```

### log

```solidity
function log(uint256 p0, uint256 p1, string p2, bool p3) internal view
```

### log

```solidity
function log(uint256 p0, uint256 p1, string p2, address p3) internal view
```

### log

```solidity
function log(uint256 p0, uint256 p1, bool p2, uint256 p3) internal view
```

### log

```solidity
function log(uint256 p0, uint256 p1, bool p2, string p3) internal view
```

### log

```solidity
function log(uint256 p0, uint256 p1, bool p2, bool p3) internal view
```

### log

```solidity
function log(uint256 p0, uint256 p1, bool p2, address p3) internal view
```

### log

```solidity
function log(uint256 p0, uint256 p1, address p2, uint256 p3) internal view
```

### log

```solidity
function log(uint256 p0, uint256 p1, address p2, string p3) internal view
```

### log

```solidity
function log(uint256 p0, uint256 p1, address p2, bool p3) internal view
```

### log

```solidity
function log(uint256 p0, uint256 p1, address p2, address p3) internal view
```

### log

```solidity
function log(uint256 p0, string p1, uint256 p2, uint256 p3) internal view
```

### log

```solidity
function log(uint256 p0, string p1, uint256 p2, string p3) internal view
```

### log

```solidity
function log(uint256 p0, string p1, uint256 p2, bool p3) internal view
```

### log

```solidity
function log(uint256 p0, string p1, uint256 p2, address p3) internal view
```

### log

```solidity
function log(uint256 p0, string p1, string p2, uint256 p3) internal view
```

### log

```solidity
function log(uint256 p0, string p1, string p2, string p3) internal view
```

### log

```solidity
function log(uint256 p0, string p1, string p2, bool p3) internal view
```

### log

```solidity
function log(uint256 p0, string p1, string p2, address p3) internal view
```

### log

```solidity
function log(uint256 p0, string p1, bool p2, uint256 p3) internal view
```

### log

```solidity
function log(uint256 p0, string p1, bool p2, string p3) internal view
```

### log

```solidity
function log(uint256 p0, string p1, bool p2, bool p3) internal view
```

### log

```solidity
function log(uint256 p0, string p1, bool p2, address p3) internal view
```

### log

```solidity
function log(uint256 p0, string p1, address p2, uint256 p3) internal view
```

### log

```solidity
function log(uint256 p0, string p1, address p2, string p3) internal view
```

### log

```solidity
function log(uint256 p0, string p1, address p2, bool p3) internal view
```

### log

```solidity
function log(uint256 p0, string p1, address p2, address p3) internal view
```

### log

```solidity
function log(uint256 p0, bool p1, uint256 p2, uint256 p3) internal view
```

### log

```solidity
function log(uint256 p0, bool p1, uint256 p2, string p3) internal view
```

### log

```solidity
function log(uint256 p0, bool p1, uint256 p2, bool p3) internal view
```

### log

```solidity
function log(uint256 p0, bool p1, uint256 p2, address p3) internal view
```

### log

```solidity
function log(uint256 p0, bool p1, string p2, uint256 p3) internal view
```

### log

```solidity
function log(uint256 p0, bool p1, string p2, string p3) internal view
```

### log

```solidity
function log(uint256 p0, bool p1, string p2, bool p3) internal view
```

### log

```solidity
function log(uint256 p0, bool p1, string p2, address p3) internal view
```

### log

```solidity
function log(uint256 p0, bool p1, bool p2, uint256 p3) internal view
```

### log

```solidity
function log(uint256 p0, bool p1, bool p2, string p3) internal view
```

### log

```solidity
function log(uint256 p0, bool p1, bool p2, bool p3) internal view
```

### log

```solidity
function log(uint256 p0, bool p1, bool p2, address p3) internal view
```

### log

```solidity
function log(uint256 p0, bool p1, address p2, uint256 p3) internal view
```

### log

```solidity
function log(uint256 p0, bool p1, address p2, string p3) internal view
```

### log

```solidity
function log(uint256 p0, bool p1, address p2, bool p3) internal view
```

### log

```solidity
function log(uint256 p0, bool p1, address p2, address p3) internal view
```

### log

```solidity
function log(uint256 p0, address p1, uint256 p2, uint256 p3) internal view
```

### log

```solidity
function log(uint256 p0, address p1, uint256 p2, string p3) internal view
```

### log

```solidity
function log(uint256 p0, address p1, uint256 p2, bool p3) internal view
```

### log

```solidity
function log(uint256 p0, address p1, uint256 p2, address p3) internal view
```

### log

```solidity
function log(uint256 p0, address p1, string p2, uint256 p3) internal view
```

### log

```solidity
function log(uint256 p0, address p1, string p2, string p3) internal view
```

### log

```solidity
function log(uint256 p0, address p1, string p2, bool p3) internal view
```

### log

```solidity
function log(uint256 p0, address p1, string p2, address p3) internal view
```

### log

```solidity
function log(uint256 p0, address p1, bool p2, uint256 p3) internal view
```

### log

```solidity
function log(uint256 p0, address p1, bool p2, string p3) internal view
```

### log

```solidity
function log(uint256 p0, address p1, bool p2, bool p3) internal view
```

### log

```solidity
function log(uint256 p0, address p1, bool p2, address p3) internal view
```

### log

```solidity
function log(uint256 p0, address p1, address p2, uint256 p3) internal view
```

### log

```solidity
function log(uint256 p0, address p1, address p2, string p3) internal view
```

### log

```solidity
function log(uint256 p0, address p1, address p2, bool p3) internal view
```

### log

```solidity
function log(uint256 p0, address p1, address p2, address p3) internal view
```

### log

```solidity
function log(string p0, uint256 p1, uint256 p2, uint256 p3) internal view
```

### log

```solidity
function log(string p0, uint256 p1, uint256 p2, string p3) internal view
```

### log

```solidity
function log(string p0, uint256 p1, uint256 p2, bool p3) internal view
```

### log

```solidity
function log(string p0, uint256 p1, uint256 p2, address p3) internal view
```

### log

```solidity
function log(string p0, uint256 p1, string p2, uint256 p3) internal view
```

### log

```solidity
function log(string p0, uint256 p1, string p2, string p3) internal view
```

### log

```solidity
function log(string p0, uint256 p1, string p2, bool p3) internal view
```

### log

```solidity
function log(string p0, uint256 p1, string p2, address p3) internal view
```

### log

```solidity
function log(string p0, uint256 p1, bool p2, uint256 p3) internal view
```

### log

```solidity
function log(string p0, uint256 p1, bool p2, string p3) internal view
```

### log

```solidity
function log(string p0, uint256 p1, bool p2, bool p3) internal view
```

### log

```solidity
function log(string p0, uint256 p1, bool p2, address p3) internal view
```

### log

```solidity
function log(string p0, uint256 p1, address p2, uint256 p3) internal view
```

### log

```solidity
function log(string p0, uint256 p1, address p2, string p3) internal view
```

### log

```solidity
function log(string p0, uint256 p1, address p2, bool p3) internal view
```

### log

```solidity
function log(string p0, uint256 p1, address p2, address p3) internal view
```

### log

```solidity
function log(string p0, string p1, uint256 p2, uint256 p3) internal view
```

### log

```solidity
function log(string p0, string p1, uint256 p2, string p3) internal view
```

### log

```solidity
function log(string p0, string p1, uint256 p2, bool p3) internal view
```

### log

```solidity
function log(string p0, string p1, uint256 p2, address p3) internal view
```

### log

```solidity
function log(string p0, string p1, string p2, uint256 p3) internal view
```

### log

```solidity
function log(string p0, string p1, string p2, string p3) internal view
```

### log

```solidity
function log(string p0, string p1, string p2, bool p3) internal view
```

### log

```solidity
function log(string p0, string p1, string p2, address p3) internal view
```

### log

```solidity
function log(string p0, string p1, bool p2, uint256 p3) internal view
```

### log

```solidity
function log(string p0, string p1, bool p2, string p3) internal view
```

### log

```solidity
function log(string p0, string p1, bool p2, bool p3) internal view
```

### log

```solidity
function log(string p0, string p1, bool p2, address p3) internal view
```

### log

```solidity
function log(string p0, string p1, address p2, uint256 p3) internal view
```

### log

```solidity
function log(string p0, string p1, address p2, string p3) internal view
```

### log

```solidity
function log(string p0, string p1, address p2, bool p3) internal view
```

### log

```solidity
function log(string p0, string p1, address p2, address p3) internal view
```

### log

```solidity
function log(string p0, bool p1, uint256 p2, uint256 p3) internal view
```

### log

```solidity
function log(string p0, bool p1, uint256 p2, string p3) internal view
```

### log

```solidity
function log(string p0, bool p1, uint256 p2, bool p3) internal view
```

### log

```solidity
function log(string p0, bool p1, uint256 p2, address p3) internal view
```

### log

```solidity
function log(string p0, bool p1, string p2, uint256 p3) internal view
```

### log

```solidity
function log(string p0, bool p1, string p2, string p3) internal view
```

### log

```solidity
function log(string p0, bool p1, string p2, bool p3) internal view
```

### log

```solidity
function log(string p0, bool p1, string p2, address p3) internal view
```

### log

```solidity
function log(string p0, bool p1, bool p2, uint256 p3) internal view
```

### log

```solidity
function log(string p0, bool p1, bool p2, string p3) internal view
```

### log

```solidity
function log(string p0, bool p1, bool p2, bool p3) internal view
```

### log

```solidity
function log(string p0, bool p1, bool p2, address p3) internal view
```

### log

```solidity
function log(string p0, bool p1, address p2, uint256 p3) internal view
```

### log

```solidity
function log(string p0, bool p1, address p2, string p3) internal view
```

### log

```solidity
function log(string p0, bool p1, address p2, bool p3) internal view
```

### log

```solidity
function log(string p0, bool p1, address p2, address p3) internal view
```

### log

```solidity
function log(string p0, address p1, uint256 p2, uint256 p3) internal view
```

### log

```solidity
function log(string p0, address p1, uint256 p2, string p3) internal view
```

### log

```solidity
function log(string p0, address p1, uint256 p2, bool p3) internal view
```

### log

```solidity
function log(string p0, address p1, uint256 p2, address p3) internal view
```

### log

```solidity
function log(string p0, address p1, string p2, uint256 p3) internal view
```

### log

```solidity
function log(string p0, address p1, string p2, string p3) internal view
```

### log

```solidity
function log(string p0, address p1, string p2, bool p3) internal view
```

### log

```solidity
function log(string p0, address p1, string p2, address p3) internal view
```

### log

```solidity
function log(string p0, address p1, bool p2, uint256 p3) internal view
```

### log

```solidity
function log(string p0, address p1, bool p2, string p3) internal view
```

### log

```solidity
function log(string p0, address p1, bool p2, bool p3) internal view
```

### log

```solidity
function log(string p0, address p1, bool p2, address p3) internal view
```

### log

```solidity
function log(string p0, address p1, address p2, uint256 p3) internal view
```

### log

```solidity
function log(string p0, address p1, address p2, string p3) internal view
```

### log

```solidity
function log(string p0, address p1, address p2, bool p3) internal view
```

### log

```solidity
function log(string p0, address p1, address p2, address p3) internal view
```

### log

```solidity
function log(bool p0, uint256 p1, uint256 p2, uint256 p3) internal view
```

### log

```solidity
function log(bool p0, uint256 p1, uint256 p2, string p3) internal view
```

### log

```solidity
function log(bool p0, uint256 p1, uint256 p2, bool p3) internal view
```

### log

```solidity
function log(bool p0, uint256 p1, uint256 p2, address p3) internal view
```

### log

```solidity
function log(bool p0, uint256 p1, string p2, uint256 p3) internal view
```

### log

```solidity
function log(bool p0, uint256 p1, string p2, string p3) internal view
```

### log

```solidity
function log(bool p0, uint256 p1, string p2, bool p3) internal view
```

### log

```solidity
function log(bool p0, uint256 p1, string p2, address p3) internal view
```

### log

```solidity
function log(bool p0, uint256 p1, bool p2, uint256 p3) internal view
```

### log

```solidity
function log(bool p0, uint256 p1, bool p2, string p3) internal view
```

### log

```solidity
function log(bool p0, uint256 p1, bool p2, bool p3) internal view
```

### log

```solidity
function log(bool p0, uint256 p1, bool p2, address p3) internal view
```

### log

```solidity
function log(bool p0, uint256 p1, address p2, uint256 p3) internal view
```

### log

```solidity
function log(bool p0, uint256 p1, address p2, string p3) internal view
```

### log

```solidity
function log(bool p0, uint256 p1, address p2, bool p3) internal view
```

### log

```solidity
function log(bool p0, uint256 p1, address p2, address p3) internal view
```

### log

```solidity
function log(bool p0, string p1, uint256 p2, uint256 p3) internal view
```

### log

```solidity
function log(bool p0, string p1, uint256 p2, string p3) internal view
```

### log

```solidity
function log(bool p0, string p1, uint256 p2, bool p3) internal view
```

### log

```solidity
function log(bool p0, string p1, uint256 p2, address p3) internal view
```

### log

```solidity
function log(bool p0, string p1, string p2, uint256 p3) internal view
```

### log

```solidity
function log(bool p0, string p1, string p2, string p3) internal view
```

### log

```solidity
function log(bool p0, string p1, string p2, bool p3) internal view
```

### log

```solidity
function log(bool p0, string p1, string p2, address p3) internal view
```

### log

```solidity
function log(bool p0, string p1, bool p2, uint256 p3) internal view
```

### log

```solidity
function log(bool p0, string p1, bool p2, string p3) internal view
```

### log

```solidity
function log(bool p0, string p1, bool p2, bool p3) internal view
```

### log

```solidity
function log(bool p0, string p1, bool p2, address p3) internal view
```

### log

```solidity
function log(bool p0, string p1, address p2, uint256 p3) internal view
```

### log

```solidity
function log(bool p0, string p1, address p2, string p3) internal view
```

### log

```solidity
function log(bool p0, string p1, address p2, bool p3) internal view
```

### log

```solidity
function log(bool p0, string p1, address p2, address p3) internal view
```

### log

```solidity
function log(bool p0, bool p1, uint256 p2, uint256 p3) internal view
```

### log

```solidity
function log(bool p0, bool p1, uint256 p2, string p3) internal view
```

### log

```solidity
function log(bool p0, bool p1, uint256 p2, bool p3) internal view
```

### log

```solidity
function log(bool p0, bool p1, uint256 p2, address p3) internal view
```

### log

```solidity
function log(bool p0, bool p1, string p2, uint256 p3) internal view
```

### log

```solidity
function log(bool p0, bool p1, string p2, string p3) internal view
```

### log

```solidity
function log(bool p0, bool p1, string p2, bool p3) internal view
```

### log

```solidity
function log(bool p0, bool p1, string p2, address p3) internal view
```

### log

```solidity
function log(bool p0, bool p1, bool p2, uint256 p3) internal view
```

### log

```solidity
function log(bool p0, bool p1, bool p2, string p3) internal view
```

### log

```solidity
function log(bool p0, bool p1, bool p2, bool p3) internal view
```

### log

```solidity
function log(bool p0, bool p1, bool p2, address p3) internal view
```

### log

```solidity
function log(bool p0, bool p1, address p2, uint256 p3) internal view
```

### log

```solidity
function log(bool p0, bool p1, address p2, string p3) internal view
```

### log

```solidity
function log(bool p0, bool p1, address p2, bool p3) internal view
```

### log

```solidity
function log(bool p0, bool p1, address p2, address p3) internal view
```

### log

```solidity
function log(bool p0, address p1, uint256 p2, uint256 p3) internal view
```

### log

```solidity
function log(bool p0, address p1, uint256 p2, string p3) internal view
```

### log

```solidity
function log(bool p0, address p1, uint256 p2, bool p3) internal view
```

### log

```solidity
function log(bool p0, address p1, uint256 p2, address p3) internal view
```

### log

```solidity
function log(bool p0, address p1, string p2, uint256 p3) internal view
```

### log

```solidity
function log(bool p0, address p1, string p2, string p3) internal view
```

### log

```solidity
function log(bool p0, address p1, string p2, bool p3) internal view
```

### log

```solidity
function log(bool p0, address p1, string p2, address p3) internal view
```

### log

```solidity
function log(bool p0, address p1, bool p2, uint256 p3) internal view
```

### log

```solidity
function log(bool p0, address p1, bool p2, string p3) internal view
```

### log

```solidity
function log(bool p0, address p1, bool p2, bool p3) internal view
```

### log

```solidity
function log(bool p0, address p1, bool p2, address p3) internal view
```

### log

```solidity
function log(bool p0, address p1, address p2, uint256 p3) internal view
```

### log

```solidity
function log(bool p0, address p1, address p2, string p3) internal view
```

### log

```solidity
function log(bool p0, address p1, address p2, bool p3) internal view
```

### log

```solidity
function log(bool p0, address p1, address p2, address p3) internal view
```

### log

```solidity
function log(address p0, uint256 p1, uint256 p2, uint256 p3) internal view
```

### log

```solidity
function log(address p0, uint256 p1, uint256 p2, string p3) internal view
```

### log

```solidity
function log(address p0, uint256 p1, uint256 p2, bool p3) internal view
```

### log

```solidity
function log(address p0, uint256 p1, uint256 p2, address p3) internal view
```

### log

```solidity
function log(address p0, uint256 p1, string p2, uint256 p3) internal view
```

### log

```solidity
function log(address p0, uint256 p1, string p2, string p3) internal view
```

### log

```solidity
function log(address p0, uint256 p1, string p2, bool p3) internal view
```

### log

```solidity
function log(address p0, uint256 p1, string p2, address p3) internal view
```

### log

```solidity
function log(address p0, uint256 p1, bool p2, uint256 p3) internal view
```

### log

```solidity
function log(address p0, uint256 p1, bool p2, string p3) internal view
```

### log

```solidity
function log(address p0, uint256 p1, bool p2, bool p3) internal view
```

### log

```solidity
function log(address p0, uint256 p1, bool p2, address p3) internal view
```

### log

```solidity
function log(address p0, uint256 p1, address p2, uint256 p3) internal view
```

### log

```solidity
function log(address p0, uint256 p1, address p2, string p3) internal view
```

### log

```solidity
function log(address p0, uint256 p1, address p2, bool p3) internal view
```

### log

```solidity
function log(address p0, uint256 p1, address p2, address p3) internal view
```

### log

```solidity
function log(address p0, string p1, uint256 p2, uint256 p3) internal view
```

### log

```solidity
function log(address p0, string p1, uint256 p2, string p3) internal view
```

### log

```solidity
function log(address p0, string p1, uint256 p2, bool p3) internal view
```

### log

```solidity
function log(address p0, string p1, uint256 p2, address p3) internal view
```

### log

```solidity
function log(address p0, string p1, string p2, uint256 p3) internal view
```

### log

```solidity
function log(address p0, string p1, string p2, string p3) internal view
```

### log

```solidity
function log(address p0, string p1, string p2, bool p3) internal view
```

### log

```solidity
function log(address p0, string p1, string p2, address p3) internal view
```

### log

```solidity
function log(address p0, string p1, bool p2, uint256 p3) internal view
```

### log

```solidity
function log(address p0, string p1, bool p2, string p3) internal view
```

### log

```solidity
function log(address p0, string p1, bool p2, bool p3) internal view
```

### log

```solidity
function log(address p0, string p1, bool p2, address p3) internal view
```

### log

```solidity
function log(address p0, string p1, address p2, uint256 p3) internal view
```

### log

```solidity
function log(address p0, string p1, address p2, string p3) internal view
```

### log

```solidity
function log(address p0, string p1, address p2, bool p3) internal view
```

### log

```solidity
function log(address p0, string p1, address p2, address p3) internal view
```

### log

```solidity
function log(address p0, bool p1, uint256 p2, uint256 p3) internal view
```

### log

```solidity
function log(address p0, bool p1, uint256 p2, string p3) internal view
```

### log

```solidity
function log(address p0, bool p1, uint256 p2, bool p3) internal view
```

### log

```solidity
function log(address p0, bool p1, uint256 p2, address p3) internal view
```

### log

```solidity
function log(address p0, bool p1, string p2, uint256 p3) internal view
```

### log

```solidity
function log(address p0, bool p1, string p2, string p3) internal view
```

### log

```solidity
function log(address p0, bool p1, string p2, bool p3) internal view
```

### log

```solidity
function log(address p0, bool p1, string p2, address p3) internal view
```

### log

```solidity
function log(address p0, bool p1, bool p2, uint256 p3) internal view
```

### log

```solidity
function log(address p0, bool p1, bool p2, string p3) internal view
```

### log

```solidity
function log(address p0, bool p1, bool p2, bool p3) internal view
```

### log

```solidity
function log(address p0, bool p1, bool p2, address p3) internal view
```

### log

```solidity
function log(address p0, bool p1, address p2, uint256 p3) internal view
```

### log

```solidity
function log(address p0, bool p1, address p2, string p3) internal view
```

### log

```solidity
function log(address p0, bool p1, address p2, bool p3) internal view
```

### log

```solidity
function log(address p0, bool p1, address p2, address p3) internal view
```

### log

```solidity
function log(address p0, address p1, uint256 p2, uint256 p3) internal view
```

### log

```solidity
function log(address p0, address p1, uint256 p2, string p3) internal view
```

### log

```solidity
function log(address p0, address p1, uint256 p2, bool p3) internal view
```

### log

```solidity
function log(address p0, address p1, uint256 p2, address p3) internal view
```

### log

```solidity
function log(address p0, address p1, string p2, uint256 p3) internal view
```

### log

```solidity
function log(address p0, address p1, string p2, string p3) internal view
```

### log

```solidity
function log(address p0, address p1, string p2, bool p3) internal view
```

### log

```solidity
function log(address p0, address p1, string p2, address p3) internal view
```

### log

```solidity
function log(address p0, address p1, bool p2, uint256 p3) internal view
```

### log

```solidity
function log(address p0, address p1, bool p2, string p3) internal view
```

### log

```solidity
function log(address p0, address p1, bool p2, bool p3) internal view
```

### log

```solidity
function log(address p0, address p1, bool p2, address p3) internal view
```

### log

```solidity
function log(address p0, address p1, address p2, uint256 p3) internal view
```

### log

```solidity
function log(address p0, address p1, address p2, string p3) internal view
```

### log

```solidity
function log(address p0, address p1, address p2, bool p3) internal view
```

### log

```solidity
function log(address p0, address p1, address p2, address p3) internal view
```

## Address

_Collection of functions related to the address type_

### isContract

```solidity
function isContract(address account) internal view returns (bool)
```

_Returns true if `account` is a contract.

[IMPORTANT]
====
It is unsafe to assume that an address for which this function returns
false is an externally-owned account (EOA) and not a contract.

Among others, `isContract` will return false for the following
types of addresses:

 - an externally-owned account
 - a contract in construction
 - an address where a contract will be created
 - an address where a contract lived, but was destroyed
====_

### sendValue

```solidity
function sendValue(address payable recipient, uint256 amount) internal
```

_Replacement for Solidity's `transfer`: sends `amount` wei to
`recipient`, forwarding all available gas and reverting on errors.

https://eips.ethereum.org/EIPS/eip-1884[EIP1884] increases the gas cost
of certain opcodes, possibly making contracts go over the 2300 gas limit
imposed by `transfer`, making them unable to receive funds via
`transfer`. {sendValue} removes this limitation.

https://diligence.consensys.net/posts/2019/09/stop-using-soliditys-transfer-now/[Learn more].

IMPORTANT: because control is transferred to `recipient`, care must be
taken to not create reentrancy vulnerabilities. Consider using
{ReentrancyGuard} or the
https://solidity.readthedocs.io/en/v0.5.11/security-considerations.html#use-the-checks-effects-interactions-pattern[checks-effects-interactions pattern]._

## Context

### _msgSender

```solidity
function _msgSender() internal view virtual returns (address payable)
```

### _msgData

```solidity
function _msgData() internal view virtual returns (bytes)
```

## IERC20

_Interface of the ERC20 standard as defined in the EIP._

### totalSupply

```solidity
function totalSupply() external view returns (uint256)
```

_Returns the amount of tokens in existence._

### balanceOf

```solidity
function balanceOf(address account) external view returns (uint256)
```

_Returns the amount of tokens owned by `account`._

### transfer

```solidity
function transfer(address recipient, uint256 amount) external returns (bool)
```

_Moves `amount` tokens from the caller's account to `recipient`.

Returns a boolean value indicating whether the operation succeeded.

Emits a {Transfer} event._

### allowance

```solidity
function allowance(address owner, address spender) external view returns (uint256)
```

_Returns the remaining number of tokens that `spender` will be
allowed to spend on behalf of `owner` through {transferFrom}. This is
zero by default.

This value changes when {approve} or {transferFrom} are called._

### approve

```solidity
function approve(address spender, uint256 amount) external returns (bool)
```

_Sets `amount` as the allowance of `spender` over the caller's tokens.

Returns a boolean value indicating whether the operation succeeded.

IMPORTANT: Beware that changing an allowance with this method brings the risk
that someone may use both the old and the new allowance by unfortunate
transaction ordering. One possible solution to mitigate this race
condition is to first reduce the spender's allowance to 0 and set the
desired value afterwards:
https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729

Emits an {Approval} event._

### transferFrom

```solidity
function transferFrom(address sender, address recipient, uint256 amount) external returns (bool)
```

_Moves `amount` tokens from `sender` to `recipient` using the
allowance mechanism. `amount` is then deducted from the caller's
allowance.

Returns a boolean value indicating whether the operation succeeded.

Emits a {Transfer} event._

### Transfer

```solidity
event Transfer(address from, address to, uint256 value)
```

_Emitted when `value` tokens are moved from one account (`from`) to
another (`to`).

Note that `value` may be zero._

### Approval

```solidity
event Approval(address owner, address spender, uint256 value)
```

_Emitted when the allowance of a `spender` for an `owner` is set by
a call to {approve}. `value` is the new allowance._

## IERC20Detailed

### name

```solidity
function name() external view returns (string)
```

### symbol

```solidity
function symbol() external view returns (string)
```

### decimals

```solidity
function decimals() external view returns (uint8)
```

## Ownable

_Contract module which provides a basic access control mechanism, where
there is an account (an owner) that can be granted exclusive access to
specific functions.

By default, the owner account will be the one that deploys the contract. This
can later be changed with {transferOwnership}.

This module is used through inheritance. It will make available the modifier
`onlyOwner`, which can be applied to your functions to restrict their use to
the owner._

### _owner

```solidity
address _owner
```

### OwnershipTransferred

```solidity
event OwnershipTransferred(address previousOwner, address newOwner)
```

### constructor

```solidity
constructor() internal
```

_Initializes the contract setting the deployer as the initial owner._

### owner

```solidity
function owner() public view returns (address)
```

_Returns the address of the current owner._

### onlyOwner

```solidity
modifier onlyOwner()
```

_Throws if called by any account other than the owner._

### renounceOwnership

```solidity
function renounceOwnership() public virtual
```

_Leaves the contract without owner. It will not be possible to call
`onlyOwner` functions anymore. Can only be called by the current owner.

NOTE: Renouncing ownership will leave the contract without an owner,
thereby removing any functionality that is only available to the owner._

### transferOwnership

```solidity
function transferOwnership(address newOwner) public virtual
```

_Transfers ownership of the contract to a new account (`newOwner`).
Can only be called by the current owner._

## SafeERC20

_Wrappers around ERC20 operations that throw on failure (when the token
contract returns false). Tokens that return no value (and instead revert or
throw on failure) are also supported, non-reverting calls are assumed to be
successful.
To use this library you can add a `using SafeERC20 for IERC20;` statement to your contract,
which allows you to call the safe operations as `token.safeTransfer(...)`, etc._

### safeTransfer

```solidity
function safeTransfer(contract IERC20 token, address to, uint256 value) internal
```

### safeTransferFrom

```solidity
function safeTransferFrom(contract IERC20 token, address from, address to, uint256 value) internal
```

### safeApprove

```solidity
function safeApprove(contract IERC20 token, address spender, uint256 value) internal
```

### callOptionalReturn

```solidity
function callOptionalReturn(contract IERC20 token, bytes data) private
```

## SafeMath

_Wrappers over Solidity's arithmetic operations with added overflow
checks.

Arithmetic operations in Solidity wrap on overflow. This can easily result
in bugs, because programmers usually assume that an overflow raises an
error, which is the standard behavior in high level programming languages.
`SafeMath` restores this intuition by reverting the transaction when an
operation overflows.

Using this library instead of the unchecked operations eliminates an entire
class of bugs, so it's recommended to use it always._

### add

```solidity
function add(uint256 a, uint256 b) internal pure returns (uint256)
```

_Returns the addition of two unsigned integers, reverting on
overflow.

Counterpart to Solidity's `+` operator.

Requirements:
- Addition cannot overflow._

### sub

```solidity
function sub(uint256 a, uint256 b) internal pure returns (uint256)
```

_Returns the subtraction of two unsigned integers, reverting on
overflow (when the result is negative).

Counterpart to Solidity's `-` operator.

Requirements:
- Subtraction cannot overflow._

### sub

```solidity
function sub(uint256 a, uint256 b, string errorMessage) internal pure returns (uint256)
```

_Returns the subtraction of two unsigned integers, reverting with custom message on
overflow (when the result is negative).

Counterpart to Solidity's `-` operator.

Requirements:
- Subtraction cannot overflow._

### mul

```solidity
function mul(uint256 a, uint256 b) internal pure returns (uint256)
```

_Returns the multiplication of two unsigned integers, reverting on
overflow.

Counterpart to Solidity's `*` operator.

Requirements:
- Multiplication cannot overflow._

### div

```solidity
function div(uint256 a, uint256 b) internal pure returns (uint256)
```

_Returns the integer division of two unsigned integers. Reverts on
division by zero. The result is rounded towards zero.

Counterpart to Solidity's `/` operator. Note: this function uses a
`revert` opcode (which leaves remaining gas untouched) while Solidity
uses an invalid opcode to revert (consuming all remaining gas).

Requirements:
- The divisor cannot be zero._

### div

```solidity
function div(uint256 a, uint256 b, string errorMessage) internal pure returns (uint256)
```

_Returns the integer division of two unsigned integers. Reverts with custom message on
division by zero. The result is rounded towards zero.

Counterpart to Solidity's `/` operator. Note: this function uses a
`revert` opcode (which leaves remaining gas untouched) while Solidity
uses an invalid opcode to revert (consuming all remaining gas).

Requirements:
- The divisor cannot be zero._

### mod

```solidity
function mod(uint256 a, uint256 b) internal pure returns (uint256)
```

_Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
Reverts when dividing by zero.

Counterpart to Solidity's `%` operator. This function uses a `revert`
opcode (which leaves remaining gas untouched) while Solidity uses an
invalid opcode to revert (consuming all remaining gas).

Requirements:
- The divisor cannot be zero._

### mod

```solidity
function mod(uint256 a, uint256 b, string errorMessage) internal pure returns (uint256)
```

_Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
Reverts with custom message when dividing by zero.

Counterpart to Solidity's `%` operator. This function uses a `revert`
opcode (which leaves remaining gas untouched) while Solidity uses an
invalid opcode to revert (consuming all remaining gas).

Requirements:
- The divisor cannot be zero._

## BaseUpgradeabilityProxy

_This contract implements a proxy that allows to change the
implementation address to which it will delegate.
Such a change is called an implementation upgrade._

### Upgraded

```solidity
event Upgraded(address implementation)
```

_Emitted when the implementation is upgraded._

| Name | Type | Description |
| ---- | ---- | ----------- |
| implementation | address | Address of the new implementation. |

### IMPLEMENTATION_SLOT

```solidity
bytes32 IMPLEMENTATION_SLOT
```

_Storage slot with the address of the current implementation.
This is the keccak-256 hash of "eip1967.proxy.implementation" subtracted by 1, and is
validated in the constructor._

### _implementation

```solidity
function _implementation() internal view returns (address impl)
```

_Returns the current implementation._

| Name | Type | Description |
| ---- | ---- | ----------- |
| impl | address | Address of the current implementation |

### _upgradeTo

```solidity
function _upgradeTo(address newImplementation) internal
```

_Upgrades the proxy to a new implementation._

| Name | Type | Description |
| ---- | ---- | ----------- |
| newImplementation | address | Address of the new implementation. |

### _setImplementation

```solidity
function _setImplementation(address newImplementation) internal
```

_Sets the implementation address of the proxy._

| Name | Type | Description |
| ---- | ---- | ----------- |
| newImplementation | address | Address of the new implementation. |

## InitializableUpgradeabilityProxy

_Extends BaseUpgradeabilityProxy with an initializer for initializing
implementation and init data._

### initialize

```solidity
function initialize(address _logic, bytes _data) public payable
```

_Contract initializer._

| Name | Type | Description |
| ---- | ---- | ----------- |
| _logic | address | Address of the initial implementation. |
| _data | bytes | Data to send as msg.data to the implementation to initialize the proxied contract. It should include the signature and the parameters of the function to be called, as described in https://solidity.readthedocs.io/en/v0.4.24/abi-spec.html#function-selector-and-argument-encoding. This parameter is optional, if no data is given the initialization call to proxied contract will be skipped. |

## Proxy

_Implements delegation of calls to other contracts, with proper
forwarding of return values and bubbling of failures.
It defines a fallback function that delegates all calls to the address
returned by the abstract _implementation() internal function._

### fallback

```solidity
fallback() external payable
```

_Fallback function.
Implemented entirely in `_fallback`._

### _implementation

```solidity
function _implementation() internal view virtual returns (address)
```

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The Address of the implementation. |

### _delegate

```solidity
function _delegate(address implementation) internal
```

_Delegates execution to an implementation contract.
This is a low level function that doesn't return to its internal call site.
It will return to the external caller whatever the implementation returns._

| Name | Type | Description |
| ---- | ---- | ----------- |
| implementation | address | Address to delegate. |

### _willFallback

```solidity
function _willFallback() internal virtual
```

_Function that is run as the first thing in the fallback function.
Can be redefined in derived contracts to add functionality.
Redefinitions must call super._willFallback()._

### _fallback

```solidity
function _fallback() internal
```

_fallback implementation.
Extracted to enable manual triggering._

## IFlashLoanReceiver

Interface for the Aave fee IFlashLoanReceiver.

_implement this interface to develop a flashloan-compatible flashLoanReceiver contract_

### executeOperation

```solidity
function executeOperation(address[] assets, uint256[] amounts, uint256[] premiums, address initiator, bytes params) external returns (bool)
```

### ADDRESSES_PROVIDER

```solidity
function ADDRESSES_PROVIDER() external view returns (contract ILendingPoolAddressesProvider)
```

### LENDING_POOL

```solidity
function LENDING_POOL() external view returns (contract ILendingPool)
```

## IAToken

### Mint

```solidity
event Mint(address from, uint256 value, uint256 index)
```

_Emitted after the mint action_

| Name | Type | Description |
| ---- | ---- | ----------- |
| from | address | The address performing the mint |
| value | uint256 | The amount being |
| index | uint256 | The new liquidity index of the reserve |

### mint

```solidity
function mint(address user, uint256 amount, uint256 index) external returns (bool)
```

_Mints `amount` aTokens to `user`_

| Name | Type | Description |
| ---- | ---- | ----------- |
| user | address | The address receiving the minted tokens |
| amount | uint256 | The amount of tokens getting minted |
| index | uint256 | The new liquidity index of the reserve |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | `true` if the the previous balance of the user was 0 |

### Burn

```solidity
event Burn(address from, address target, uint256 value, uint256 index)
```

_Emitted after aTokens are burned_

| Name | Type | Description |
| ---- | ---- | ----------- |
| from | address | The owner of the aTokens, getting them burned |
| target | address | The address that will receive the underlying |
| value | uint256 | The amount being burned |
| index | uint256 | The new liquidity index of the reserve |

### BalanceTransfer

```solidity
event BalanceTransfer(address from, address to, uint256 value, uint256 index)
```

_Emitted during the transfer action_

| Name | Type | Description |
| ---- | ---- | ----------- |
| from | address | The user whose tokens are being transferred |
| to | address | The recipient |
| value | uint256 | The amount being transferred |
| index | uint256 | The new liquidity index of the reserve |

### burn

```solidity
function burn(address user, address receiverOfUnderlying, uint256 amount, uint256 index) external
```

_Burns aTokens from `user` and sends the equivalent amount of underlying to `receiverOfUnderlying`_

| Name | Type | Description |
| ---- | ---- | ----------- |
| user | address | The owner of the aTokens, getting them burned |
| receiverOfUnderlying | address | The address that will receive the underlying |
| amount | uint256 | The amount being burned |
| index | uint256 | The new liquidity index of the reserve |

### mintToTreasury

```solidity
function mintToTreasury(uint256 amount, uint256 index) external
```

_Mints aTokens to the reserve treasury_

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount | uint256 | The amount of tokens getting minted |
| index | uint256 | The new liquidity index of the reserve |

### transferOnLiquidation

```solidity
function transferOnLiquidation(address from, address to, uint256 value) external
```

_Transfers aTokens in the event of a borrow being liquidated, in case the liquidators reclaims the aToken_

| Name | Type | Description |
| ---- | ---- | ----------- |
| from | address | The address getting liquidated, current owner of the aTokens |
| to | address | The recipient |
| value | uint256 | The amount of tokens getting transferred |

### transferUnderlyingTo

```solidity
function transferUnderlyingTo(address user, uint256 amount) external returns (uint256)
```

_Transfers the underlying asset to `target`. Used by the LendingPool to transfer
assets in borrow(), withdraw() and flashLoan()_

| Name | Type | Description |
| ---- | ---- | ----------- |
| user | address | The recipient of the aTokens |
| amount | uint256 | The amount getting transferred |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The amount transferred |

## ILendingPool

### Deposit

```solidity
event Deposit(address reserve, address user, address onBehalfOf, uint256 amount, uint16 referral)
```

_Emitted on deposit()_

| Name | Type | Description |
| ---- | ---- | ----------- |
| reserve | address | The address of the underlying asset of the reserve |
| user | address | The address initiating the deposit |
| onBehalfOf | address | The beneficiary of the deposit, receiving the aTokens |
| amount | uint256 | The amount deposited |
| referral | uint16 | The referral code used |

### Withdraw

```solidity
event Withdraw(address reserve, address user, address to, uint256 amount)
```

_Emitted on withdraw()_

| Name | Type | Description |
| ---- | ---- | ----------- |
| reserve | address | The address of the underlyng asset being withdrawn |
| user | address | The address initiating the withdrawal, owner of aTokens |
| to | address | Address that will receive the underlying |
| amount | uint256 | The amount to be withdrawn |

### Borrow

```solidity
event Borrow(address reserve, address user, address onBehalfOf, uint256 amount, uint256 borrowRateMode, uint256 borrowRate, uint16 referral)
```

_Emitted on borrow() and flashLoan() when debt needs to be opened_

| Name | Type | Description |
| ---- | ---- | ----------- |
| reserve | address | The address of the underlying asset being borrowed |
| user | address | The address of the user initiating the borrow(), receiving the funds on borrow() or just initiator of the transaction on flashLoan() |
| onBehalfOf | address | The address that will be getting the debt |
| amount | uint256 | The amount borrowed out |
| borrowRateMode | uint256 | The rate mode: 1 for Stable, 2 for Variable |
| borrowRate | uint256 | The numeric rate at which the user has borrowed |
| referral | uint16 | The referral code used |

### Repay

```solidity
event Repay(address reserve, address user, address repayer, uint256 amount)
```

_Emitted on repay()_

| Name | Type | Description |
| ---- | ---- | ----------- |
| reserve | address | The address of the underlying asset of the reserve |
| user | address | The beneficiary of the repayment, getting his debt reduced |
| repayer | address | The address of the user initiating the repay(), providing the funds |
| amount | uint256 | The amount repaid |

### Swap

```solidity
event Swap(address reserve, address user, uint256 rateMode)
```

_Emitted on swapBorrowRateMode()_

| Name | Type | Description |
| ---- | ---- | ----------- |
| reserve | address | The address of the underlying asset of the reserve |
| user | address | The address of the user swapping his rate mode |
| rateMode | uint256 | The rate mode that the user wants to swap to |

### ReserveUsedAsCollateralEnabled

```solidity
event ReserveUsedAsCollateralEnabled(address reserve, address user)
```

_Emitted on setUserUseReserveAsCollateral()_

| Name | Type | Description |
| ---- | ---- | ----------- |
| reserve | address | The address of the underlying asset of the reserve |
| user | address | The address of the user enabling the usage as collateral |

### ReserveUsedAsCollateralDisabled

```solidity
event ReserveUsedAsCollateralDisabled(address reserve, address user)
```

_Emitted on setUserUseReserveAsCollateral()_

| Name | Type | Description |
| ---- | ---- | ----------- |
| reserve | address | The address of the underlying asset of the reserve |
| user | address | The address of the user enabling the usage as collateral |

### RebalanceStableBorrowRate

```solidity
event RebalanceStableBorrowRate(address reserve, address user)
```

_Emitted on rebalanceStableBorrowRate()_

| Name | Type | Description |
| ---- | ---- | ----------- |
| reserve | address | The address of the underlying asset of the reserve |
| user | address | The address of the user for which the rebalance has been executed |

### FlashLoan

```solidity
event FlashLoan(address target, address initiator, address asset, uint256 amount, uint256 premium, uint16 referralCode)
```

_Emitted on flashLoan()_

| Name | Type | Description |
| ---- | ---- | ----------- |
| target | address | The address of the flash loan receiver contract |
| initiator | address | The address initiating the flash loan |
| asset | address | The address of the asset being flash borrowed |
| amount | uint256 | The amount flash borrowed |
| premium | uint256 | The fee flash borrowed |
| referralCode | uint16 | The referral code used |

### Paused

```solidity
event Paused()
```

_Emitted when the pause is triggered._

### Unpaused

```solidity
event Unpaused()
```

_Emitted when the pause is lifted._

### LiquidationCall

```solidity
event LiquidationCall(address collateralAsset, address debtAsset, address user, uint256 debtToCover, uint256 liquidatedCollateralAmount, address liquidator, bool receiveAToken)
```

_Emitted when a borrower is liquidated. This event is emitted by the LendingPool via
LendingPoolCollateral manager using a DELEGATECALL
This allows to have the events in the generated ABI for LendingPool._

| Name | Type | Description |
| ---- | ---- | ----------- |
| collateralAsset | address | The address of the underlying asset used as collateral, to receive as result of the liquidation |
| debtAsset | address | The address of the underlying borrowed asset to be repaid with the liquidation |
| user | address | The address of the borrower getting liquidated |
| debtToCover | uint256 | The debt amount of borrowed `asset` the liquidator wants to cover |
| liquidatedCollateralAmount | uint256 | The amount of collateral received by the liiquidator |
| liquidator | address | The address of the liquidator |
| receiveAToken | bool | `true` if the liquidators wants to receive the collateral aTokens, `false` if he wants to receive the underlying collateral asset directly |

### ReserveDataUpdated

```solidity
event ReserveDataUpdated(address reserve, uint256 liquidityRate, uint256 stableBorrowRate, uint256 variableBorrowRate, uint256 liquidityIndex, uint256 variableBorrowIndex)
```

_Emitted when the state of a reserve is updated. NOTE: This event is actually declared
in the ReserveLogic library and emitted in the updateInterestRates() function. Since the function is internal,
the event will actually be fired by the LendingPool contract. The event is therefore replicated here so it
gets added to the LendingPool ABI_

| Name | Type | Description |
| ---- | ---- | ----------- |
| reserve | address | The address of the underlying asset of the reserve |
| liquidityRate | uint256 | The new liquidity rate |
| stableBorrowRate | uint256 | The new stable borrow rate |
| variableBorrowRate | uint256 | The new variable borrow rate |
| liquidityIndex | uint256 | The new liquidity index |
| variableBorrowIndex | uint256 | The new variable borrow index |

### deposit

```solidity
function deposit(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external
```

_Deposits an `amount` of underlying asset into the reserve, receiving in return overlying aTokens.
- E.g. User deposits 100 USDC and gets in return 100 aUSDC_

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | The address of the underlying asset to deposit |
| amount | uint256 | The amount to be deposited |
| onBehalfOf | address | The address that will receive the aTokens, same as msg.sender if the user   wants to receive them on his own wallet, or a different address if the beneficiary of aTokens   is a different wallet |
| referralCode | uint16 | Code used to register the integrator originating the operation, for potential rewards.   0 if the action is executed directly by the user, without any middle-man |

### withdraw

```solidity
function withdraw(address asset, uint256 amount, address to) external returns (uint256)
```

_Withdraws an `amount` of underlying asset from the reserve, burning the equivalent aTokens owned
E.g. User has 100 aUSDC, calls withdraw() and receives 100 USDC, burning the 100 aUSDC_

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | The address of the underlying asset to withdraw |
| amount | uint256 | The underlying amount to be withdrawn   - Send the value type(uint256).max in order to withdraw the whole aToken balance |
| to | address | Address that will receive the underlying, same as msg.sender if the user   wants to receive it on his own wallet, or a different address if the beneficiary is a   different wallet |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The final amount withdrawn |

### borrow

```solidity
function borrow(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf) external
```

_Allows users to borrow a specific `amount` of the reserve underlying asset, provided that the borrower
already deposited enough collateral, or he was given enough allowance by a credit delegator on the
corresponding debt token (StableDebtToken or VariableDebtToken)
- E.g. User borrows 100 USDC passing as `onBehalfOf` his own address, receiving the 100 USDC in his wallet
  and 100 stable/variable debt tokens, depending on the `interestRateMode`_

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | The address of the underlying asset to borrow |
| amount | uint256 | The amount to be borrowed |
| interestRateMode | uint256 | The interest rate mode at which the user wants to borrow: 1 for Stable, 2 for Variable |
| referralCode | uint16 | Code used to register the integrator originating the operation, for potential rewards.   0 if the action is executed directly by the user, without any middle-man |
| onBehalfOf | address | Address of the user who will receive the debt. Should be the address of the borrower itself calling the function if he wants to borrow against his own collateral, or the address of the credit delegator if he has been given credit delegation allowance |

### repay

```solidity
function repay(address asset, uint256 amount, uint256 rateMode, address onBehalfOf) external returns (uint256)
```

Repays a borrowed `amount` on a specific reserve, burning the equivalent debt tokens owned
- E.g. User repays 100 USDC, burning 100 variable/stable debt tokens of the `onBehalfOf` address

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | The address of the borrowed underlying asset previously borrowed |
| amount | uint256 | The amount to repay - Send the value type(uint256).max in order to repay the whole debt for `asset` on the specific `debtMode` |
| rateMode | uint256 | The interest rate mode at of the debt the user wants to repay: 1 for Stable, 2 for Variable |
| onBehalfOf | address | Address of the user who will get his debt reduced/removed. Should be the address of the user calling the function if he wants to reduce/remove his own debt, or the address of any other other borrower whose debt should be removed |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The final amount repaid |

### swapBorrowRateMode

```solidity
function swapBorrowRateMode(address asset, uint256 rateMode) external
```

_Allows a borrower to swap his debt between stable and variable mode, or viceversa_

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | The address of the underlying asset borrowed |
| rateMode | uint256 | The rate mode that the user wants to swap to |

### rebalanceStableBorrowRate

```solidity
function rebalanceStableBorrowRate(address asset, address user) external
```

_Rebalances the stable interest rate of a user to the current stable rate defined on the reserve.
- Users can be rebalanced if the following conditions are satisfied:
    1. Usage ratio is above 95%
    2. the current deposit APY is below REBALANCE_UP_THRESHOLD * maxVariableBorrowRate, which means that too much has been
       borrowed at a stable rate and depositors are not earning enough_

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | The address of the underlying asset borrowed |
| user | address | The address of the user to be rebalanced |

### setUserUseReserveAsCollateral

```solidity
function setUserUseReserveAsCollateral(address asset, bool useAsCollateral) external
```

_Allows depositors to enable/disable a specific deposited asset as collateral_

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | The address of the underlying asset deposited |
| useAsCollateral | bool | `true` if the user wants to use the deposit as collateral, `false` otherwise |

### liquidationCall

```solidity
function liquidationCall(address collateralAsset, address debtAsset, address user, uint256 debtToCover, bool receiveAToken) external
```

_Function to liquidate a non-healthy position collateral-wise, with Health Factor below 1
- The caller (liquidator) covers `debtToCover` amount of debt of the user getting liquidated, and receives
  a proportionally amount of the `collateralAsset` plus a bonus to cover market risk_

| Name | Type | Description |
| ---- | ---- | ----------- |
| collateralAsset | address | The address of the underlying asset used as collateral, to receive as result of the liquidation |
| debtAsset | address | The address of the underlying borrowed asset to be repaid with the liquidation |
| user | address | The address of the borrower getting liquidated |
| debtToCover | uint256 | The debt amount of borrowed `asset` the liquidator wants to cover |
| receiveAToken | bool | `true` if the liquidators wants to receive the collateral aTokens, `false` if he wants to receive the underlying collateral asset directly |

### flashLoan

```solidity
function flashLoan(address receiverAddress, address[] assets, uint256[] amounts, uint256[] modes, address onBehalfOf, bytes params, uint16 referralCode) external
```

_Allows smartcontracts to access the liquidity of the pool within one transaction,
as long as the amount taken plus a fee is returned.
IMPORTANT There are security concerns for developers of flashloan receiver contracts that must be kept into consideration.
For further details please visit https://developers.aave.com_

| Name | Type | Description |
| ---- | ---- | ----------- |
| receiverAddress | address | The address of the contract receiving the funds, implementing the IFlashLoanReceiver interface |
| assets | address[] | The addresses of the assets being flash-borrowed |
| amounts | uint256[] | The amounts amounts being flash-borrowed |
| modes | uint256[] | Types of the debt to open if the flash loan is not returned:   0 -> Don't open any debt, just revert if funds can't be transferred from the receiver   1 -> Open debt at stable rate for the value of the amount flash-borrowed to the `onBehalfOf` address   2 -> Open debt at variable rate for the value of the amount flash-borrowed to the `onBehalfOf` address |
| onBehalfOf | address | The address  that will receive the debt in the case of using on `modes` 1 or 2 |
| params | bytes | Variadic packed params to pass to the receiver as extra information |
| referralCode | uint16 | Code used to register the integrator originating the operation, for potential rewards.   0 if the action is executed directly by the user, without any middle-man |

### getUserAccountData

```solidity
function getUserAccountData(address user) external view returns (uint256 totalCollateralETH, uint256 totalDebtETH, uint256 availableBorrowsETH, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor)
```

_Returns the user account data across all the reserves_

| Name | Type | Description |
| ---- | ---- | ----------- |
| user | address | The address of the user |

| Name | Type | Description |
| ---- | ---- | ----------- |
| totalCollateralETH | uint256 | the total collateral in ETH of the user |
| totalDebtETH | uint256 | the total debt in ETH of the user |
| availableBorrowsETH | uint256 | the borrowing power left of the user |
| currentLiquidationThreshold | uint256 | the liquidation threshold of the user |
| ltv | uint256 | the loan to value of the user |
| healthFactor | uint256 | the current health factor of the user |

### initReserve

```solidity
function initReserve(address reserve, address aTokenAddress, address stableDebtAddress, address variableDebtAddress, address interestRateStrategyAddress) external
```

### setReserveInterestRateStrategyAddress

```solidity
function setReserveInterestRateStrategyAddress(address reserve, address rateStrategyAddress) external
```

### setConfiguration

```solidity
function setConfiguration(address reserve, uint256 configuration) external
```

### getConfiguration

```solidity
function getConfiguration(address asset) external view returns (struct DataTypes.ReserveConfigurationMap)
```

_Returns the configuration of the reserve_

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | The address of the underlying asset of the reserve |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct DataTypes.ReserveConfigurationMap | The configuration of the reserve |

### getUserConfiguration

```solidity
function getUserConfiguration(address user) external view returns (struct DataTypes.UserConfigurationMap)
```

_Returns the configuration of the user across all the reserves_

| Name | Type | Description |
| ---- | ---- | ----------- |
| user | address | The user address |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct DataTypes.UserConfigurationMap | The configuration of the user |

### getReserveNormalizedIncome

```solidity
function getReserveNormalizedIncome(address asset) external view returns (uint256)
```

_Returns the normalized income normalized income of the reserve_

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | The address of the underlying asset of the reserve |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The reserve's normalized income |

### getReserveNormalizedVariableDebt

```solidity
function getReserveNormalizedVariableDebt(address asset) external view returns (uint256)
```

_Returns the normalized variable debt per unit of asset_

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | The address of the underlying asset of the reserve |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The reserve normalized variable debt |

### getReserveData

```solidity
function getReserveData(address asset) external view returns (struct DataTypes.ReserveData)
```

_Returns the state and configuration of the reserve_

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | The address of the underlying asset of the reserve |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct DataTypes.ReserveData | The state of the reserve |

### finalizeTransfer

```solidity
function finalizeTransfer(address asset, address from, address to, uint256 amount, uint256 balanceFromAfter, uint256 balanceToBefore) external
```

### getReservesList

```solidity
function getReservesList() external view returns (address[])
```

### getAddressesProvider

```solidity
function getAddressesProvider() external view returns (contract ILendingPoolAddressesProvider)
```

### setPause

```solidity
function setPause(bool val) external
```

### paused

```solidity
function paused() external view returns (bool)
```

## ILendingPoolAddressesProvider

_Main registry of addresses part of or connected to the protocol, including permissioned roles
- Acting also as factory of proxies and admin of those, so with right to change its implementations
- Owned by the Aave Governance_

### MarketIdSet

```solidity
event MarketIdSet(string newMarketId)
```

### LendingPoolUpdated

```solidity
event LendingPoolUpdated(address newAddress)
```

### ConfigurationAdminUpdated

```solidity
event ConfigurationAdminUpdated(address newAddress)
```

### EmergencyAdminUpdated

```solidity
event EmergencyAdminUpdated(address newAddress)
```

### LendingPoolConfiguratorUpdated

```solidity
event LendingPoolConfiguratorUpdated(address newAddress)
```

### LendingPoolCollateralManagerUpdated

```solidity
event LendingPoolCollateralManagerUpdated(address newAddress)
```

### PriceOracleUpdated

```solidity
event PriceOracleUpdated(address newAddress)
```

### LendingRateOracleUpdated

```solidity
event LendingRateOracleUpdated(address newAddress)
```

### ProxyCreated

```solidity
event ProxyCreated(bytes32 id, address newAddress)
```

### AddressSet

```solidity
event AddressSet(bytes32 id, address newAddress, bool hasProxy)
```

### getMarketId

```solidity
function getMarketId() external view returns (string)
```

### setMarketId

```solidity
function setMarketId(string marketId) external
```

### setAddress

```solidity
function setAddress(bytes32 id, address newAddress) external
```

### setAddressAsProxy

```solidity
function setAddressAsProxy(bytes32 id, address impl) external
```

### getAddress

```solidity
function getAddress(bytes32 id) external view returns (address)
```

### getLendingPool

```solidity
function getLendingPool() external view returns (address)
```

### setLendingPoolImpl

```solidity
function setLendingPoolImpl(address pool) external
```

### getLendingPoolConfigurator

```solidity
function getLendingPoolConfigurator() external view returns (address)
```

### setLendingPoolConfiguratorImpl

```solidity
function setLendingPoolConfiguratorImpl(address configurator) external
```

### getLendingPoolCollateralManager

```solidity
function getLendingPoolCollateralManager() external view returns (address)
```

### setLendingPoolCollateralManager

```solidity
function setLendingPoolCollateralManager(address manager) external
```

### getPoolAdmin

```solidity
function getPoolAdmin() external view returns (address)
```

### setPoolAdmin

```solidity
function setPoolAdmin(address admin) external
```

### getEmergencyAdmin

```solidity
function getEmergencyAdmin() external view returns (address)
```

### setEmergencyAdmin

```solidity
function setEmergencyAdmin(address admin) external
```

### getPriceOracle

```solidity
function getPriceOracle() external view returns (address)
```

### setPriceOracle

```solidity
function setPriceOracle(address priceOracle) external
```

### getLendingRateOracle

```solidity
function getLendingRateOracle() external view returns (address)
```

### setLendingRateOracle

```solidity
function setLendingRateOracle(address lendingRateOracle) external
```

## IPriceOracleGetter

Interface for the Aave price oracle.

### getAssetPrice

```solidity
function getAssetPrice(address asset) external view returns (uint256)
```

_returns the asset price in ETH_

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | the address of the asset |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | the ETH price of the asset |

## IReserveInterestRateStrategy

_Interface for the calculation of the interest rates_

### baseVariableBorrowRate

```solidity
function baseVariableBorrowRate() external view returns (uint256)
```

### getMaxVariableBorrowRate

```solidity
function getMaxVariableBorrowRate() external view returns (uint256)
```

### calculateInterestRates

```solidity
function calculateInterestRates(address reserve, uint256 utilizationRate, uint256 totalStableDebt, uint256 totalVariableDebt, uint256 averageStableBorrowRate, uint256 reserveFactor) external view returns (uint256 liquidityRate, uint256 stableBorrowRate, uint256 variableBorrowRate)
```

## IScaledBalanceToken

### scaledBalanceOf

```solidity
function scaledBalanceOf(address user) external view returns (uint256)
```

_Returns the scaled balance of the user. The scaled balance is the sum of all the
updated stored balance divided by the reserve's liquidity index at the moment of the update_

| Name | Type | Description |
| ---- | ---- | ----------- |
| user | address | The user whose balance is calculated |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The scaled balance of the user |

### getScaledUserBalanceAndSupply

```solidity
function getScaledUserBalanceAndSupply(address user) external view returns (uint256, uint256)
```

_Returns the scaled balance of the user and the scaled total supply._

| Name | Type | Description |
| ---- | ---- | ----------- |
| user | address | The address of the user |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The scaled balance of the user |
| [1] | uint256 | The scaled balance and the scaled total supply |

### scaledTotalSupply

```solidity
function scaledTotalSupply() external view returns (uint256)
```

_Returns the scaled total supply of the variable debt token. Represents sum(debt/index)_

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The scaled total supply |

## IStableDebtToken

Defines the interface for the stable debt token

_It does not inherit from IERC20 to save in code size_

### Mint

```solidity
event Mint(address user, address onBehalfOf, uint256 amount, uint256 currentBalance, uint256 balanceIncrease, uint256 newRate, uint256 avgStableRate, uint256 newTotalSupply)
```

_Emitted when new stable debt is minted_

| Name | Type | Description |
| ---- | ---- | ----------- |
| user | address | The address of the user who triggered the minting |
| onBehalfOf | address | The recipient of stable debt tokens |
| amount | uint256 | The amount minted |
| currentBalance | uint256 | The current balance of the user |
| balanceIncrease | uint256 | The increase in balance since the last action of the user |
| newRate | uint256 | The rate of the debt after the minting |
| avgStableRate | uint256 | The new average stable rate after the minting |
| newTotalSupply | uint256 | The new total supply of the stable debt token after the action |

### Burn

```solidity
event Burn(address user, uint256 amount, uint256 currentBalance, uint256 balanceIncrease, uint256 avgStableRate, uint256 newTotalSupply)
```

_Emitted when new stable debt is burned_

| Name | Type | Description |
| ---- | ---- | ----------- |
| user | address | The address of the user |
| amount | uint256 | The amount being burned |
| currentBalance | uint256 | The current balance of the user |
| balanceIncrease | uint256 | The the increase in balance since the last action of the user |
| avgStableRate | uint256 | The new average stable rate after the burning |
| newTotalSupply | uint256 | The new total supply of the stable debt token after the action |

### mint

```solidity
function mint(address user, address onBehalfOf, uint256 amount, uint256 rate) external returns (bool)
```

_Mints debt token to the `onBehalfOf` address.
- The resulting rate is the weighted average between the rate of the new debt
and the rate of the previous debt_

| Name | Type | Description |
| ---- | ---- | ----------- |
| user | address | The address receiving the borrowed underlying, being the delegatee in case of credit delegate, or same as `onBehalfOf` otherwise |
| onBehalfOf | address | The address receiving the debt tokens |
| amount | uint256 | The amount of debt tokens to mint |
| rate | uint256 | The rate of the debt being minted |

### burn

```solidity
function burn(address user, uint256 amount) external
```

_Burns debt of `user`
- The resulting rate is the weighted average between the rate of the new debt
and the rate of the previous debt_

| Name | Type | Description |
| ---- | ---- | ----------- |
| user | address | The address of the user getting his debt burned |
| amount | uint256 | The amount of debt tokens getting burned |

### getAverageStableRate

```solidity
function getAverageStableRate() external view returns (uint256)
```

_Returns the average rate of all the stable rate loans._

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The average stable rate |

### getUserStableRate

```solidity
function getUserStableRate(address user) external view returns (uint256)
```

_Returns the stable rate of the user debt_

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The stable rate of the user |

### getUserLastUpdated

```solidity
function getUserLastUpdated(address user) external view returns (uint40)
```

_Returns the timestamp of the last update of the user_

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint40 | The timestamp |

### getSupplyData

```solidity
function getSupplyData() external view returns (uint256, uint256, uint256, uint40)
```

_Returns the principal, the total supply and the average stable rate_

### getTotalSupplyLastUpdated

```solidity
function getTotalSupplyLastUpdated() external view returns (uint40)
```

_Returns the timestamp of the last update of the total supply_

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint40 | The timestamp |

### getTotalSupplyAndAvgRate

```solidity
function getTotalSupplyAndAvgRate() external view returns (uint256, uint256)
```

_Returns the total supply and the average stable rate_

### principalBalanceOf

```solidity
function principalBalanceOf(address user) external view returns (uint256)
```

_Returns the principal debt balance of the user_

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The debt balance of the user since the last burn/mint action |

## IVariableDebtToken

Defines the basic interface for a variable debt token.

### Mint

```solidity
event Mint(address from, address onBehalfOf, uint256 value, uint256 index)
```

_Emitted after the mint action_

| Name | Type | Description |
| ---- | ---- | ----------- |
| from | address | The address performing the mint |
| onBehalfOf | address | The address of the user on which behalf minting has been performed |
| value | uint256 | The amount to be minted |
| index | uint256 | The last index of the reserve |

### mint

```solidity
function mint(address user, address onBehalfOf, uint256 amount, uint256 index) external returns (bool)
```

_Mints debt token to the `onBehalfOf` address_

| Name | Type | Description |
| ---- | ---- | ----------- |
| user | address | The address receiving the borrowed underlying, being the delegatee in case of credit delegate, or same as `onBehalfOf` otherwise |
| onBehalfOf | address | The address receiving the debt tokens |
| amount | uint256 | The amount of debt being minted |
| index | uint256 | The variable debt index of the reserve |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | `true` if the the previous balance of the user is 0 |

### Burn

```solidity
event Burn(address user, uint256 amount, uint256 index)
```

_Emitted when variable debt is burnt_

| Name | Type | Description |
| ---- | ---- | ----------- |
| user | address | The user which debt has been burned |
| amount | uint256 | The amount of debt being burned |
| index | uint256 | The index of the user |

### burn

```solidity
function burn(address user, uint256 amount, uint256 index) external
```

_Burns user variable debt_

| Name | Type | Description |
| ---- | ---- | ----------- |
| user | address | The user which debt is burnt |
| amount | uint256 |  |
| index | uint256 | The variable debt index of the reserve |

## AaveProtocolDataProvider

### MKR

```solidity
address MKR
```

### ETH

```solidity
address ETH
```

### TokenData

```solidity
struct TokenData {
  string symbol;
  address tokenAddress;
}
```

### ADDRESSES_PROVIDER

```solidity
contract ILendingPoolAddressesProvider ADDRESSES_PROVIDER
```

### constructor

```solidity
constructor(contract ILendingPoolAddressesProvider addressesProvider) public
```

### getAllReservesTokens

```solidity
function getAllReservesTokens() external view returns (struct AaveProtocolDataProvider.TokenData[])
```

### getAllATokens

```solidity
function getAllATokens() external view returns (struct AaveProtocolDataProvider.TokenData[])
```

### getReserveConfigurationData

```solidity
function getReserveConfigurationData(address asset) external view returns (uint256 decimals, uint256 ltv, uint256 liquidationThreshold, uint256 liquidationBonus, uint256 reserveFactor, bool usageAsCollateralEnabled, bool borrowingEnabled, bool stableBorrowRateEnabled, bool isActive, bool isFrozen)
```

### getReserveData

```solidity
function getReserveData(address asset) external view returns (uint256 availableLiquidity, uint256 totalStableDebt, uint256 totalVariableDebt, uint256 liquidityRate, uint256 variableBorrowRate, uint256 stableBorrowRate, uint256 averageStableBorrowRate, uint256 liquidityIndex, uint256 variableBorrowIndex, uint40 lastUpdateTimestamp)
```

### getUserReserveData

```solidity
function getUserReserveData(address asset, address user) external view returns (uint256 currentATokenBalance, uint256 currentStableDebt, uint256 currentVariableDebt, uint256 principalStableDebt, uint256 scaledVariableDebt, uint256 stableBorrowRate, uint256 liquidityRate, uint40 stableRateLastUpdated, bool usageAsCollateralEnabled)
```

### getReserveTokensAddresses

```solidity
function getReserveTokensAddresses(address asset) external view returns (address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress)
```

## LendingPoolAddressesProvider

_Main registry of addresses part of or connected to the protocol, including permissioned roles
- Acting also as factory of proxies and admin of those, so with right to change its implementations
- Owned by the Aave Governance_

### _marketId

```solidity
string _marketId
```

### _addresses

```solidity
mapping(bytes32 => address) _addresses
```

### LENDING_POOL

```solidity
bytes32 LENDING_POOL
```

### LENDING_POOL_CONFIGURATOR

```solidity
bytes32 LENDING_POOL_CONFIGURATOR
```

### POOL_ADMIN

```solidity
bytes32 POOL_ADMIN
```

### EMERGENCY_ADMIN

```solidity
bytes32 EMERGENCY_ADMIN
```

### LENDING_POOL_COLLATERAL_MANAGER

```solidity
bytes32 LENDING_POOL_COLLATERAL_MANAGER
```

### PRICE_ORACLE

```solidity
bytes32 PRICE_ORACLE
```

### LENDING_RATE_ORACLE

```solidity
bytes32 LENDING_RATE_ORACLE
```

### constructor

```solidity
constructor(string marketId) public
```

### getMarketId

```solidity
function getMarketId() external view returns (string)
```

_Returns the id of the Aave market to which this contracts points to_

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string | The market id |

### setMarketId

```solidity
function setMarketId(string marketId) external
```

_Allows to set the market which this LendingPoolAddressesProvider represents_

| Name | Type | Description |
| ---- | ---- | ----------- |
| marketId | string | The market id |

### setAddressAsProxy

```solidity
function setAddressAsProxy(bytes32 id, address implementationAddress) external
```

_General function to update the implementation of a proxy registered with
certain `id`. If there is no proxy registered, it will instantiate one and
set as implementation the `implementationAddress`
IMPORTANT Use this function carefully, only for ids that don't have an explicit
setter function, in order to avoid unexpected consequences_

| Name | Type | Description |
| ---- | ---- | ----------- |
| id | bytes32 | The id |
| implementationAddress | address | The address of the new implementation |

### setAddress

```solidity
function setAddress(bytes32 id, address newAddress) external
```

_Sets an address for an id replacing the address saved in the addresses map
IMPORTANT Use this function carefully, as it will do a hard replacement_

| Name | Type | Description |
| ---- | ---- | ----------- |
| id | bytes32 | The id |
| newAddress | address | The address to set |

### getAddress

```solidity
function getAddress(bytes32 id) public view returns (address)
```

_Returns an address by id_

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The address |

### getLendingPool

```solidity
function getLendingPool() external view returns (address)
```

_Returns the address of the LendingPool proxy_

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The LendingPool proxy address |

### setLendingPoolImpl

```solidity
function setLendingPoolImpl(address pool) external
```

_Updates the implementation of the LendingPool, or creates the proxy
setting the new `pool` implementation on the first time calling it_

| Name | Type | Description |
| ---- | ---- | ----------- |
| pool | address | The new LendingPool implementation |

### getLendingPoolConfigurator

```solidity
function getLendingPoolConfigurator() external view returns (address)
```

_Returns the address of the LendingPoolConfigurator proxy_

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The LendingPoolConfigurator proxy address |

### setLendingPoolConfiguratorImpl

```solidity
function setLendingPoolConfiguratorImpl(address configurator) external
```

_Updates the implementation of the LendingPoolConfigurator, or creates the proxy
setting the new `configurator` implementation on the first time calling it_

| Name | Type | Description |
| ---- | ---- | ----------- |
| configurator | address | The new LendingPoolConfigurator implementation |

### getLendingPoolCollateralManager

```solidity
function getLendingPoolCollateralManager() external view returns (address)
```

_Returns the address of the LendingPoolCollateralManager. Since the manager is used
through delegateCall within the LendingPool contract, the proxy contract pattern does not work properly hence
the addresses are changed directly_

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The address of the LendingPoolCollateralManager |

### setLendingPoolCollateralManager

```solidity
function setLendingPoolCollateralManager(address manager) external
```

_Updates the address of the LendingPoolCollateralManager_

| Name | Type | Description |
| ---- | ---- | ----------- |
| manager | address | The new LendingPoolCollateralManager address |

### getPoolAdmin

```solidity
function getPoolAdmin() external view returns (address)
```

_The functions below are getters/setters of addresses that are outside the context
of the protocol hence the upgradable proxy pattern is not used_

### setPoolAdmin

```solidity
function setPoolAdmin(address admin) external
```

### getEmergencyAdmin

```solidity
function getEmergencyAdmin() external view returns (address)
```

### setEmergencyAdmin

```solidity
function setEmergencyAdmin(address emergencyAdmin) external
```

### getPriceOracle

```solidity
function getPriceOracle() external view returns (address)
```

### setPriceOracle

```solidity
function setPriceOracle(address priceOracle) external
```

### getLendingRateOracle

```solidity
function getLendingRateOracle() external view returns (address)
```

### setLendingRateOracle

```solidity
function setLendingRateOracle(address lendingRateOracle) external
```

### _updateImpl

```solidity
function _updateImpl(bytes32 id, address newAddress) internal
```

_Internal function to update the implementation of a specific proxied component of the protocol
- If there is no proxy registered in the given `id`, it creates the proxy setting `newAdress`
  as implementation and calls the initialize() function on the proxy
- If there is already a proxy registered, it just updates the implementation to `newAddress` and
  calls the initialize() function via upgradeToAndCall() in the proxy_

| Name | Type | Description |
| ---- | ---- | ----------- |
| id | bytes32 | The id of the proxy to be updated |
| newAddress | address | The address of the new implementation |

### _setMarketId

```solidity
function _setMarketId(string marketId) internal
```

## LendingPool

_Main point of interaction with an Aave protocol's market
- Users can:
  # Deposit
  # Withdraw
  # Borrow
  # Repay
  # Swap their loans between variable and stable rate
  # Enable/disable their deposits as collateral rebalance stable rate borrow positions
  # Liquidate positions
  # Execute Flash Loans
- To be covered by a proxy contract, owned by the LendingPoolAddressesProvider of the specific market
- All admin functions are callable by the LendingPoolConfigurator contract defined also in the
  LendingPoolAddressesProvider_

### MAX_STABLE_RATE_BORROW_SIZE_PERCENT

```solidity
uint256 MAX_STABLE_RATE_BORROW_SIZE_PERCENT
```

### FLASHLOAN_PREMIUM_TOTAL

```solidity
uint256 FLASHLOAN_PREMIUM_TOTAL
```

### MAX_NUMBER_RESERVES

```solidity
uint256 MAX_NUMBER_RESERVES
```

### LENDINGPOOL_REVISION

```solidity
uint256 LENDINGPOOL_REVISION
```

### whenNotPaused

```solidity
modifier whenNotPaused()
```

### onlyLendingPoolConfigurator

```solidity
modifier onlyLendingPoolConfigurator()
```

### _whenNotPaused

```solidity
function _whenNotPaused() internal view
```

### _onlyLendingPoolConfigurator

```solidity
function _onlyLendingPoolConfigurator() internal view
```

### getRevision

```solidity
function getRevision() internal pure returns (uint256)
```

_returns the revision number of the contract
Needs to be defined in the inherited class as a constant._

### initialize

```solidity
function initialize(contract ILendingPoolAddressesProvider provider) public
```

_Function is invoked by the proxy contract when the LendingPool contract is added to the
LendingPoolAddressesProvider of the market.
- Caching the address of the LendingPoolAddressesProvider in order to reduce gas consumption
  on subsequent operations_

| Name | Type | Description |
| ---- | ---- | ----------- |
| provider | contract ILendingPoolAddressesProvider | The address of the LendingPoolAddressesProvider |

### deposit

```solidity
function deposit(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external
```

_Deposits an `amount` of underlying asset into the reserve, receiving in return overlying aTokens.
- E.g. User deposits 100 USDC and gets in return 100 aUSDC_

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | The address of the underlying asset to deposit |
| amount | uint256 | The amount to be deposited |
| onBehalfOf | address | The address that will receive the aTokens, same as msg.sender if the user   wants to receive them on his own wallet, or a different address if the beneficiary of aTokens   is a different wallet |
| referralCode | uint16 | Code used to register the integrator originating the operation, for potential rewards.   0 if the action is executed directly by the user, without any middle-man |

### withdraw

```solidity
function withdraw(address asset, uint256 amount, address to) external returns (uint256)
```

_Withdraws an `amount` of underlying asset from the reserve, burning the equivalent aTokens owned
E.g. User has 100 aUSDC, calls withdraw() and receives 100 USDC, burning the 100 aUSDC_

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | The address of the underlying asset to withdraw |
| amount | uint256 | The underlying amount to be withdrawn   - Send the value type(uint256).max in order to withdraw the whole aToken balance |
| to | address | Address that will receive the underlying, same as msg.sender if the user   wants to receive it on his own wallet, or a different address if the beneficiary is a   different wallet |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The final amount withdrawn |

### borrow

```solidity
function borrow(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf) external
```

_Allows users to borrow a specific `amount` of the reserve underlying asset, provided that the borrower
already deposited enough collateral, or he was given enough allowance by a credit delegator on the
corresponding debt token (StableDebtToken or VariableDebtToken)
- E.g. User borrows 100 USDC passing as `onBehalfOf` his own address, receiving the 100 USDC in his wallet
  and 100 stable/variable debt tokens, depending on the `interestRateMode`_

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | The address of the underlying asset to borrow |
| amount | uint256 | The amount to be borrowed |
| interestRateMode | uint256 | The interest rate mode at which the user wants to borrow: 1 for Stable, 2 for Variable |
| referralCode | uint16 | Code used to register the integrator originating the operation, for potential rewards.   0 if the action is executed directly by the user, without any middle-man |
| onBehalfOf | address | Address of the user who will receive the debt. Should be the address of the borrower itself calling the function if he wants to borrow against his own collateral, or the address of the credit delegator if he has been given credit delegation allowance |

### repay

```solidity
function repay(address asset, uint256 amount, uint256 rateMode, address onBehalfOf) external returns (uint256)
```

Repays a borrowed `amount` on a specific reserve, burning the equivalent debt tokens owned
- E.g. User repays 100 USDC, burning 100 variable/stable debt tokens of the `onBehalfOf` address

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | The address of the borrowed underlying asset previously borrowed |
| amount | uint256 | The amount to repay - Send the value type(uint256).max in order to repay the whole debt for `asset` on the specific `debtMode` |
| rateMode | uint256 | The interest rate mode at of the debt the user wants to repay: 1 for Stable, 2 for Variable |
| onBehalfOf | address | Address of the user who will get his debt reduced/removed. Should be the address of the user calling the function if he wants to reduce/remove his own debt, or the address of any other other borrower whose debt should be removed |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The final amount repaid |

### swapBorrowRateMode

```solidity
function swapBorrowRateMode(address asset, uint256 rateMode) external
```

_Allows a borrower to swap his debt between stable and variable mode, or viceversa_

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | The address of the underlying asset borrowed |
| rateMode | uint256 | The rate mode that the user wants to swap to |

### rebalanceStableBorrowRate

```solidity
function rebalanceStableBorrowRate(address asset, address user) external
```

_Rebalances the stable interest rate of a user to the current stable rate defined on the reserve.
- Users can be rebalanced if the following conditions are satisfied:
    1. Usage ratio is above 95%
    2. the current deposit APY is below REBALANCE_UP_THRESHOLD * maxVariableBorrowRate, which means that too much has been
       borrowed at a stable rate and depositors are not earning enough_

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | The address of the underlying asset borrowed |
| user | address | The address of the user to be rebalanced |

### setUserUseReserveAsCollateral

```solidity
function setUserUseReserveAsCollateral(address asset, bool useAsCollateral) external
```

_Allows depositors to enable/disable a specific deposited asset as collateral_

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | The address of the underlying asset deposited |
| useAsCollateral | bool | `true` if the user wants to use the deposit as collateral, `false` otherwise |

### liquidationCall

```solidity
function liquidationCall(address collateralAsset, address debtAsset, address user, uint256 debtToCover, bool receiveAToken) external
```

_Function to liquidate a non-healthy position collateral-wise, with Health Factor below 1
- The caller (liquidator) covers `debtToCover` amount of debt of the user getting liquidated, and receives
  a proportionally amount of the `collateralAsset` plus a bonus to cover market risk_

| Name | Type | Description |
| ---- | ---- | ----------- |
| collateralAsset | address | The address of the underlying asset used as collateral, to receive as result of the liquidation |
| debtAsset | address | The address of the underlying borrowed asset to be repaid with the liquidation |
| user | address | The address of the borrower getting liquidated |
| debtToCover | uint256 | The debt amount of borrowed `asset` the liquidator wants to cover |
| receiveAToken | bool | `true` if the liquidators wants to receive the collateral aTokens, `false` if he wants to receive the underlying collateral asset directly |

### FlashLoanLocalVars

```solidity
struct FlashLoanLocalVars {
  contract IFlashLoanReceiver receiver;
  address oracle;
  uint256 i;
  address currentAsset;
  address currentATokenAddress;
  uint256 currentAmount;
  uint256 currentPremium;
  uint256 currentAmountPlusPremium;
  address debtToken;
}
```

### flashLoan

```solidity
function flashLoan(address receiverAddress, address[] assets, uint256[] amounts, uint256[] modes, address onBehalfOf, bytes params, uint16 referralCode) external
```

_Allows smartcontracts to access the liquidity of the pool within one transaction,
as long as the amount taken plus a fee is returned.
IMPORTANT There are security concerns for developers of flashloan receiver contracts that must be kept into consideration.
For further details please visit https://developers.aave.com_

| Name | Type | Description |
| ---- | ---- | ----------- |
| receiverAddress | address | The address of the contract receiving the funds, implementing the IFlashLoanReceiver interface |
| assets | address[] | The addresses of the assets being flash-borrowed |
| amounts | uint256[] | The amounts amounts being flash-borrowed |
| modes | uint256[] | Types of the debt to open if the flash loan is not returned:   0 -> Don't open any debt, just revert if funds can't be transferred from the receiver   1 -> Open debt at stable rate for the value of the amount flash-borrowed to the `onBehalfOf` address   2 -> Open debt at variable rate for the value of the amount flash-borrowed to the `onBehalfOf` address |
| onBehalfOf | address | The address  that will receive the debt in the case of using on `modes` 1 or 2 |
| params | bytes | Variadic packed params to pass to the receiver as extra information |
| referralCode | uint16 | Code used to register the integrator originating the operation, for potential rewards.   0 if the action is executed directly by the user, without any middle-man |

### getReserveData

```solidity
function getReserveData(address asset) external view returns (struct DataTypes.ReserveData)
```

_Returns the state and configuration of the reserve_

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | The address of the underlying asset of the reserve |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct DataTypes.ReserveData | The state of the reserve |

### getUserAccountData

```solidity
function getUserAccountData(address user) external view returns (uint256 totalCollateralETH, uint256 totalDebtETH, uint256 availableBorrowsETH, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor)
```

_Returns the user account data across all the reserves_

| Name | Type | Description |
| ---- | ---- | ----------- |
| user | address | The address of the user |

| Name | Type | Description |
| ---- | ---- | ----------- |
| totalCollateralETH | uint256 | the total collateral in ETH of the user |
| totalDebtETH | uint256 | the total debt in ETH of the user |
| availableBorrowsETH | uint256 | the borrowing power left of the user |
| currentLiquidationThreshold | uint256 | the liquidation threshold of the user |
| ltv | uint256 | the loan to value of the user |
| healthFactor | uint256 | the current health factor of the user |

### getConfiguration

```solidity
function getConfiguration(address asset) external view returns (struct DataTypes.ReserveConfigurationMap)
```

_Returns the configuration of the reserve_

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | The address of the underlying asset of the reserve |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct DataTypes.ReserveConfigurationMap | The configuration of the reserve |

### getUserConfiguration

```solidity
function getUserConfiguration(address user) external view returns (struct DataTypes.UserConfigurationMap)
```

_Returns the configuration of the user across all the reserves_

| Name | Type | Description |
| ---- | ---- | ----------- |
| user | address | The user address |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct DataTypes.UserConfigurationMap | The configuration of the user |

### getReserveNormalizedIncome

```solidity
function getReserveNormalizedIncome(address asset) external view virtual returns (uint256)
```

_Returns the normalized income per unit of asset_

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | The address of the underlying asset of the reserve |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The reserve's normalized income |

### getReserveNormalizedVariableDebt

```solidity
function getReserveNormalizedVariableDebt(address asset) external view returns (uint256)
```

_Returns the normalized variable debt per unit of asset_

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | The address of the underlying asset of the reserve |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The reserve normalized variable debt |

### paused

```solidity
function paused() external view returns (bool)
```

_Returns if the LendingPool is paused_

### getReservesList

```solidity
function getReservesList() external view returns (address[])
```

_Returns the list of the initialized reserves_

### getAddressesProvider

```solidity
function getAddressesProvider() external view returns (contract ILendingPoolAddressesProvider)
```

_Returns the cached LendingPoolAddressesProvider connected to this contract_

### finalizeTransfer

```solidity
function finalizeTransfer(address asset, address from, address to, uint256 amount, uint256 balanceFromBefore, uint256 balanceToBefore) external
```

_Validates and finalizes an aToken transfer
- Only callable by the overlying aToken of the `asset`_

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | The address of the underlying asset of the aToken |
| from | address | The user from which the aTokens are transferred |
| to | address | The user receiving the aTokens |
| amount | uint256 | The amount being transferred/withdrawn |
| balanceFromBefore | uint256 | The aToken balance of the `from` user before the transfer |
| balanceToBefore | uint256 | The aToken balance of the `to` user before the transfer |

### initReserve

```solidity
function initReserve(address asset, address aTokenAddress, address stableDebtAddress, address variableDebtAddress, address interestRateStrategyAddress) external
```

_Initializes a reserve, activating it, assigning an aToken and debt tokens and an
interest rate strategy
- Only callable by the LendingPoolConfigurator contract_

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | The address of the underlying asset of the reserve |
| aTokenAddress | address | The address of the aToken that will be assigned to the reserve |
| stableDebtAddress | address | The address of the StableDebtToken that will be assigned to the reserve |
| variableDebtAddress | address |  |
| interestRateStrategyAddress | address | The address of the interest rate strategy contract |

### setReserveInterestRateStrategyAddress

```solidity
function setReserveInterestRateStrategyAddress(address asset, address rateStrategyAddress) external
```

_Updates the address of the interest rate strategy contract
- Only callable by the LendingPoolConfigurator contract_

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | The address of the underlying asset of the reserve |
| rateStrategyAddress | address | The address of the interest rate strategy contract |

### setConfiguration

```solidity
function setConfiguration(address asset, uint256 configuration) external
```

_Sets the configuration bitmap of the reserve as a whole
- Only callable by the LendingPoolConfigurator contract_

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | The address of the underlying asset of the reserve |
| configuration | uint256 | The new configuration bitmap |

### setPause

```solidity
function setPause(bool val) external
```

_Set the _pause state of a reserve
- Only callable by the LendingPoolConfigurator contract_

| Name | Type | Description |
| ---- | ---- | ----------- |
| val | bool | `true` to pause the reserve, `false` to un-pause it |

### ExecuteBorrowParams

```solidity
struct ExecuteBorrowParams {
  address asset;
  address user;
  address onBehalfOf;
  uint256 amount;
  uint256 interestRateMode;
  address aTokenAddress;
  uint16 referralCode;
  bool releaseUnderlying;
}
```

### _executeBorrow

```solidity
function _executeBorrow(struct LendingPool.ExecuteBorrowParams vars) internal
```

### _addReserveToList

```solidity
function _addReserveToList(address asset) internal
```

## LendingPoolStorage

### _addressesProvider

```solidity
contract ILendingPoolAddressesProvider _addressesProvider
```

### _reserves

```solidity
mapping(address => struct DataTypes.ReserveData) _reserves
```

### _usersConfig

```solidity
mapping(address => struct DataTypes.UserConfigurationMap) _usersConfig
```

### _reservesList

```solidity
mapping(uint256 => address) _reservesList
```

### _reservesCount

```solidity
uint256 _reservesCount
```

### _paused

```solidity
bool _paused
```

## BaseImmutableAdminUpgradeabilityProxy

_This contract combines an upgradeability proxy with an authorization
mechanism for administrative tasks. The admin role is stored in an immutable, which
helps saving transactions costs
All external functions in this contract must be guarded by the
`ifAdmin` modifier. See ethereum/solidity#3864 for a Solidity
feature proposal that would enable this to be done automatically._

### ADMIN

```solidity
address ADMIN
```

### constructor

```solidity
constructor(address admin) public
```

### ifAdmin

```solidity
modifier ifAdmin()
```

### admin

```solidity
function admin() external returns (address)
```

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The address of the proxy admin. |

### implementation

```solidity
function implementation() external returns (address)
```

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The address of the implementation. |

### upgradeTo

```solidity
function upgradeTo(address newImplementation) external
```

_Upgrade the backing implementation of the proxy.
Only the admin can call this function._

| Name | Type | Description |
| ---- | ---- | ----------- |
| newImplementation | address | Address of the new implementation. |

### upgradeToAndCall

```solidity
function upgradeToAndCall(address newImplementation, bytes data) external payable
```

_Upgrade the backing implementation of the proxy and call a function
on the new implementation.
This is useful to initialize the proxied contract._

| Name | Type | Description |
| ---- | ---- | ----------- |
| newImplementation | address | Address of the new implementation. |
| data | bytes | Data to send as msg.data in the low level call. It should include the signature and the parameters of the function to be called, as described in https://solidity.readthedocs.io/en/v0.4.24/abi-spec.html#function-selector-and-argument-encoding. |

### _willFallback

```solidity
function _willFallback() internal virtual
```

_Only fall back when the sender is not the admin._

## InitializableImmutableAdminUpgradeabilityProxy

_Extends BaseAdminUpgradeabilityProxy with an initializer function_

### constructor

```solidity
constructor(address admin) public
```

### _willFallback

```solidity
function _willFallback() internal
```

_Only fall back when the sender is not the admin._

## VersionedInitializable

_Helper contract to implement initializer functions. To use it, replace
the constructor with a function that has the `initializer` modifier.
WARNING: Unlike constructors, initializer functions must be manually
invoked. This applies both to deploying an Initializable contract, as well
as extending an Initializable contract via inheritance.
WARNING: When used with inheritance, manual care must be taken to not invoke
a parent initializer twice, or ensure that all initializers are idempotent,
because this is not dealt with automatically as with constructors._

### lastInitializedRevision

```solidity
uint256 lastInitializedRevision
```

_Indicates that the contract has been initialized._

### initializing

```solidity
bool initializing
```

_Indicates that the contract is in the process of being initialized._

### initializer

```solidity
modifier initializer()
```

_Modifier to use in the initializer function of a contract._

### getRevision

```solidity
function getRevision() internal pure virtual returns (uint256)
```

_returns the revision number of the contract
Needs to be defined in the inherited class as a constant._

### isConstructor

```solidity
function isConstructor() private view returns (bool)
```

_Returns true if and only if the function is running in the constructor_

### ______gap

```solidity
uint256[50] ______gap
```

## ReserveConfiguration

Implements the bitmap logic to handle the reserve configuration

### LTV_MASK

```solidity
uint256 LTV_MASK
```

### LIQUIDATION_THRESHOLD_MASK

```solidity
uint256 LIQUIDATION_THRESHOLD_MASK
```

### LIQUIDATION_BONUS_MASK

```solidity
uint256 LIQUIDATION_BONUS_MASK
```

### DECIMALS_MASK

```solidity
uint256 DECIMALS_MASK
```

### ACTIVE_MASK

```solidity
uint256 ACTIVE_MASK
```

### FROZEN_MASK

```solidity
uint256 FROZEN_MASK
```

### BORROWING_MASK

```solidity
uint256 BORROWING_MASK
```

### STABLE_BORROWING_MASK

```solidity
uint256 STABLE_BORROWING_MASK
```

### RESERVE_FACTOR_MASK

```solidity
uint256 RESERVE_FACTOR_MASK
```

### LIQUIDATION_THRESHOLD_START_BIT_POSITION

```solidity
uint256 LIQUIDATION_THRESHOLD_START_BIT_POSITION
```

_For the LTV, the start bit is 0 (up to 15), hence no bitshifting is needed_

### LIQUIDATION_BONUS_START_BIT_POSITION

```solidity
uint256 LIQUIDATION_BONUS_START_BIT_POSITION
```

### RESERVE_DECIMALS_START_BIT_POSITION

```solidity
uint256 RESERVE_DECIMALS_START_BIT_POSITION
```

### IS_ACTIVE_START_BIT_POSITION

```solidity
uint256 IS_ACTIVE_START_BIT_POSITION
```

### IS_FROZEN_START_BIT_POSITION

```solidity
uint256 IS_FROZEN_START_BIT_POSITION
```

### BORROWING_ENABLED_START_BIT_POSITION

```solidity
uint256 BORROWING_ENABLED_START_BIT_POSITION
```

### STABLE_BORROWING_ENABLED_START_BIT_POSITION

```solidity
uint256 STABLE_BORROWING_ENABLED_START_BIT_POSITION
```

### RESERVE_FACTOR_START_BIT_POSITION

```solidity
uint256 RESERVE_FACTOR_START_BIT_POSITION
```

### MAX_VALID_LTV

```solidity
uint256 MAX_VALID_LTV
```

### MAX_VALID_LIQUIDATION_THRESHOLD

```solidity
uint256 MAX_VALID_LIQUIDATION_THRESHOLD
```

### MAX_VALID_LIQUIDATION_BONUS

```solidity
uint256 MAX_VALID_LIQUIDATION_BONUS
```

### MAX_VALID_DECIMALS

```solidity
uint256 MAX_VALID_DECIMALS
```

### MAX_VALID_RESERVE_FACTOR

```solidity
uint256 MAX_VALID_RESERVE_FACTOR
```

### setLtv

```solidity
function setLtv(struct DataTypes.ReserveConfigurationMap self, uint256 ltv) internal pure
```

_Sets the Loan to Value of the reserve_

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct DataTypes.ReserveConfigurationMap | The reserve configuration |
| ltv | uint256 | the new ltv |

### getLtv

```solidity
function getLtv(struct DataTypes.ReserveConfigurationMap self) internal view returns (uint256)
```

_Gets the Loan to Value of the reserve_

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct DataTypes.ReserveConfigurationMap | The reserve configuration |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The loan to value |

### setLiquidationThreshold

```solidity
function setLiquidationThreshold(struct DataTypes.ReserveConfigurationMap self, uint256 threshold) internal pure
```

_Sets the liquidation threshold of the reserve_

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct DataTypes.ReserveConfigurationMap | The reserve configuration |
| threshold | uint256 | The new liquidation threshold |

### getLiquidationThreshold

```solidity
function getLiquidationThreshold(struct DataTypes.ReserveConfigurationMap self) internal view returns (uint256)
```

_Gets the liquidation threshold of the reserve_

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct DataTypes.ReserveConfigurationMap | The reserve configuration |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The liquidation threshold |

### setLiquidationBonus

```solidity
function setLiquidationBonus(struct DataTypes.ReserveConfigurationMap self, uint256 bonus) internal pure
```

_Sets the liquidation bonus of the reserve_

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct DataTypes.ReserveConfigurationMap | The reserve configuration |
| bonus | uint256 | The new liquidation bonus |

### getLiquidationBonus

```solidity
function getLiquidationBonus(struct DataTypes.ReserveConfigurationMap self) internal view returns (uint256)
```

_Gets the liquidation bonus of the reserve_

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct DataTypes.ReserveConfigurationMap | The reserve configuration |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The liquidation bonus |

### setDecimals

```solidity
function setDecimals(struct DataTypes.ReserveConfigurationMap self, uint256 decimals) internal pure
```

_Sets the decimals of the underlying asset of the reserve_

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct DataTypes.ReserveConfigurationMap | The reserve configuration |
| decimals | uint256 | The decimals |

### getDecimals

```solidity
function getDecimals(struct DataTypes.ReserveConfigurationMap self) internal view returns (uint256)
```

_Gets the decimals of the underlying asset of the reserve_

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct DataTypes.ReserveConfigurationMap | The reserve configuration |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The decimals of the asset |

### setActive

```solidity
function setActive(struct DataTypes.ReserveConfigurationMap self, bool active) internal pure
```

_Sets the active state of the reserve_

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct DataTypes.ReserveConfigurationMap | The reserve configuration |
| active | bool | The active state |

### getActive

```solidity
function getActive(struct DataTypes.ReserveConfigurationMap self) internal view returns (bool)
```

_Gets the active state of the reserve_

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct DataTypes.ReserveConfigurationMap | The reserve configuration |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | The active state |

### setFrozen

```solidity
function setFrozen(struct DataTypes.ReserveConfigurationMap self, bool frozen) internal pure
```

_Sets the frozen state of the reserve_

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct DataTypes.ReserveConfigurationMap | The reserve configuration |
| frozen | bool | The frozen state |

### getFrozen

```solidity
function getFrozen(struct DataTypes.ReserveConfigurationMap self) internal view returns (bool)
```

_Gets the frozen state of the reserve_

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct DataTypes.ReserveConfigurationMap | The reserve configuration |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | The frozen state |

### setBorrowingEnabled

```solidity
function setBorrowingEnabled(struct DataTypes.ReserveConfigurationMap self, bool enabled) internal pure
```

_Enables or disables borrowing on the reserve_

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct DataTypes.ReserveConfigurationMap | The reserve configuration |
| enabled | bool | True if the borrowing needs to be enabled, false otherwise |

### getBorrowingEnabled

```solidity
function getBorrowingEnabled(struct DataTypes.ReserveConfigurationMap self) internal view returns (bool)
```

_Gets the borrowing state of the reserve_

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct DataTypes.ReserveConfigurationMap | The reserve configuration |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | The borrowing state |

### setStableRateBorrowingEnabled

```solidity
function setStableRateBorrowingEnabled(struct DataTypes.ReserveConfigurationMap self, bool enabled) internal pure
```

_Enables or disables stable rate borrowing on the reserve_

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct DataTypes.ReserveConfigurationMap | The reserve configuration |
| enabled | bool | True if the stable rate borrowing needs to be enabled, false otherwise |

### getStableRateBorrowingEnabled

```solidity
function getStableRateBorrowingEnabled(struct DataTypes.ReserveConfigurationMap self) internal view returns (bool)
```

_Gets the stable rate borrowing state of the reserve_

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct DataTypes.ReserveConfigurationMap | The reserve configuration |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | The stable rate borrowing state |

### setReserveFactor

```solidity
function setReserveFactor(struct DataTypes.ReserveConfigurationMap self, uint256 reserveFactor) internal pure
```

_Sets the reserve factor of the reserve_

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct DataTypes.ReserveConfigurationMap | The reserve configuration |
| reserveFactor | uint256 | The reserve factor |

### getReserveFactor

```solidity
function getReserveFactor(struct DataTypes.ReserveConfigurationMap self) internal view returns (uint256)
```

_Gets the reserve factor of the reserve_

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct DataTypes.ReserveConfigurationMap | The reserve configuration |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The reserve factor |

### getFlags

```solidity
function getFlags(struct DataTypes.ReserveConfigurationMap self) internal view returns (bool, bool, bool, bool)
```

_Gets the configuration flags of the reserve_

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct DataTypes.ReserveConfigurationMap | The reserve configuration |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | The state flags representing active, frozen, borrowing enabled, stableRateBorrowing enabled |
| [1] | bool |  |
| [2] | bool |  |
| [3] | bool |  |

### getParams

```solidity
function getParams(struct DataTypes.ReserveConfigurationMap self) internal view returns (uint256, uint256, uint256, uint256, uint256)
```

_Gets the configuration paramters of the reserve_

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct DataTypes.ReserveConfigurationMap | The reserve configuration |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The state params representing ltv, liquidation threshold, liquidation bonus, the reserve decimals |
| [1] | uint256 |  |
| [2] | uint256 |  |
| [3] | uint256 |  |
| [4] | uint256 |  |

### getParamsMemory

```solidity
function getParamsMemory(struct DataTypes.ReserveConfigurationMap self) internal pure returns (uint256, uint256, uint256, uint256, uint256)
```

_Gets the configuration paramters of the reserve from a memory object_

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct DataTypes.ReserveConfigurationMap | The reserve configuration |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The state params representing ltv, liquidation threshold, liquidation bonus, the reserve decimals |
| [1] | uint256 |  |
| [2] | uint256 |  |
| [3] | uint256 |  |
| [4] | uint256 |  |

### getFlagsMemory

```solidity
function getFlagsMemory(struct DataTypes.ReserveConfigurationMap self) internal pure returns (bool, bool, bool, bool)
```

_Gets the configuration flags of the reserve from a memory object_

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct DataTypes.ReserveConfigurationMap | The reserve configuration |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | The state flags representing active, frozen, borrowing enabled, stableRateBorrowing enabled |
| [1] | bool |  |
| [2] | bool |  |
| [3] | bool |  |

## UserConfiguration

Implements the bitmap logic to handle the user configuration

### BORROWING_MASK

```solidity
uint256 BORROWING_MASK
```

### setBorrowing

```solidity
function setBorrowing(struct DataTypes.UserConfigurationMap self, uint256 reserveIndex, bool borrowing) internal
```

_Sets if the user is borrowing the reserve identified by reserveIndex_

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct DataTypes.UserConfigurationMap | The configuration object |
| reserveIndex | uint256 | The index of the reserve in the bitmap |
| borrowing | bool | True if the user is borrowing the reserve, false otherwise |

### setUsingAsCollateral

```solidity
function setUsingAsCollateral(struct DataTypes.UserConfigurationMap self, uint256 reserveIndex, bool usingAsCollateral) internal
```

_Sets if the user is using as collateral the reserve identified by reserveIndex_

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct DataTypes.UserConfigurationMap | The configuration object |
| reserveIndex | uint256 | The index of the reserve in the bitmap |
| usingAsCollateral | bool | True if the user is usin the reserve as collateral, false otherwise |

### isUsingAsCollateralOrBorrowing

```solidity
function isUsingAsCollateralOrBorrowing(struct DataTypes.UserConfigurationMap self, uint256 reserveIndex) internal pure returns (bool)
```

_Used to validate if a user has been using the reserve for borrowing or as collateral_

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct DataTypes.UserConfigurationMap | The configuration object |
| reserveIndex | uint256 | The index of the reserve in the bitmap |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | True if the user has been using a reserve for borrowing or as collateral, false otherwise |

### isBorrowing

```solidity
function isBorrowing(struct DataTypes.UserConfigurationMap self, uint256 reserveIndex) internal pure returns (bool)
```

_Used to validate if a user has been using the reserve for borrowing_

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct DataTypes.UserConfigurationMap | The configuration object |
| reserveIndex | uint256 | The index of the reserve in the bitmap |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | True if the user has been using a reserve for borrowing, false otherwise |

### isUsingAsCollateral

```solidity
function isUsingAsCollateral(struct DataTypes.UserConfigurationMap self, uint256 reserveIndex) internal pure returns (bool)
```

_Used to validate if a user has been using the reserve as collateral_

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct DataTypes.UserConfigurationMap | The configuration object |
| reserveIndex | uint256 | The index of the reserve in the bitmap |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | True if the user has been using a reserve as collateral, false otherwise |

### isBorrowingAny

```solidity
function isBorrowingAny(struct DataTypes.UserConfigurationMap self) internal pure returns (bool)
```

_Used to validate if a user has been borrowing from any reserve_

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct DataTypes.UserConfigurationMap | The configuration object |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | True if the user has been borrowing any reserve, false otherwise |

### isEmpty

```solidity
function isEmpty(struct DataTypes.UserConfigurationMap self) internal pure returns (bool)
```

_Used to validate if a user has not been using any reserve_

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct DataTypes.UserConfigurationMap | The configuration object |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | True if the user has been borrowing any reserve, false otherwise |

## Errors

Defines the error messages emitted by the different contracts of the Aave protocol

_Error messages prefix glossary:
 - VL = ValidationLogic
 - MATH = Math libraries
 - CT = Common errors between tokens (AToken, VariableDebtToken and StableDebtToken)
 - AT = AToken
 - SDT = StableDebtToken
 - VDT = VariableDebtToken
 - LP = LendingPool
 - LPAPR = LendingPoolAddressesProviderRegistry
 - LPC = LendingPoolConfiguration
 - RL = ReserveLogic
 - LPCM = LendingPoolCollateralManager
 - P = Pausable_

### CALLER_NOT_POOL_ADMIN

```solidity
string CALLER_NOT_POOL_ADMIN
```

### BORROW_ALLOWANCE_NOT_ENOUGH

```solidity
string BORROW_ALLOWANCE_NOT_ENOUGH
```

### VL_INVALID_AMOUNT

```solidity
string VL_INVALID_AMOUNT
```

### VL_NO_ACTIVE_RESERVE

```solidity
string VL_NO_ACTIVE_RESERVE
```

### VL_RESERVE_FROZEN

```solidity
string VL_RESERVE_FROZEN
```

### VL_CURRENT_AVAILABLE_LIQUIDITY_NOT_ENOUGH

```solidity
string VL_CURRENT_AVAILABLE_LIQUIDITY_NOT_ENOUGH
```

### VL_NOT_ENOUGH_AVAILABLE_USER_BALANCE

```solidity
string VL_NOT_ENOUGH_AVAILABLE_USER_BALANCE
```

### VL_TRANSFER_NOT_ALLOWED

```solidity
string VL_TRANSFER_NOT_ALLOWED
```

### VL_BORROWING_NOT_ENABLED

```solidity
string VL_BORROWING_NOT_ENABLED
```

### VL_INVALID_INTEREST_RATE_MODE_SELECTED

```solidity
string VL_INVALID_INTEREST_RATE_MODE_SELECTED
```

### VL_COLLATERAL_BALANCE_IS_0

```solidity
string VL_COLLATERAL_BALANCE_IS_0
```

### VL_HEALTH_FACTOR_LOWER_THAN_LIQUIDATION_THRESHOLD

```solidity
string VL_HEALTH_FACTOR_LOWER_THAN_LIQUIDATION_THRESHOLD
```

### VL_COLLATERAL_CANNOT_COVER_NEW_BORROW

```solidity
string VL_COLLATERAL_CANNOT_COVER_NEW_BORROW
```

### VL_STABLE_BORROWING_NOT_ENABLED

```solidity
string VL_STABLE_BORROWING_NOT_ENABLED
```

### VL_COLLATERAL_SAME_AS_BORROWING_CURRENCY

```solidity
string VL_COLLATERAL_SAME_AS_BORROWING_CURRENCY
```

### VL_AMOUNT_BIGGER_THAN_MAX_LOAN_SIZE_STABLE

```solidity
string VL_AMOUNT_BIGGER_THAN_MAX_LOAN_SIZE_STABLE
```

### VL_NO_DEBT_OF_SELECTED_TYPE

```solidity
string VL_NO_DEBT_OF_SELECTED_TYPE
```

### VL_NO_EXPLICIT_AMOUNT_TO_REPAY_ON_BEHALF

```solidity
string VL_NO_EXPLICIT_AMOUNT_TO_REPAY_ON_BEHALF
```

### VL_NO_STABLE_RATE_LOAN_IN_RESERVE

```solidity
string VL_NO_STABLE_RATE_LOAN_IN_RESERVE
```

### VL_NO_VARIABLE_RATE_LOAN_IN_RESERVE

```solidity
string VL_NO_VARIABLE_RATE_LOAN_IN_RESERVE
```

### VL_UNDERLYING_BALANCE_NOT_GREATER_THAN_0

```solidity
string VL_UNDERLYING_BALANCE_NOT_GREATER_THAN_0
```

### VL_DEPOSIT_ALREADY_IN_USE

```solidity
string VL_DEPOSIT_ALREADY_IN_USE
```

### LP_NOT_ENOUGH_STABLE_BORROW_BALANCE

```solidity
string LP_NOT_ENOUGH_STABLE_BORROW_BALANCE
```

### LP_INTEREST_RATE_REBALANCE_CONDITIONS_NOT_MET

```solidity
string LP_INTEREST_RATE_REBALANCE_CONDITIONS_NOT_MET
```

### LP_LIQUIDATION_CALL_FAILED

```solidity
string LP_LIQUIDATION_CALL_FAILED
```

### LP_NOT_ENOUGH_LIQUIDITY_TO_BORROW

```solidity
string LP_NOT_ENOUGH_LIQUIDITY_TO_BORROW
```

### LP_REQUESTED_AMOUNT_TOO_SMALL

```solidity
string LP_REQUESTED_AMOUNT_TOO_SMALL
```

### LP_INCONSISTENT_PROTOCOL_ACTUAL_BALANCE

```solidity
string LP_INCONSISTENT_PROTOCOL_ACTUAL_BALANCE
```

### LP_CALLER_NOT_LENDING_POOL_CONFIGURATOR

```solidity
string LP_CALLER_NOT_LENDING_POOL_CONFIGURATOR
```

### LP_INCONSISTENT_FLASHLOAN_PARAMS

```solidity
string LP_INCONSISTENT_FLASHLOAN_PARAMS
```

### CT_CALLER_MUST_BE_LENDING_POOL

```solidity
string CT_CALLER_MUST_BE_LENDING_POOL
```

### CT_CANNOT_GIVE_ALLOWANCE_TO_HIMSELF

```solidity
string CT_CANNOT_GIVE_ALLOWANCE_TO_HIMSELF
```

### CT_TRANSFER_AMOUNT_NOT_GT_0

```solidity
string CT_TRANSFER_AMOUNT_NOT_GT_0
```

### RL_RESERVE_ALREADY_INITIALIZED

```solidity
string RL_RESERVE_ALREADY_INITIALIZED
```

### LPC_RESERVE_LIQUIDITY_NOT_0

```solidity
string LPC_RESERVE_LIQUIDITY_NOT_0
```

### LPC_INVALID_ATOKEN_POOL_ADDRESS

```solidity
string LPC_INVALID_ATOKEN_POOL_ADDRESS
```

### LPC_INVALID_STABLE_DEBT_TOKEN_POOL_ADDRESS

```solidity
string LPC_INVALID_STABLE_DEBT_TOKEN_POOL_ADDRESS
```

### LPC_INVALID_VARIABLE_DEBT_TOKEN_POOL_ADDRESS

```solidity
string LPC_INVALID_VARIABLE_DEBT_TOKEN_POOL_ADDRESS
```

### LPC_INVALID_STABLE_DEBT_TOKEN_UNDERLYING_ADDRESS

```solidity
string LPC_INVALID_STABLE_DEBT_TOKEN_UNDERLYING_ADDRESS
```

### LPC_INVALID_VARIABLE_DEBT_TOKEN_UNDERLYING_ADDRESS

```solidity
string LPC_INVALID_VARIABLE_DEBT_TOKEN_UNDERLYING_ADDRESS
```

### LPC_INVALID_ADDRESSES_PROVIDER_ID

```solidity
string LPC_INVALID_ADDRESSES_PROVIDER_ID
```

### LPC_INVALID_CONFIGURATION

```solidity
string LPC_INVALID_CONFIGURATION
```

### LPC_CALLER_NOT_EMERGENCY_ADMIN

```solidity
string LPC_CALLER_NOT_EMERGENCY_ADMIN
```

### LPAPR_PROVIDER_NOT_REGISTERED

```solidity
string LPAPR_PROVIDER_NOT_REGISTERED
```

### LPCM_HEALTH_FACTOR_NOT_BELOW_THRESHOLD

```solidity
string LPCM_HEALTH_FACTOR_NOT_BELOW_THRESHOLD
```

### LPCM_COLLATERAL_CANNOT_BE_LIQUIDATED

```solidity
string LPCM_COLLATERAL_CANNOT_BE_LIQUIDATED
```

### LPCM_SPECIFIED_CURRENCY_NOT_BORROWED_BY_USER

```solidity
string LPCM_SPECIFIED_CURRENCY_NOT_BORROWED_BY_USER
```

### LPCM_NOT_ENOUGH_LIQUIDITY_TO_LIQUIDATE

```solidity
string LPCM_NOT_ENOUGH_LIQUIDITY_TO_LIQUIDATE
```

### LPCM_NO_ERRORS

```solidity
string LPCM_NO_ERRORS
```

### LP_INVALID_FLASHLOAN_MODE

```solidity
string LP_INVALID_FLASHLOAN_MODE
```

### MATH_MULTIPLICATION_OVERFLOW

```solidity
string MATH_MULTIPLICATION_OVERFLOW
```

### MATH_ADDITION_OVERFLOW

```solidity
string MATH_ADDITION_OVERFLOW
```

### MATH_DIVISION_BY_ZERO

```solidity
string MATH_DIVISION_BY_ZERO
```

### RL_LIQUIDITY_INDEX_OVERFLOW

```solidity
string RL_LIQUIDITY_INDEX_OVERFLOW
```

### RL_VARIABLE_BORROW_INDEX_OVERFLOW

```solidity
string RL_VARIABLE_BORROW_INDEX_OVERFLOW
```

### RL_LIQUIDITY_RATE_OVERFLOW

```solidity
string RL_LIQUIDITY_RATE_OVERFLOW
```

### RL_VARIABLE_BORROW_RATE_OVERFLOW

```solidity
string RL_VARIABLE_BORROW_RATE_OVERFLOW
```

### RL_STABLE_BORROW_RATE_OVERFLOW

```solidity
string RL_STABLE_BORROW_RATE_OVERFLOW
```

### CT_INVALID_MINT_AMOUNT

```solidity
string CT_INVALID_MINT_AMOUNT
```

### LP_FAILED_REPAY_WITH_COLLATERAL

```solidity
string LP_FAILED_REPAY_WITH_COLLATERAL
```

### CT_INVALID_BURN_AMOUNT

```solidity
string CT_INVALID_BURN_AMOUNT
```

### LP_FAILED_COLLATERAL_SWAP

```solidity
string LP_FAILED_COLLATERAL_SWAP
```

### LP_INVALID_EQUAL_ASSETS_TO_SWAP

```solidity
string LP_INVALID_EQUAL_ASSETS_TO_SWAP
```

### LP_REENTRANCY_NOT_ALLOWED

```solidity
string LP_REENTRANCY_NOT_ALLOWED
```

### LP_CALLER_MUST_BE_AN_ATOKEN

```solidity
string LP_CALLER_MUST_BE_AN_ATOKEN
```

### LP_IS_PAUSED

```solidity
string LP_IS_PAUSED
```

### LP_NO_MORE_RESERVES_ALLOWED

```solidity
string LP_NO_MORE_RESERVES_ALLOWED
```

### LP_INVALID_FLASH_LOAN_EXECUTOR_RETURN

```solidity
string LP_INVALID_FLASH_LOAN_EXECUTOR_RETURN
```

### RC_INVALID_LTV

```solidity
string RC_INVALID_LTV
```

### RC_INVALID_LIQ_THRESHOLD

```solidity
string RC_INVALID_LIQ_THRESHOLD
```

### RC_INVALID_LIQ_BONUS

```solidity
string RC_INVALID_LIQ_BONUS
```

### RC_INVALID_DECIMALS

```solidity
string RC_INVALID_DECIMALS
```

### RC_INVALID_RESERVE_FACTOR

```solidity
string RC_INVALID_RESERVE_FACTOR
```

### LPAPR_INVALID_ADDRESSES_PROVIDER_ID

```solidity
string LPAPR_INVALID_ADDRESSES_PROVIDER_ID
```

### VL_INCONSISTENT_FLASHLOAN_PARAMS

```solidity
string VL_INCONSISTENT_FLASHLOAN_PARAMS
```

### LP_INCONSISTENT_PARAMS_LENGTH

```solidity
string LP_INCONSISTENT_PARAMS_LENGTH
```

### UL_INVALID_INDEX

```solidity
string UL_INVALID_INDEX
```

### LP_NOT_CONTRACT

```solidity
string LP_NOT_CONTRACT
```

### SDT_STABLE_DEBT_OVERFLOW

```solidity
string SDT_STABLE_DEBT_OVERFLOW
```

### SDT_BURN_EXCEEDS_BALANCE

```solidity
string SDT_BURN_EXCEEDS_BALANCE
```

### CollateralManagerErrors

```solidity
enum CollateralManagerErrors {
  NO_ERROR,
  NO_COLLATERAL_AVAILABLE,
  COLLATERAL_CANNOT_BE_LIQUIDATED,
  CURRRENCY_NOT_BORROWED,
  HEALTH_FACTOR_ABOVE_THRESHOLD,
  NOT_ENOUGH_LIQUIDITY,
  NO_ACTIVE_RESERVE,
  HEALTH_FACTOR_LOWER_THAN_LIQUIDATION_THRESHOLD,
  INVALID_EQUAL_ASSETS_TO_SWAP,
  FROZEN_RESERVE
}
```

## Helpers

### getUserCurrentDebt

```solidity
function getUserCurrentDebt(address user, struct DataTypes.ReserveData reserve) internal view returns (uint256, uint256)
```

_Fetches the user current stable and variable debt balances_

| Name | Type | Description |
| ---- | ---- | ----------- |
| user | address | The user address |
| reserve | struct DataTypes.ReserveData | The reserve data object |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The stable and variable debt balance |
| [1] | uint256 |  |

### getUserCurrentDebtMemory

```solidity
function getUserCurrentDebtMemory(address user, struct DataTypes.ReserveData reserve) internal view returns (uint256, uint256)
```

## GenericLogic

### HEALTH_FACTOR_LIQUIDATION_THRESHOLD

```solidity
uint256 HEALTH_FACTOR_LIQUIDATION_THRESHOLD
```

### balanceDecreaseAllowedLocalVars

```solidity
struct balanceDecreaseAllowedLocalVars {
  uint256 decimals;
  uint256 liquidationThreshold;
  uint256 totalCollateralInETH;
  uint256 totalDebtInETH;
  uint256 avgLiquidationThreshold;
  uint256 amountToDecreaseInETH;
  uint256 collateralBalanceAfterDecrease;
  uint256 liquidationThresholdAfterDecrease;
  uint256 healthFactorAfterDecrease;
  bool reserveUsageAsCollateralEnabled;
}
```

### balanceDecreaseAllowed

```solidity
function balanceDecreaseAllowed(address asset, address user, uint256 amount, mapping(address => struct DataTypes.ReserveData) reservesData, struct DataTypes.UserConfigurationMap userConfig, mapping(uint256 => address) reserves, uint256 reservesCount, address oracle) external view returns (bool)
```

_Checks if a specific balance decrease is allowed
(i.e. doesn't bring the user borrow position health factor under HEALTH_FACTOR_LIQUIDATION_THRESHOLD)_

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | The address of the underlying asset of the reserve |
| user | address | The address of the user |
| amount | uint256 | The amount to decrease |
| reservesData | mapping(address &#x3D;&gt; struct DataTypes.ReserveData) | The data of all the reserves |
| userConfig | struct DataTypes.UserConfigurationMap | The user configuration |
| reserves | mapping(uint256 &#x3D;&gt; address) | The list of all the active reserves |
| reservesCount | uint256 |  |
| oracle | address | The address of the oracle contract |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | true if the decrease of the balance is allowed |

### CalculateUserAccountDataVars

```solidity
struct CalculateUserAccountDataVars {
  uint256 reserveUnitPrice;
  uint256 tokenUnit;
  uint256 compoundedLiquidityBalance;
  uint256 compoundedBorrowBalance;
  uint256 decimals;
  uint256 ltv;
  uint256 liquidationThreshold;
  uint256 i;
  uint256 healthFactor;
  uint256 totalCollateralInETH;
  uint256 totalDebtInETH;
  uint256 avgLtv;
  uint256 avgLiquidationThreshold;
  uint256 reservesLength;
  bool healthFactorBelowThreshold;
  address currentReserveAddress;
  bool usageAsCollateralEnabled;
  bool userUsesReserveAsCollateral;
}
```

### calculateUserAccountData

```solidity
function calculateUserAccountData(address user, mapping(address => struct DataTypes.ReserveData) reservesData, struct DataTypes.UserConfigurationMap userConfig, mapping(uint256 => address) reserves, uint256 reservesCount, address oracle) internal view returns (uint256, uint256, uint256, uint256, uint256)
```

_Calculates the user data across the reserves.
this includes the total liquidity/collateral/borrow balances in ETH,
the average Loan To Value, the average Liquidation Ratio, and the Health factor._

| Name | Type | Description |
| ---- | ---- | ----------- |
| user | address | The address of the user |
| reservesData | mapping(address &#x3D;&gt; struct DataTypes.ReserveData) | Data of all the reserves |
| userConfig | struct DataTypes.UserConfigurationMap | The configuration of the user |
| reserves | mapping(uint256 &#x3D;&gt; address) | The list of the available reserves |
| reservesCount | uint256 |  |
| oracle | address | The price oracle address |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The total collateral and total debt of the user in ETH, the avg ltv, liquidation threshold and the HF |
| [1] | uint256 |  |
| [2] | uint256 |  |
| [3] | uint256 |  |
| [4] | uint256 |  |

### calculateHealthFactorFromBalances

```solidity
function calculateHealthFactorFromBalances(uint256 totalCollateralInETH, uint256 totalDebtInETH, uint256 liquidationThreshold) internal pure returns (uint256)
```

_Calculates the health factor from the corresponding balances_

| Name | Type | Description |
| ---- | ---- | ----------- |
| totalCollateralInETH | uint256 | The total collateral in ETH |
| totalDebtInETH | uint256 | The total debt in ETH |
| liquidationThreshold | uint256 | The avg liquidation threshold |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The health factor calculated from the balances provided |

### calculateAvailableBorrowsETH

```solidity
function calculateAvailableBorrowsETH(uint256 totalCollateralInETH, uint256 totalDebtInETH, uint256 ltv) internal pure returns (uint256)
```

_Calculates the equivalent amount in ETH that an user can borrow, depending on the available collateral and the
average Loan To Value_

| Name | Type | Description |
| ---- | ---- | ----------- |
| totalCollateralInETH | uint256 | The total collateral in ETH |
| totalDebtInETH | uint256 | The total borrow balance |
| ltv | uint256 | The average loan to value |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | the amount available to borrow in ETH for the user |

## ReserveLogic

Implements the logic to update the reserves state

### ReserveDataUpdated

```solidity
event ReserveDataUpdated(address asset, uint256 liquidityRate, uint256 stableBorrowRate, uint256 variableBorrowRate, uint256 liquidityIndex, uint256 variableBorrowIndex)
```

_Emitted when the state of a reserve is updated_

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | The address of the underlying asset of the reserve |
| liquidityRate | uint256 | The new liquidity rate |
| stableBorrowRate | uint256 | The new stable borrow rate |
| variableBorrowRate | uint256 | The new variable borrow rate |
| liquidityIndex | uint256 | The new liquidity index |
| variableBorrowIndex | uint256 | The new variable borrow index |

### getNormalizedIncome

```solidity
function getNormalizedIncome(struct DataTypes.ReserveData reserve) internal view returns (uint256)
```

_Returns the ongoing normalized income for the reserve
A value of 1e27 means there is no income. As time passes, the income is accrued
A value of 2*1e27 means for each unit of asset one unit of income has been accrued_

| Name | Type | Description |
| ---- | ---- | ----------- |
| reserve | struct DataTypes.ReserveData | The reserve object |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | the normalized income. expressed in ray |

### getNormalizedDebt

```solidity
function getNormalizedDebt(struct DataTypes.ReserveData reserve) internal view returns (uint256)
```

_Returns the ongoing normalized variable debt for the reserve
A value of 1e27 means there is no debt. As time passes, the income is accrued
A value of 2*1e27 means that for each unit of debt, one unit worth of interest has been accumulated_

| Name | Type | Description |
| ---- | ---- | ----------- |
| reserve | struct DataTypes.ReserveData | The reserve object |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The normalized variable debt. expressed in ray |

### updateState

```solidity
function updateState(struct DataTypes.ReserveData reserve) internal
```

_Updates the liquidity cumulative index and the variable borrow index._

| Name | Type | Description |
| ---- | ---- | ----------- |
| reserve | struct DataTypes.ReserveData | the reserve object |

### cumulateToLiquidityIndex

```solidity
function cumulateToLiquidityIndex(struct DataTypes.ReserveData reserve, uint256 totalLiquidity, uint256 amount) internal
```

_Accumulates a predefined amount of asset to the reserve as a fixed, instantaneous income. Used for example to accumulate
the flashloan fee to the reserve, and spread it between all the depositors_

| Name | Type | Description |
| ---- | ---- | ----------- |
| reserve | struct DataTypes.ReserveData | The reserve object |
| totalLiquidity | uint256 | The total liquidity available in the reserve |
| amount | uint256 | The amount to accomulate |

### init

```solidity
function init(struct DataTypes.ReserveData reserve, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress) external
```

_Initializes a reserve_

| Name | Type | Description |
| ---- | ---- | ----------- |
| reserve | struct DataTypes.ReserveData | The reserve object |
| aTokenAddress | address | The address of the overlying atoken contract |
| stableDebtTokenAddress | address |  |
| variableDebtTokenAddress | address |  |
| interestRateStrategyAddress | address | The address of the interest rate strategy contract |

### UpdateInterestRatesLocalVars

```solidity
struct UpdateInterestRatesLocalVars {
  address stableDebtTokenAddress;
  uint256 availableLiquidity;
  uint256 totalStableDebt;
  uint256 newLiquidityRate;
  uint256 newStableRate;
  uint256 newVariableRate;
  uint256 avgStableRate;
  uint256 totalVariableDebt;
}
```

### updateInterestRates

```solidity
function updateInterestRates(struct DataTypes.ReserveData reserve, address reserveAddress, address aTokenAddress, uint256 liquidityAdded, uint256 liquidityTaken) internal
```

_Updates the reserve current stable borrow rate, the current variable borrow rate and the current liquidity rate_

| Name | Type | Description |
| ---- | ---- | ----------- |
| reserve | struct DataTypes.ReserveData | The address of the reserve to be updated |
| reserveAddress | address |  |
| aTokenAddress | address |  |
| liquidityAdded | uint256 | The amount of liquidity added to the protocol (deposit or repay) in the previous action |
| liquidityTaken | uint256 | The amount of liquidity taken from the protocol (redeem or borrow) |

### MintToTreasuryLocalVars

```solidity
struct MintToTreasuryLocalVars {
  uint256 currentStableDebt;
  uint256 principalStableDebt;
  uint256 previousStableDebt;
  uint256 currentVariableDebt;
  uint256 previousVariableDebt;
  uint256 avgStableRate;
  uint256 cumulatedStableInterest;
  uint256 totalDebtAccrued;
  uint256 amountToMint;
  uint256 reserveFactor;
  uint40 stableSupplyUpdatedTimestamp;
}
```

### _mintToTreasury

```solidity
function _mintToTreasury(struct DataTypes.ReserveData reserve, uint256 scaledVariableDebt, uint256 previousVariableBorrowIndex, uint256 newLiquidityIndex, uint256 newVariableBorrowIndex, uint40 timestamp) internal
```

_Mints part of the repaid interest to the reserve treasury as a function of the reserveFactor for the
specific asset._

| Name | Type | Description |
| ---- | ---- | ----------- |
| reserve | struct DataTypes.ReserveData | The reserve reserve to be updated |
| scaledVariableDebt | uint256 | The current scaled total variable debt |
| previousVariableBorrowIndex | uint256 | The variable borrow index before the last accumulation of the interest |
| newLiquidityIndex | uint256 | The new liquidity index |
| newVariableBorrowIndex | uint256 | The variable borrow index after the last accumulation of the interest |
| timestamp | uint40 |  |

### _updateIndexes

```solidity
function _updateIndexes(struct DataTypes.ReserveData reserve, uint256 scaledVariableDebt, uint256 liquidityIndex, uint256 variableBorrowIndex, uint40 timestamp) internal returns (uint256, uint256)
```

_Updates the reserve indexes and the timestamp of the update_

| Name | Type | Description |
| ---- | ---- | ----------- |
| reserve | struct DataTypes.ReserveData | The reserve reserve to be updated |
| scaledVariableDebt | uint256 | The scaled variable debt |
| liquidityIndex | uint256 | The last stored liquidity index |
| variableBorrowIndex | uint256 | The last stored variable borrow index |
| timestamp | uint40 |  |

## ValidationLogic

Implements functions to validate the different actions of the protocol

### REBALANCE_UP_LIQUIDITY_RATE_THRESHOLD

```solidity
uint256 REBALANCE_UP_LIQUIDITY_RATE_THRESHOLD
```

### REBALANCE_UP_USAGE_RATIO_THRESHOLD

```solidity
uint256 REBALANCE_UP_USAGE_RATIO_THRESHOLD
```

### validateDeposit

```solidity
function validateDeposit(struct DataTypes.ReserveData reserve, uint256 amount) external view
```

_Validates a deposit action_

| Name | Type | Description |
| ---- | ---- | ----------- |
| reserve | struct DataTypes.ReserveData | The reserve object on which the user is depositing |
| amount | uint256 | The amount to be deposited |

### validateWithdraw

```solidity
function validateWithdraw(address reserveAddress, uint256 amount, uint256 userBalance, mapping(address => struct DataTypes.ReserveData) reservesData, struct DataTypes.UserConfigurationMap userConfig, mapping(uint256 => address) reserves, uint256 reservesCount, address oracle) external view
```

_Validates a withdraw action_

| Name | Type | Description |
| ---- | ---- | ----------- |
| reserveAddress | address | The address of the reserve |
| amount | uint256 | The amount to be withdrawn |
| userBalance | uint256 | The balance of the user |
| reservesData | mapping(address &#x3D;&gt; struct DataTypes.ReserveData) | The reserves state |
| userConfig | struct DataTypes.UserConfigurationMap | The user configuration |
| reserves | mapping(uint256 &#x3D;&gt; address) | The addresses of the reserves |
| reservesCount | uint256 | The number of reserves |
| oracle | address | The price oracle |

### ValidateBorrowLocalVars

```solidity
struct ValidateBorrowLocalVars {
  uint256 currentLtv;
  uint256 currentLiquidationThreshold;
  uint256 amountOfCollateralNeededETH;
  uint256 userCollateralBalanceETH;
  uint256 userBorrowBalanceETH;
  uint256 availableLiquidity;
  uint256 healthFactor;
  bool isActive;
  bool isFrozen;
  bool borrowingEnabled;
  bool stableRateBorrowingEnabled;
}
```

### validateBorrow

```solidity
function validateBorrow(address asset, struct DataTypes.ReserveData reserve, address userAddress, uint256 amount, uint256 amountInETH, uint256 interestRateMode, uint256 maxStableLoanPercent, mapping(address => struct DataTypes.ReserveData) reservesData, struct DataTypes.UserConfigurationMap userConfig, mapping(uint256 => address) reserves, uint256 reservesCount, address oracle) external view
```

_Validates a borrow action_

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | The address of the asset to borrow |
| reserve | struct DataTypes.ReserveData | The reserve state from which the user is borrowing |
| userAddress | address | The address of the user |
| amount | uint256 | The amount to be borrowed |
| amountInETH | uint256 | The amount to be borrowed, in ETH |
| interestRateMode | uint256 | The interest rate mode at which the user is borrowing |
| maxStableLoanPercent | uint256 | The max amount of the liquidity that can be borrowed at stable rate, in percentage |
| reservesData | mapping(address &#x3D;&gt; struct DataTypes.ReserveData) | The state of all the reserves |
| userConfig | struct DataTypes.UserConfigurationMap | The state of the user for the specific reserve |
| reserves | mapping(uint256 &#x3D;&gt; address) | The addresses of all the active reserves |
| reservesCount | uint256 |  |
| oracle | address | The price oracle |

### validateRepay

```solidity
function validateRepay(struct DataTypes.ReserveData reserve, uint256 amountSent, enum DataTypes.InterestRateMode rateMode, address onBehalfOf, uint256 stableDebt, uint256 variableDebt) external view
```

_Validates a repay action_

| Name | Type | Description |
| ---- | ---- | ----------- |
| reserve | struct DataTypes.ReserveData | The reserve state from which the user is repaying |
| amountSent | uint256 | The amount sent for the repayment. Can be an actual value or uint(-1) |
| rateMode | enum DataTypes.InterestRateMode |  |
| onBehalfOf | address | The address of the user msg.sender is repaying for |
| stableDebt | uint256 | The borrow balance of the user |
| variableDebt | uint256 | The borrow balance of the user |

### validateSwapRateMode

```solidity
function validateSwapRateMode(struct DataTypes.ReserveData reserve, struct DataTypes.UserConfigurationMap userConfig, uint256 stableDebt, uint256 variableDebt, enum DataTypes.InterestRateMode currentRateMode) external view
```

_Validates a swap of borrow rate mode._

| Name | Type | Description |
| ---- | ---- | ----------- |
| reserve | struct DataTypes.ReserveData | The reserve state on which the user is swapping the rate |
| userConfig | struct DataTypes.UserConfigurationMap | The user reserves configuration |
| stableDebt | uint256 | The stable debt of the user |
| variableDebt | uint256 | The variable debt of the user |
| currentRateMode | enum DataTypes.InterestRateMode | The rate mode of the borrow |

### validateRebalanceStableBorrowRate

```solidity
function validateRebalanceStableBorrowRate(struct DataTypes.ReserveData reserve, address reserveAddress, contract IERC20 stableDebtToken, contract IERC20 variableDebtToken, address aTokenAddress) external view
```

_Validates a stable borrow rate rebalance action_

| Name | Type | Description |
| ---- | ---- | ----------- |
| reserve | struct DataTypes.ReserveData | The reserve state on which the user is getting rebalanced |
| reserveAddress | address | The address of the reserve |
| stableDebtToken | contract IERC20 | The stable debt token instance |
| variableDebtToken | contract IERC20 | The variable debt token instance |
| aTokenAddress | address | The address of the aToken contract |

### validateSetUseReserveAsCollateral

```solidity
function validateSetUseReserveAsCollateral(struct DataTypes.ReserveData reserve, address reserveAddress, bool useAsCollateral, mapping(address => struct DataTypes.ReserveData) reservesData, struct DataTypes.UserConfigurationMap userConfig, mapping(uint256 => address) reserves, uint256 reservesCount, address oracle) external view
```

_Validates the action of setting an asset as collateral_

| Name | Type | Description |
| ---- | ---- | ----------- |
| reserve | struct DataTypes.ReserveData | The state of the reserve that the user is enabling or disabling as collateral |
| reserveAddress | address | The address of the reserve |
| useAsCollateral | bool |  |
| reservesData | mapping(address &#x3D;&gt; struct DataTypes.ReserveData) | The data of all the reserves |
| userConfig | struct DataTypes.UserConfigurationMap | The state of the user for the specific reserve |
| reserves | mapping(uint256 &#x3D;&gt; address) | The addresses of all the active reserves |
| reservesCount | uint256 |  |
| oracle | address | The price oracle |

### validateFlashloan

```solidity
function validateFlashloan(address[] assets, uint256[] amounts) internal pure
```

_Validates a flashloan action_

| Name | Type | Description |
| ---- | ---- | ----------- |
| assets | address[] | The assets being flashborrowed |
| amounts | uint256[] | The amounts for each asset being borrowed |

### validateLiquidationCall

```solidity
function validateLiquidationCall(struct DataTypes.ReserveData collateralReserve, struct DataTypes.ReserveData principalReserve, struct DataTypes.UserConfigurationMap userConfig, uint256 userHealthFactor, uint256 userStableDebt, uint256 userVariableDebt) internal view returns (uint256, string)
```

_Validates the liquidation action_

| Name | Type | Description |
| ---- | ---- | ----------- |
| collateralReserve | struct DataTypes.ReserveData | The reserve data of the collateral |
| principalReserve | struct DataTypes.ReserveData | The reserve data of the principal |
| userConfig | struct DataTypes.UserConfigurationMap | The user configuration |
| userHealthFactor | uint256 | The user's health factor |
| userStableDebt | uint256 | Total stable debt balance of the user |
| userVariableDebt | uint256 | Total variable debt balance of the user |

### validateTransfer

```solidity
function validateTransfer(address from, mapping(address => struct DataTypes.ReserveData) reservesData, struct DataTypes.UserConfigurationMap userConfig, mapping(uint256 => address) reserves, uint256 reservesCount, address oracle) internal view
```

_Validates an aToken transfer_

| Name | Type | Description |
| ---- | ---- | ----------- |
| from | address | The user from which the aTokens are being transferred |
| reservesData | mapping(address &#x3D;&gt; struct DataTypes.ReserveData) | The state of all the reserves |
| userConfig | struct DataTypes.UserConfigurationMap | The state of the user for the specific reserve |
| reserves | mapping(uint256 &#x3D;&gt; address) | The addresses of all the active reserves |
| reservesCount | uint256 |  |
| oracle | address | The price oracle |

## MathUtils

### SECONDS_PER_YEAR

```solidity
uint256 SECONDS_PER_YEAR
```

_Ignoring leap years_

### calculateLinearInterest

```solidity
function calculateLinearInterest(uint256 rate, uint40 lastUpdateTimestamp) internal view returns (uint256)
```

_Function to calculate the interest accumulated using a linear interest rate formula_

| Name | Type | Description |
| ---- | ---- | ----------- |
| rate | uint256 | The interest rate, in ray |
| lastUpdateTimestamp | uint40 | The timestamp of the last update of the interest |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The interest rate linearly accumulated during the timeDelta, in ray |

### calculateCompoundedInterest

```solidity
function calculateCompoundedInterest(uint256 rate, uint40 lastUpdateTimestamp, uint256 currentTimestamp) internal pure returns (uint256)
```

_Function to calculate the interest using a compounded interest rate formula
To avoid expensive exponentiation, the calculation is performed using a binomial approximation:

 (1+x)^n = 1+n*x+[n/2*(n-1)]*x^2+[n/6*(n-1)*(n-2)*x^3...

The approximation slightly underpays liquidity providers and undercharges borrowers, with the advantage of great gas cost reductions
The whitepaper contains reference to the approximation and a table showing the margin of error per different time periods_

| Name | Type | Description |
| ---- | ---- | ----------- |
| rate | uint256 | The interest rate, in ray |
| lastUpdateTimestamp | uint40 | The timestamp of the last update of the interest |
| currentTimestamp | uint256 |  |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The interest rate compounded during the timeDelta, in ray |

### calculateCompoundedInterest

```solidity
function calculateCompoundedInterest(uint256 rate, uint40 lastUpdateTimestamp) internal view returns (uint256)
```

_Calculates the compounded interest between the timestamp of the last update and the current block timestamp_

| Name | Type | Description |
| ---- | ---- | ----------- |
| rate | uint256 | The interest rate (in ray) |
| lastUpdateTimestamp | uint40 | The timestamp from which the interest accumulation needs to be calculated |

## PercentageMath

Provides functions to perform percentage calculations

_Percentages are defined by default with 2 decimals of precision (100.00). The precision is indicated by PERCENTAGE_FACTOR
Operations are rounded half up_

### PERCENTAGE_FACTOR

```solidity
uint256 PERCENTAGE_FACTOR
```

### HALF_PERCENT

```solidity
uint256 HALF_PERCENT
```

### percentMul

```solidity
function percentMul(uint256 value, uint256 percentage) internal pure returns (uint256)
```

_Executes a percentage multiplication_

| Name | Type | Description |
| ---- | ---- | ----------- |
| value | uint256 | The value of which the percentage needs to be calculated |
| percentage | uint256 | The percentage of the value to be calculated |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The percentage of value |

### percentDiv

```solidity
function percentDiv(uint256 value, uint256 percentage) internal pure returns (uint256)
```

_Executes a percentage division_

| Name | Type | Description |
| ---- | ---- | ----------- |
| value | uint256 | The value of which the percentage needs to be calculated |
| percentage | uint256 | The percentage of the value to be calculated |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The value divided the percentage |

## WadRayMath

_Provides mul and div function for wads (decimal numbers with 18 digits precision) and rays (decimals with 27 digits)_

### WAD

```solidity
uint256 WAD
```

### halfWAD

```solidity
uint256 halfWAD
```

### RAY

```solidity
uint256 RAY
```

### halfRAY

```solidity
uint256 halfRAY
```

### WAD_RAY_RATIO

```solidity
uint256 WAD_RAY_RATIO
```

### ray

```solidity
function ray() internal pure returns (uint256)
```

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | One ray, 1e27 |

### wad

```solidity
function wad() internal pure returns (uint256)
```

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | One wad, 1e18 |

### halfRay

```solidity
function halfRay() internal pure returns (uint256)
```

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | Half ray, 1e27/2 |

### halfWad

```solidity
function halfWad() internal pure returns (uint256)
```

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | Half ray, 1e18/2 |

### wadMul

```solidity
function wadMul(uint256 a, uint256 b) internal pure returns (uint256)
```

_Multiplies two wad, rounding half up to the nearest wad_

| Name | Type | Description |
| ---- | ---- | ----------- |
| a | uint256 | Wad |
| b | uint256 | Wad |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The result of a*b, in wad |

### wadDiv

```solidity
function wadDiv(uint256 a, uint256 b) internal pure returns (uint256)
```

_Divides two wad, rounding half up to the nearest wad_

| Name | Type | Description |
| ---- | ---- | ----------- |
| a | uint256 | Wad |
| b | uint256 | Wad |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The result of a/b, in wad |

### rayMul

```solidity
function rayMul(uint256 a, uint256 b) internal pure returns (uint256)
```

_Multiplies two ray, rounding half up to the nearest ray_

| Name | Type | Description |
| ---- | ---- | ----------- |
| a | uint256 | Ray |
| b | uint256 | Ray |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The result of a*b, in ray |

### rayDiv

```solidity
function rayDiv(uint256 a, uint256 b) internal pure returns (uint256)
```

_Divides two ray, rounding half up to the nearest ray_

| Name | Type | Description |
| ---- | ---- | ----------- |
| a | uint256 | Ray |
| b | uint256 | Ray |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The result of a/b, in ray |

### rayToWad

```solidity
function rayToWad(uint256 a) internal pure returns (uint256)
```

_Casts ray down to wad_

| Name | Type | Description |
| ---- | ---- | ----------- |
| a | uint256 | Ray |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | a casted to wad, rounded half up to the nearest wad |

### wadToRay

```solidity
function wadToRay(uint256 a) internal pure returns (uint256)
```

_Converts wad up to ray_

| Name | Type | Description |
| ---- | ---- | ----------- |
| a | uint256 | Wad |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | a converted in ray |

## DataTypes

### ReserveData

```solidity
struct ReserveData {
  struct DataTypes.ReserveConfigurationMap configuration;
  uint128 liquidityIndex;
  uint128 variableBorrowIndex;
  uint128 currentLiquidityRate;
  uint128 currentVariableBorrowRate;
  uint128 currentStableBorrowRate;
  uint40 lastUpdateTimestamp;
  address aTokenAddress;
  address stableDebtTokenAddress;
  address variableDebtTokenAddress;
  address interestRateStrategyAddress;
  uint8 id;
}
```

### ReserveConfigurationMap

```solidity
struct ReserveConfigurationMap {
  uint256 data;
}
```

### UserConfigurationMap

```solidity
struct UserConfigurationMap {
  uint256 data;
}
```

### InterestRateMode

```solidity
enum InterestRateMode {
  NONE,
  STABLE,
  VARIABLE
}
```

## SafeMath

_Wrappers over Solidity's arithmetic operations with added overflow
checks.

Arithmetic operations in Solidity wrap on overflow. This can easily result
in bugs, because programmers usually assume that an overflow raises an
error, which is the standard behavior in high level programming languages.
`SafeMath` restores this intuition by reverting the transaction when an
operation overflows.

Using this library instead of the unchecked operations eliminates an entire
class of bugs, so it's recommended to use it always._

### tryAdd

```solidity
function tryAdd(uint256 a, uint256 b) internal pure returns (bool, uint256)
```

_Returns the addition of two unsigned integers, with an overflow flag.

_Available since v3.4.__

### trySub

```solidity
function trySub(uint256 a, uint256 b) internal pure returns (bool, uint256)
```

_Returns the substraction of two unsigned integers, with an overflow flag.

_Available since v3.4.__

### tryMul

```solidity
function tryMul(uint256 a, uint256 b) internal pure returns (bool, uint256)
```

_Returns the multiplication of two unsigned integers, with an overflow flag.

_Available since v3.4.__

### tryDiv

```solidity
function tryDiv(uint256 a, uint256 b) internal pure returns (bool, uint256)
```

_Returns the division of two unsigned integers, with a division by zero flag.

_Available since v3.4.__

### tryMod

```solidity
function tryMod(uint256 a, uint256 b) internal pure returns (bool, uint256)
```

_Returns the remainder of dividing two unsigned integers, with a division by zero flag.

_Available since v3.4.__

### add

```solidity
function add(uint256 a, uint256 b) internal pure returns (uint256)
```

_Returns the addition of two unsigned integers, reverting on
overflow.

Counterpart to Solidity's `+` operator.

Requirements:

- Addition cannot overflow._

### sub

```solidity
function sub(uint256 a, uint256 b) internal pure returns (uint256)
```

_Returns the subtraction of two unsigned integers, reverting on
overflow (when the result is negative).

Counterpart to Solidity's `-` operator.

Requirements:

- Subtraction cannot overflow._

### mul

```solidity
function mul(uint256 a, uint256 b) internal pure returns (uint256)
```

_Returns the multiplication of two unsigned integers, reverting on
overflow.

Counterpart to Solidity's `*` operator.

Requirements:

- Multiplication cannot overflow._

### div

```solidity
function div(uint256 a, uint256 b) internal pure returns (uint256)
```

_Returns the integer division of two unsigned integers, reverting on
division by zero. The result is rounded towards zero.

Counterpart to Solidity's `/` operator. Note: this function uses a
`revert` opcode (which leaves remaining gas untouched) while Solidity
uses an invalid opcode to revert (consuming all remaining gas).

Requirements:

- The divisor cannot be zero._

### mod

```solidity
function mod(uint256 a, uint256 b) internal pure returns (uint256)
```

_Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
reverting when dividing by zero.

Counterpart to Solidity's `%` operator. This function uses a `revert`
opcode (which leaves remaining gas untouched) while Solidity uses an
invalid opcode to revert (consuming all remaining gas).

Requirements:

- The divisor cannot be zero._

### sub

```solidity
function sub(uint256 a, uint256 b, string errorMessage) internal pure returns (uint256)
```

_Returns the subtraction of two unsigned integers, reverting with custom message on
overflow (when the result is negative).

CAUTION: This function is deprecated because it requires allocating memory for the error
message unnecessarily. For custom revert reasons use {trySub}.

Counterpart to Solidity's `-` operator.

Requirements:

- Subtraction cannot overflow._

### div

```solidity
function div(uint256 a, uint256 b, string errorMessage) internal pure returns (uint256)
```

_Returns the integer division of two unsigned integers, reverting with custom message on
division by zero. The result is rounded towards zero.

CAUTION: This function is deprecated because it requires allocating memory for the error
message unnecessarily. For custom revert reasons use {tryDiv}.

Counterpart to Solidity's `/` operator. Note: this function uses a
`revert` opcode (which leaves remaining gas untouched) while Solidity
uses an invalid opcode to revert (consuming all remaining gas).

Requirements:

- The divisor cannot be zero._

### mod

```solidity
function mod(uint256 a, uint256 b, string errorMessage) internal pure returns (uint256)
```

_Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
reverting with custom message when dividing by zero.

CAUTION: This function is deprecated because it requires allocating memory for the error
message unnecessarily. For custom revert reasons use {tryMod}.

Counterpart to Solidity's `%` operator. This function uses a `revert`
opcode (which leaves remaining gas untouched) while Solidity uses an
invalid opcode to revert (consuming all remaining gas).

Requirements:

- The divisor cannot be zero._

## IERC20

_Interface of the ERC20 standard as defined in the EIP._

### totalSupply

```solidity
function totalSupply() external view returns (uint256)
```

_Returns the amount of tokens in existence._

### balanceOf

```solidity
function balanceOf(address account) external view returns (uint256)
```

_Returns the amount of tokens owned by `account`._

### transfer

```solidity
function transfer(address recipient, uint256 amount) external returns (bool)
```

_Moves `amount` tokens from the caller's account to `recipient`.

Returns a boolean value indicating whether the operation succeeded.

Emits a {Transfer} event._

### allowance

```solidity
function allowance(address owner, address spender) external view returns (uint256)
```

_Returns the remaining number of tokens that `spender` will be
allowed to spend on behalf of `owner` through {transferFrom}. This is
zero by default.

This value changes when {approve} or {transferFrom} are called._

### approve

```solidity
function approve(address spender, uint256 amount) external returns (bool)
```

_Sets `amount` as the allowance of `spender` over the caller's tokens.

Returns a boolean value indicating whether the operation succeeded.

IMPORTANT: Beware that changing an allowance with this method brings the risk
that someone may use both the old and the new allowance by unfortunate
transaction ordering. One possible solution to mitigate this race
condition is to first reduce the spender's allowance to 0 and set the
desired value afterwards:
https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729

Emits an {Approval} event._

### transferFrom

```solidity
function transferFrom(address sender, address recipient, uint256 amount) external returns (bool)
```

_Moves `amount` tokens from `sender` to `recipient` using the
allowance mechanism. `amount` is then deducted from the caller's
allowance.

Returns a boolean value indicating whether the operation succeeded.

Emits a {Transfer} event._

### Transfer

```solidity
event Transfer(address from, address to, uint256 value)
```

_Emitted when `value` tokens are moved from one account (`from`) to
another (`to`).

Note that `value` may be zero._

### Approval

```solidity
event Approval(address owner, address spender, uint256 value)
```

_Emitted when the allowance of a `spender` for an `owner` is set by
a call to {approve}. `value` is the new allowance._

## Context

### _msgSender

```solidity
function _msgSender() internal view virtual returns (address payable)
```

### _msgData

```solidity
function _msgData() internal view virtual returns (bytes)
```

## IUniswapV3Factory

The Uniswap V3 Factory facilitates creation of Uniswap V3 pools and control over the protocol fees

### OwnerChanged

```solidity
event OwnerChanged(address oldOwner, address newOwner)
```

Emitted when the owner of the factory is changed

| Name | Type | Description |
| ---- | ---- | ----------- |
| oldOwner | address | The owner before the owner was changed |
| newOwner | address | The owner after the owner was changed |

### PoolCreated

```solidity
event PoolCreated(address token0, address token1, uint24 fee, int24 tickSpacing, address pool)
```

Emitted when a pool is created

| Name | Type | Description |
| ---- | ---- | ----------- |
| token0 | address | The first token of the pool by address sort order |
| token1 | address | The second token of the pool by address sort order |
| fee | uint24 | The fee collected upon every swap in the pool, denominated in hundredths of a bip |
| tickSpacing | int24 | The minimum number of ticks between initialized ticks |
| pool | address | The address of the created pool |

### FeeAmountEnabled

```solidity
event FeeAmountEnabled(uint24 fee, int24 tickSpacing)
```

Emitted when a new fee amount is enabled for pool creation via the factory

| Name | Type | Description |
| ---- | ---- | ----------- |
| fee | uint24 | The enabled fee, denominated in hundredths of a bip |
| tickSpacing | int24 | The minimum number of ticks between initialized ticks for pools created with the given fee |

### owner

```solidity
function owner() external view returns (address)
```

Returns the current owner of the factory

_Can be changed by the current owner via setOwner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The address of the factory owner |

### feeAmountTickSpacing

```solidity
function feeAmountTickSpacing(uint24 fee) external view returns (int24)
```

Returns the tick spacing for a given fee amount, if enabled, or 0 if not enabled

_A fee amount can never be removed, so this value should be hard coded or cached in the calling context_

| Name | Type | Description |
| ---- | ---- | ----------- |
| fee | uint24 | The enabled fee, denominated in hundredths of a bip. Returns 0 in case of unenabled fee |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | int24 | The tick spacing |

### getPool

```solidity
function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)
```

Returns the pool address for a given pair of tokens and a fee, or address 0 if it does not exist

_tokenA and tokenB may be passed in either token0/token1 or token1/token0 order_

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenA | address | The contract address of either token0 or token1 |
| tokenB | address | The contract address of the other token |
| fee | uint24 | The fee collected upon every swap in the pool, denominated in hundredths of a bip |

| Name | Type | Description |
| ---- | ---- | ----------- |
| pool | address | The pool address |

### createPool

```solidity
function createPool(address tokenA, address tokenB, uint24 fee) external returns (address pool)
```

Creates a pool for the given two tokens and fee

_tokenA and tokenB may be passed in either order: token0/token1 or token1/token0. tickSpacing is retrieved
from the fee. The call will revert if the pool already exists, the fee is invalid, or the token arguments
are invalid._

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenA | address | One of the two tokens in the desired pool |
| tokenB | address | The other of the two tokens in the desired pool |
| fee | uint24 | The desired fee for the pool |

| Name | Type | Description |
| ---- | ---- | ----------- |
| pool | address | The address of the newly created pool |

### setOwner

```solidity
function setOwner(address _owner) external
```

Updates the owner of the factory

_Must be called by the current owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _owner | address | The new owner of the factory |

### enableFeeAmount

```solidity
function enableFeeAmount(uint24 fee, int24 tickSpacing) external
```

Enables a fee amount with the given tickSpacing

_Fee amounts may never be removed once enabled_

| Name | Type | Description |
| ---- | ---- | ----------- |
| fee | uint24 | The fee amount to enable, denominated in hundredths of a bip (i.e. 1e-6) |
| tickSpacing | int24 | The spacing between ticks to be enforced for all pools created with the given fee amount |

## IUniswapV3Pool

A Uniswap pool facilitates swapping and automated market making between any two assets that strictly conform
to the ERC20 specification

_The pool interface is broken up into many smaller pieces_

## IUniswapV3PoolActions

Contains pool methods that can be called by anyone

### initialize

```solidity
function initialize(uint160 sqrtPriceX96) external
```

Sets the initial price for the pool

_Price is represented as a sqrt(amountToken1/amountToken0) Q64.96 value_

| Name | Type | Description |
| ---- | ---- | ----------- |
| sqrtPriceX96 | uint160 | the initial sqrt price of the pool as a Q64.96 |

### mint

```solidity
function mint(address recipient, int24 tickLower, int24 tickUpper, uint128 amount, bytes data) external returns (uint256 amount0, uint256 amount1)
```

Adds liquidity for the given recipient/tickLower/tickUpper position

_The caller of this method receives a callback in the form of IUniswapV3MintCallback#uniswapV3MintCallback
in which they must pay any token0 or token1 owed for the liquidity. The amount of token0/token1 due depends
on tickLower, tickUpper, the amount of liquidity, and the current price._

| Name | Type | Description |
| ---- | ---- | ----------- |
| recipient | address | The address for which the liquidity will be created |
| tickLower | int24 | The lower tick of the position in which to add liquidity |
| tickUpper | int24 | The upper tick of the position in which to add liquidity |
| amount | uint128 | The amount of liquidity to mint |
| data | bytes | Any data that should be passed through to the callback |

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount0 | uint256 | The amount of token0 that was paid to mint the given amount of liquidity. Matches the value in the callback |
| amount1 | uint256 | The amount of token1 that was paid to mint the given amount of liquidity. Matches the value in the callback |

### collect

```solidity
function collect(address recipient, int24 tickLower, int24 tickUpper, uint128 amount0Requested, uint128 amount1Requested) external returns (uint128 amount0, uint128 amount1)
```

Collects tokens owed to a position

_Does not recompute fees earned, which must be done either via mint or burn of any amount of liquidity.
Collect must be called by the position owner. To withdraw only token0 or only token1, amount0Requested or
amount1Requested may be set to zero. To withdraw all tokens owed, caller may pass any value greater than the
actual tokens owed, e.g. type(uint128).max. Tokens owed may be from accumulated swap fees or burned liquidity._

| Name | Type | Description |
| ---- | ---- | ----------- |
| recipient | address | The address which should receive the fees collected |
| tickLower | int24 | The lower tick of the position for which to collect fees |
| tickUpper | int24 | The upper tick of the position for which to collect fees |
| amount0Requested | uint128 | How much token0 should be withdrawn from the fees owed |
| amount1Requested | uint128 | How much token1 should be withdrawn from the fees owed |

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount0 | uint128 | The amount of fees collected in token0 |
| amount1 | uint128 | The amount of fees collected in token1 |

### burn

```solidity
function burn(int24 tickLower, int24 tickUpper, uint128 amount) external returns (uint256 amount0, uint256 amount1)
```

Burn liquidity from the sender and account tokens owed for the liquidity to the position

_Can be used to trigger a recalculation of fees owed to a position by calling with an amount of 0
Fees must be collected separately via a call to #collect_

| Name | Type | Description |
| ---- | ---- | ----------- |
| tickLower | int24 | The lower tick of the position for which to burn liquidity |
| tickUpper | int24 | The upper tick of the position for which to burn liquidity |
| amount | uint128 | How much liquidity to burn |

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount0 | uint256 | The amount of token0 sent to the recipient |
| amount1 | uint256 | The amount of token1 sent to the recipient |

### swap

```solidity
function swap(address recipient, bool zeroForOne, int256 amountSpecified, uint160 sqrtPriceLimitX96, bytes data) external returns (int256 amount0, int256 amount1)
```

Swap token0 for token1, or token1 for token0

_The caller of this method receives a callback in the form of IUniswapV3SwapCallback#uniswapV3SwapCallback_

| Name | Type | Description |
| ---- | ---- | ----------- |
| recipient | address | The address to receive the output of the swap |
| zeroForOne | bool | The direction of the swap, true for token0 to token1, false for token1 to token0 |
| amountSpecified | int256 | The amount of the swap, which implicitly configures the swap as exact input (positive), or exact output (negative) |
| sqrtPriceLimitX96 | uint160 | The Q64.96 sqrt price limit. If zero for one, the price cannot be less than this value after the swap. If one for zero, the price cannot be greater than this value after the swap |
| data | bytes | Any data to be passed through to the callback |

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount0 | int256 | The delta of the balance of token0 of the pool, exact when negative, minimum when positive |
| amount1 | int256 | The delta of the balance of token1 of the pool, exact when negative, minimum when positive |

### flash

```solidity
function flash(address recipient, uint256 amount0, uint256 amount1, bytes data) external
```

Receive token0 and/or token1 and pay it back, plus a fee, in the callback

_The caller of this method receives a callback in the form of IUniswapV3FlashCallback#uniswapV3FlashCallback
Can be used to donate underlying tokens pro-rata to currently in-range liquidity providers by calling
with 0 amount{0,1} and sending the donation amount(s) from the callback_

| Name | Type | Description |
| ---- | ---- | ----------- |
| recipient | address | The address which will receive the token0 and token1 amounts |
| amount0 | uint256 | The amount of token0 to send |
| amount1 | uint256 | The amount of token1 to send |
| data | bytes | Any data to be passed through to the callback |

### increaseObservationCardinalityNext

```solidity
function increaseObservationCardinalityNext(uint16 observationCardinalityNext) external
```

Increase the maximum number of price and liquidity observations that this pool will store

_This method is no-op if the pool already has an observationCardinalityNext greater than or equal to
the input observationCardinalityNext._

| Name | Type | Description |
| ---- | ---- | ----------- |
| observationCardinalityNext | uint16 | The desired minimum number of observations for the pool to store |

## IUniswapV3PoolDerivedState

Contains view functions to provide information about the pool that is computed rather than stored on the
blockchain. The functions here may have variable gas costs.

### observe

```solidity
function observe(uint32[] secondsAgos) external view returns (int56[] tickCumulatives, uint160[] secondsPerLiquidityCumulativeX128s)
```

Returns the cumulative tick and liquidity as of each timestamp `secondsAgo` from the current block timestamp

_To get a time weighted average tick or liquidity-in-range, you must call this with two values, one representing
the beginning of the period and another for the end of the period. E.g., to get the last hour time-weighted average tick,
you must call it with secondsAgos = [3600, 0].
The time weighted average tick represents the geometric time weighted average price of the pool, in
log base sqrt(1.0001) of token1 / token0. The TickMath library can be used to go from a tick value to a ratio._

| Name | Type | Description |
| ---- | ---- | ----------- |
| secondsAgos | uint32[] | From how long ago each cumulative tick and liquidity value should be returned |

| Name | Type | Description |
| ---- | ---- | ----------- |
| tickCumulatives | int56[] | Cumulative tick values as of each `secondsAgos` from the current block timestamp |
| secondsPerLiquidityCumulativeX128s | uint160[] | Cumulative seconds per liquidity-in-range value as of each `secondsAgos` from the current block timestamp |

### snapshotCumulativesInside

```solidity
function snapshotCumulativesInside(int24 tickLower, int24 tickUpper) external view returns (int56 tickCumulativeInside, uint160 secondsPerLiquidityInsideX128, uint32 secondsInside)
```

Returns a snapshot of the tick cumulative, seconds per liquidity and seconds inside a tick range

_Snapshots must only be compared to other snapshots, taken over a period for which a position existed.
I.e., snapshots cannot be compared if a position is not held for the entire period between when the first
snapshot is taken and the second snapshot is taken._

| Name | Type | Description |
| ---- | ---- | ----------- |
| tickLower | int24 | The lower tick of the range |
| tickUpper | int24 | The upper tick of the range |

| Name | Type | Description |
| ---- | ---- | ----------- |
| tickCumulativeInside | int56 | The snapshot of the tick accumulator for the range |
| secondsPerLiquidityInsideX128 | uint160 | The snapshot of seconds per liquidity for the range |
| secondsInside | uint32 | The snapshot of seconds per liquidity for the range |

## IUniswapV3PoolEvents

Contains all events emitted by the pool

### Initialize

```solidity
event Initialize(uint160 sqrtPriceX96, int24 tick)
```

Emitted exactly once by a pool when #initialize is first called on the pool

_Mint/Burn/Swap cannot be emitted by the pool before Initialize_

| Name | Type | Description |
| ---- | ---- | ----------- |
| sqrtPriceX96 | uint160 | The initial sqrt price of the pool, as a Q64.96 |
| tick | int24 | The initial tick of the pool, i.e. log base 1.0001 of the starting price of the pool |

### Mint

```solidity
event Mint(address sender, address owner, int24 tickLower, int24 tickUpper, uint128 amount, uint256 amount0, uint256 amount1)
```

Emitted when liquidity is minted for a given position

| Name | Type | Description |
| ---- | ---- | ----------- |
| sender | address | The address that minted the liquidity |
| owner | address | The owner of the position and recipient of any minted liquidity |
| tickLower | int24 | The lower tick of the position |
| tickUpper | int24 | The upper tick of the position |
| amount | uint128 | The amount of liquidity minted to the position range |
| amount0 | uint256 | How much token0 was required for the minted liquidity |
| amount1 | uint256 | How much token1 was required for the minted liquidity |

### Collect

```solidity
event Collect(address owner, address recipient, int24 tickLower, int24 tickUpper, uint128 amount0, uint128 amount1)
```

Emitted when fees are collected by the owner of a position

_Collect events may be emitted with zero amount0 and amount1 when the caller chooses not to collect fees_

| Name | Type | Description |
| ---- | ---- | ----------- |
| owner | address | The owner of the position for which fees are collected |
| recipient | address |  |
| tickLower | int24 | The lower tick of the position |
| tickUpper | int24 | The upper tick of the position |
| amount0 | uint128 | The amount of token0 fees collected |
| amount1 | uint128 | The amount of token1 fees collected |

### Burn

```solidity
event Burn(address owner, int24 tickLower, int24 tickUpper, uint128 amount, uint256 amount0, uint256 amount1)
```

Emitted when a position's liquidity is removed

_Does not withdraw any fees earned by the liquidity position, which must be withdrawn via #collect_

| Name | Type | Description |
| ---- | ---- | ----------- |
| owner | address | The owner of the position for which liquidity is removed |
| tickLower | int24 | The lower tick of the position |
| tickUpper | int24 | The upper tick of the position |
| amount | uint128 | The amount of liquidity to remove |
| amount0 | uint256 | The amount of token0 withdrawn |
| amount1 | uint256 | The amount of token1 withdrawn |

### Swap

```solidity
event Swap(address sender, address recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)
```

Emitted by the pool for any swaps between token0 and token1

| Name | Type | Description |
| ---- | ---- | ----------- |
| sender | address | The address that initiated the swap call, and that received the callback |
| recipient | address | The address that received the output of the swap |
| amount0 | int256 | The delta of the token0 balance of the pool |
| amount1 | int256 | The delta of the token1 balance of the pool |
| sqrtPriceX96 | uint160 | The sqrt(price) of the pool after the swap, as a Q64.96 |
| liquidity | uint128 | The liquidity of the pool after the swap |
| tick | int24 | The log base 1.0001 of price of the pool after the swap |

### Flash

```solidity
event Flash(address sender, address recipient, uint256 amount0, uint256 amount1, uint256 paid0, uint256 paid1)
```

Emitted by the pool for any flashes of token0/token1

| Name | Type | Description |
| ---- | ---- | ----------- |
| sender | address | The address that initiated the swap call, and that received the callback |
| recipient | address | The address that received the tokens from flash |
| amount0 | uint256 | The amount of token0 that was flashed |
| amount1 | uint256 | The amount of token1 that was flashed |
| paid0 | uint256 | The amount of token0 paid for the flash, which can exceed the amount0 plus the fee |
| paid1 | uint256 | The amount of token1 paid for the flash, which can exceed the amount1 plus the fee |

### IncreaseObservationCardinalityNext

```solidity
event IncreaseObservationCardinalityNext(uint16 observationCardinalityNextOld, uint16 observationCardinalityNextNew)
```

Emitted by the pool for increases to the number of observations that can be stored

_observationCardinalityNext is not the observation cardinality until an observation is written at the index
just before a mint/swap/burn._

| Name | Type | Description |
| ---- | ---- | ----------- |
| observationCardinalityNextOld | uint16 | The previous value of the next observation cardinality |
| observationCardinalityNextNew | uint16 | The updated value of the next observation cardinality |

### SetFeeProtocol

```solidity
event SetFeeProtocol(uint8 feeProtocol0Old, uint8 feeProtocol1Old, uint8 feeProtocol0New, uint8 feeProtocol1New)
```

Emitted when the protocol fee is changed by the pool

| Name | Type | Description |
| ---- | ---- | ----------- |
| feeProtocol0Old | uint8 | The previous value of the token0 protocol fee |
| feeProtocol1Old | uint8 | The previous value of the token1 protocol fee |
| feeProtocol0New | uint8 | The updated value of the token0 protocol fee |
| feeProtocol1New | uint8 | The updated value of the token1 protocol fee |

### CollectProtocol

```solidity
event CollectProtocol(address sender, address recipient, uint128 amount0, uint128 amount1)
```

Emitted when the collected protocol fees are withdrawn by the factory owner

| Name | Type | Description |
| ---- | ---- | ----------- |
| sender | address | The address that collects the protocol fees |
| recipient | address | The address that receives the collected protocol fees |
| amount0 | uint128 | The amount of token0 protocol fees that is withdrawn |
| amount1 | uint128 |  |

## IUniswapV3PoolImmutables

These parameters are fixed for a pool forever, i.e., the methods will always return the same values

### factory

```solidity
function factory() external view returns (address)
```

The contract that deployed the pool, which must adhere to the IUniswapV3Factory interface

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The contract address |

### token0

```solidity
function token0() external view returns (address)
```

The first of the two tokens of the pool, sorted by address

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The token contract address |

### token1

```solidity
function token1() external view returns (address)
```

The second of the two tokens of the pool, sorted by address

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The token contract address |

### fee

```solidity
function fee() external view returns (uint24)
```

The pool's fee in hundredths of a bip, i.e. 1e-6

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint24 | The fee |

### tickSpacing

```solidity
function tickSpacing() external view returns (int24)
```

The pool tick spacing

_Ticks can only be used at multiples of this value, minimum of 1 and always positive
e.g.: a tickSpacing of 3 means ticks can be initialized every 3rd tick, i.e., ..., -6, -3, 0, 3, 6, ...
This value is an int24 to avoid casting even though it is always positive._

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | int24 | The tick spacing |

### maxLiquidityPerTick

```solidity
function maxLiquidityPerTick() external view returns (uint128)
```

The maximum amount of position liquidity that can use any tick in the range

_This parameter is enforced per tick to prevent liquidity from overflowing a uint128 at any point, and
also prevents out-of-range liquidity from being used to prevent adding in-range liquidity to a pool_

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint128 | The max amount of liquidity per tick |

## IUniswapV3PoolOwnerActions

Contains pool methods that may only be called by the factory owner

### setFeeProtocol

```solidity
function setFeeProtocol(uint8 feeProtocol0, uint8 feeProtocol1) external
```

Set the denominator of the protocol's % share of the fees

| Name | Type | Description |
| ---- | ---- | ----------- |
| feeProtocol0 | uint8 | new protocol fee for token0 of the pool |
| feeProtocol1 | uint8 | new protocol fee for token1 of the pool |

### collectProtocol

```solidity
function collectProtocol(address recipient, uint128 amount0Requested, uint128 amount1Requested) external returns (uint128 amount0, uint128 amount1)
```

Collect the protocol fee accrued to the pool

| Name | Type | Description |
| ---- | ---- | ----------- |
| recipient | address | The address to which collected protocol fees should be sent |
| amount0Requested | uint128 | The maximum amount of token0 to send, can be 0 to collect fees in only token1 |
| amount1Requested | uint128 | The maximum amount of token1 to send, can be 0 to collect fees in only token0 |

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount0 | uint128 | The protocol fee collected in token0 |
| amount1 | uint128 | The protocol fee collected in token1 |

## IUniswapV3PoolState

These methods compose the pool's state, and can change with any frequency including multiple times
per transaction

### slot0

```solidity
function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)
```

The 0th storage slot in the pool stores many values, and is exposed as a single method to save gas
when accessed externally.

| Name | Type | Description |
| ---- | ---- | ----------- |
| sqrtPriceX96 | uint160 | The current price of the pool as a sqrt(token1/token0) Q64.96 value tick The current tick of the pool, i.e. according to the last tick transition that was run. This value may not always be equal to SqrtTickMath.getTickAtSqrtRatio(sqrtPriceX96) if the price is on a tick boundary. observationIndex The index of the last oracle observation that was written, observationCardinality The current maximum number of observations stored in the pool, observationCardinalityNext The next maximum number of observations, to be updated when the observation. feeProtocol The protocol fee for both tokens of the pool. Encoded as two 4 bit values, where the protocol fee of token1 is shifted 4 bits and the protocol fee of token0 is the lower 4 bits. Used as the denominator of a fraction of the swap fee, e.g. 4 means 1/4th of the swap fee. unlocked Whether the pool is currently locked to reentrancy |
| tick | int24 |  |
| observationIndex | uint16 |  |
| observationCardinality | uint16 |  |
| observationCardinalityNext | uint16 |  |
| feeProtocol | uint8 |  |
| unlocked | bool |  |

### feeGrowthGlobal0X128

```solidity
function feeGrowthGlobal0X128() external view returns (uint256)
```

The fee growth as a Q128.128 fees of token0 collected per unit of liquidity for the entire life of the pool

_This value can overflow the uint256_

### feeGrowthGlobal1X128

```solidity
function feeGrowthGlobal1X128() external view returns (uint256)
```

The fee growth as a Q128.128 fees of token1 collected per unit of liquidity for the entire life of the pool

_This value can overflow the uint256_

### protocolFees

```solidity
function protocolFees() external view returns (uint128 token0, uint128 token1)
```

The amounts of token0 and token1 that are owed to the protocol

_Protocol fees will never exceed uint128 max in either token_

### liquidity

```solidity
function liquidity() external view returns (uint128)
```

The currently in range liquidity available to the pool

_This value has no relationship to the total liquidity across all ticks_

### ticks

```solidity
function ticks(int24 tick) external view returns (uint128 liquidityGross, int128 liquidityNet, uint256 feeGrowthOutside0X128, uint256 feeGrowthOutside1X128, int56 tickCumulativeOutside, uint160 secondsPerLiquidityOutsideX128, uint32 secondsOutside, bool initialized)
```

Look up information about a specific tick in the pool

| Name | Type | Description |
| ---- | ---- | ----------- |
| tick | int24 | The tick to look up |

| Name | Type | Description |
| ---- | ---- | ----------- |
| liquidityGross | uint128 | the total amount of position liquidity that uses the pool either as tick lower or tick upper, liquidityNet how much liquidity changes when the pool price crosses the tick, feeGrowthOutside0X128 the fee growth on the other side of the tick from the current tick in token0, feeGrowthOutside1X128 the fee growth on the other side of the tick from the current tick in token1, tickCumulativeOutside the cumulative tick value on the other side of the tick from the current tick secondsPerLiquidityOutsideX128 the seconds spent per liquidity on the other side of the tick from the current tick, secondsOutside the seconds spent on the other side of the tick from the current tick, initialized Set to true if the tick is initialized, i.e. liquidityGross is greater than 0, otherwise equal to false. Outside values can only be used if the tick is initialized, i.e. if liquidityGross is greater than 0. In addition, these values are only relative and must be used only in comparison to previous snapshots for a specific position. |
| liquidityNet | int128 |  |
| feeGrowthOutside0X128 | uint256 |  |
| feeGrowthOutside1X128 | uint256 |  |
| tickCumulativeOutside | int56 |  |
| secondsPerLiquidityOutsideX128 | uint160 |  |
| secondsOutside | uint32 |  |
| initialized | bool |  |

### tickBitmap

```solidity
function tickBitmap(int16 wordPosition) external view returns (uint256)
```

Returns 256 packed tick initialized boolean values. See TickBitmap for more information

### positions

```solidity
function positions(bytes32 key) external view returns (uint128 _liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)
```

Returns the information about a position by the position's key

| Name | Type | Description |
| ---- | ---- | ----------- |
| key | bytes32 | The position's key is a hash of a preimage composed by the owner, tickLower and tickUpper |

| Name | Type | Description |
| ---- | ---- | ----------- |
| _liquidity | uint128 | The amount of liquidity in the position, Returns feeGrowthInside0LastX128 fee growth of token0 inside the tick range as of the last mint/burn/poke, Returns feeGrowthInside1LastX128 fee growth of token1 inside the tick range as of the last mint/burn/poke, Returns tokensOwed0 the computed amount of token0 owed to the position as of the last mint/burn/poke, Returns tokensOwed1 the computed amount of token1 owed to the position as of the last mint/burn/poke |
| feeGrowthInside0LastX128 | uint256 |  |
| feeGrowthInside1LastX128 | uint256 |  |
| tokensOwed0 | uint128 |  |
| tokensOwed1 | uint128 |  |

### observations

```solidity
function observations(uint256 index) external view returns (uint32 blockTimestamp, int56 tickCumulative, uint160 secondsPerLiquidityCumulativeX128, bool initialized)
```

Returns data about a specific observation index

_You most likely want to use #observe() instead of this method to get an observation as of some amount of time
ago, rather than at a specific index in the array._

| Name | Type | Description |
| ---- | ---- | ----------- |
| index | uint256 | The element of the observations array to fetch |

| Name | Type | Description |
| ---- | ---- | ----------- |
| blockTimestamp | uint32 | The timestamp of the observation, Returns tickCumulative the tick multiplied by seconds elapsed for the life of the pool as of the observation timestamp, Returns secondsPerLiquidityCumulativeX128 the seconds per in range liquidity for the life of the pool as of the observation timestamp, Returns initialized whether the observation has been initialized and the values are safe to use |
| tickCumulative | int56 |  |
| secondsPerLiquidityCumulativeX128 | uint160 |  |
| initialized | bool |  |

## AaveLPManager

### onlyOwner

```solidity
modifier onlyOwner()
```

### aaveInitLock

```solidity
modifier aaveInitLock()
```

### initAaveLPManager

```solidity
function initAaveLPManager(address _lendingPoolProviderAddr, address _protocolDataProviderAddr, address _wethAddr) public
```

### isAaveInit

```solidity
function isAaveInit() public view returns (bool)
```

### getAaveLPAddr

```solidity
function getAaveLPAddr() public view returns (address)
```

### getProtocolDataProviderAddr

```solidity
function getProtocolDataProviderAddr() public view returns (address)
```

### depositToAave

```solidity
function depositToAave(address erc20TokenAddr, uint256 amount) public
```

### isAaveSupportedToken

```solidity
function isAaveSupportedToken(address tokenAddr) public view returns (bool, uint256)
```

### addAaveSupportedToken

```solidity
function addAaveSupportedToken(address tokenAddr, uint256 targetPercentage) public
```

### removeAaveSupportedToken

```solidity
function removeAaveSupportedToken(address tokenAddr) public
```

### getAllAaveSupportedTokens

```solidity
function getAllAaveSupportedTokens() public view returns (address[])
```

### setAaveTokenTargetedPercentage

```solidity
function setAaveTokenTargetedPercentage(address tokenAddr, uint256 targetPercentage) public
```

### getAaveTokenTargetedPercentage

```solidity
function getAaveTokenTargetedPercentage(address tokenAddr) public view returns (uint256)
```

### getAaveTotalTargetWeight

```solidity
function getAaveTotalTargetWeight() public view returns (uint256)
```

### getAaveIncome

```solidity
function getAaveIncome(address tokenAddr) public view returns (uint256)
```

### liquidateAaveTreasury

```solidity
function liquidateAaveTreasury() public returns (bool)
```

### withdrawFromAave

```solidity
function withdrawFromAave(address erc20TokenAddr, uint256 amount) public returns (uint256)
```

### withdrawAllFromAave

```solidity
function withdrawAllFromAave(address asset) public
```

### getATokenBalance

```solidity
function getATokenBalance(address asset) public view returns (uint256)
```

### getATokenAddress

```solidity
function getATokenAddress(address asset) public view returns (address)
```

### balanceAaveLendingPool

```solidity
function balanceAaveLendingPool() public
```

## AaveLPManagerLib

### NAMESPACE

```solidity
string NAMESPACE
```

### POSITION

```solidity
bytes32 POSITION
```

### StateStorage

```solidity
struct StateStorage {
  bool isInit;
  address[] supportedTokens;
  mapping(address &#x3D;&gt; struct AaveLPManagerLib.TokenMetadata) tokenMetadata;
  address lpProviderAddr;
  address protocolDataProviderAddr;
  address wethAddr;
  uint256 totalTargetWeight;
}
```

### TokenMetadata

```solidity
struct TokenMetadata {
  uint256 targetPercent;
  uint256 actualPercent;
  address aToken;
}
```

### getState

```solidity
function getState() internal pure returns (struct AaveLPManagerLib.StateStorage stateStorage)
```

## ITuffOwnerV6

### requireOnlyOwner

```solidity
function requireOnlyOwner(address sender) external view
```

## IUniswapManager

### swapExactInputSingle

```solidity
function swapExactInputSingle(address inputToken, uint24 poolFee, address outputToken, uint256 amountIn) external returns (uint256 amountOut)
```

## IUniswapPriceConsumer

### getUniswapQuote

```solidity
function getUniswapQuote(address _tokenA, address _tokenB, uint24 _fee, uint32 _period) external view returns (uint256 quoteAmount)
```

## IUniswapV3Factory

The Uniswap V3 Factory facilitates creation of Uniswap V3 pools and control over the protocol fees

### OwnerChanged

```solidity
event OwnerChanged(address oldOwner, address newOwner)
```

Emitted when the owner of the factory is changed

| Name | Type | Description |
| ---- | ---- | ----------- |
| oldOwner | address | The owner before the owner was changed |
| newOwner | address | The owner after the owner was changed |

### PoolCreated

```solidity
event PoolCreated(address token0, address token1, uint24 fee, int24 tickSpacing, address pool)
```

Emitted when a pool is created

| Name | Type | Description |
| ---- | ---- | ----------- |
| token0 | address | The first token of the pool by address sort order |
| token1 | address | The second token of the pool by address sort order |
| fee | uint24 | The fee collected upon every swap in the pool, denominated in hundredths of a bip |
| tickSpacing | int24 | The minimum number of ticks between initialized ticks |
| pool | address | The address of the created pool |

### FeeAmountEnabled

```solidity
event FeeAmountEnabled(uint24 fee, int24 tickSpacing)
```

Emitted when a new fee amount is enabled for pool creation via the factory

| Name | Type | Description |
| ---- | ---- | ----------- |
| fee | uint24 | The enabled fee, denominated in hundredths of a bip |
| tickSpacing | int24 | The minimum number of ticks between initialized ticks for pools created with the given fee |

### owner

```solidity
function owner() external view returns (address)
```

Returns the current owner of the factory

_Can be changed by the current owner via setOwner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The address of the factory owner |

### feeAmountTickSpacing

```solidity
function feeAmountTickSpacing(uint24 fee) external view returns (int24)
```

Returns the tick spacing for a given fee amount, if enabled, or 0 if not enabled

_A fee amount can never be removed, so this value should be hard coded or cached in the calling context_

| Name | Type | Description |
| ---- | ---- | ----------- |
| fee | uint24 | The enabled fee, denominated in hundredths of a bip. Returns 0 in case of unenabled fee |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | int24 | The tick spacing |

### getPool

```solidity
function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)
```

Returns the pool address for a given pair of tokens and a fee, or address 0 if it does not exist

_tokenA and tokenB may be passed in either token0/token1 or token1/token0 order_

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenA | address | The contract address of either token0 or token1 |
| tokenB | address | The contract address of the other token |
| fee | uint24 | The fee collected upon every swap in the pool, denominated in hundredths of a bip |

| Name | Type | Description |
| ---- | ---- | ----------- |
| pool | address | The pool address |

### createPool

```solidity
function createPool(address tokenA, address tokenB, uint24 fee) external returns (address pool)
```

Creates a pool for the given two tokens and fee

_tokenA and tokenB may be passed in either order: token0/token1 or token1/token0. tickSpacing is retrieved
from the fee. The call will revert if the pool already exists, the fee is invalid, or the token arguments
are invalid._

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenA | address | One of the two tokens in the desired pool |
| tokenB | address | The other of the two tokens in the desired pool |
| fee | uint24 | The desired fee for the pool |

| Name | Type | Description |
| ---- | ---- | ----------- |
| pool | address | The address of the newly created pool |

### setOwner

```solidity
function setOwner(address _owner) external
```

Updates the owner of the factory

_Must be called by the current owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _owner | address | The new owner of the factory |

### enableFeeAmount

```solidity
function enableFeeAmount(uint24 fee, int24 tickSpacing) external
```

Enables a fee amount with the given tickSpacing

_Fee amounts may never be removed once enabled_

| Name | Type | Description |
| ---- | ---- | ----------- |
| fee | uint24 | The fee amount to enable, denominated in hundredths of a bip (i.e. 1e-6) |
| tickSpacing | int24 | The spacing between ticks to be enforced for all pools created with the given fee amount |

## IUniswapV3Pool

A Uniswap pool facilitates swapping and automated market making between any two assets that strictly conform
to the ERC20 specification

_The pool interface is broken up into many smaller pieces_

## IUniswapV3PoolActions

Contains pool methods that can be called by anyone

### initialize

```solidity
function initialize(uint160 sqrtPriceX96) external
```

Sets the initial price for the pool

_Price is represented as a sqrt(amountToken1/amountToken0) Q64.96 value_

| Name | Type | Description |
| ---- | ---- | ----------- |
| sqrtPriceX96 | uint160 | the initial sqrt price of the pool as a Q64.96 |

### mint

```solidity
function mint(address recipient, int24 tickLower, int24 tickUpper, uint128 amount, bytes data) external returns (uint256 amount0, uint256 amount1)
```

Adds liquidity for the given recipient/tickLower/tickUpper position

_The caller of this method receives a callback in the form of IUniswapV3MintCallback#uniswapV3MintCallback
in which they must pay any token0 or token1 owed for the liquidity. The amount of token0/token1 due depends
on tickLower, tickUpper, the amount of liquidity, and the current price._

| Name | Type | Description |
| ---- | ---- | ----------- |
| recipient | address | The address for which the liquidity will be created |
| tickLower | int24 | The lower tick of the position in which to add liquidity |
| tickUpper | int24 | The upper tick of the position in which to add liquidity |
| amount | uint128 | The amount of liquidity to mint |
| data | bytes | Any data that should be passed through to the callback |

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount0 | uint256 | The amount of token0 that was paid to mint the given amount of liquidity. Matches the value in the callback |
| amount1 | uint256 | The amount of token1 that was paid to mint the given amount of liquidity. Matches the value in the callback |

### collect

```solidity
function collect(address recipient, int24 tickLower, int24 tickUpper, uint128 amount0Requested, uint128 amount1Requested) external returns (uint128 amount0, uint128 amount1)
```

Collects tokens owed to a position

_Does not recompute fees earned, which must be done either via mint or burn of any amount of liquidity.
Collect must be called by the position owner. To withdraw only token0 or only token1, amount0Requested or
amount1Requested may be set to zero. To withdraw all tokens owed, caller may pass any value greater than the
actual tokens owed, e.g. type(uint128).max. Tokens owed may be from accumulated swap fees or burned liquidity._

| Name | Type | Description |
| ---- | ---- | ----------- |
| recipient | address | The address which should receive the fees collected |
| tickLower | int24 | The lower tick of the position for which to collect fees |
| tickUpper | int24 | The upper tick of the position for which to collect fees |
| amount0Requested | uint128 | How much token0 should be withdrawn from the fees owed |
| amount1Requested | uint128 | How much token1 should be withdrawn from the fees owed |

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount0 | uint128 | The amount of fees collected in token0 |
| amount1 | uint128 | The amount of fees collected in token1 |

### burn

```solidity
function burn(int24 tickLower, int24 tickUpper, uint128 amount) external returns (uint256 amount0, uint256 amount1)
```

Burn liquidity from the sender and account tokens owed for the liquidity to the position

_Can be used to trigger a recalculation of fees owed to a position by calling with an amount of 0
Fees must be collected separately via a call to #collect_

| Name | Type | Description |
| ---- | ---- | ----------- |
| tickLower | int24 | The lower tick of the position for which to burn liquidity |
| tickUpper | int24 | The upper tick of the position for which to burn liquidity |
| amount | uint128 | How much liquidity to burn |

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount0 | uint256 | The amount of token0 sent to the recipient |
| amount1 | uint256 | The amount of token1 sent to the recipient |

### swap

```solidity
function swap(address recipient, bool zeroForOne, int256 amountSpecified, uint160 sqrtPriceLimitX96, bytes data) external returns (int256 amount0, int256 amount1)
```

Swap token0 for token1, or token1 for token0

_The caller of this method receives a callback in the form of IUniswapV3SwapCallback#uniswapV3SwapCallback_

| Name | Type | Description |
| ---- | ---- | ----------- |
| recipient | address | The address to receive the output of the swap |
| zeroForOne | bool | The direction of the swap, true for token0 to token1, false for token1 to token0 |
| amountSpecified | int256 | The amount of the swap, which implicitly configures the swap as exact input (positive), or exact output (negative) |
| sqrtPriceLimitX96 | uint160 | The Q64.96 sqrt price limit. If zero for one, the price cannot be less than this value after the swap. If one for zero, the price cannot be greater than this value after the swap |
| data | bytes | Any data to be passed through to the callback |

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount0 | int256 | The delta of the balance of token0 of the pool, exact when negative, minimum when positive |
| amount1 | int256 | The delta of the balance of token1 of the pool, exact when negative, minimum when positive |

### flash

```solidity
function flash(address recipient, uint256 amount0, uint256 amount1, bytes data) external
```

Receive token0 and/or token1 and pay it back, plus a fee, in the callback

_The caller of this method receives a callback in the form of IUniswapV3FlashCallback#uniswapV3FlashCallback
Can be used to donate underlying tokens pro-rata to currently in-range liquidity providers by calling
with 0 amount{0,1} and sending the donation amount(s) from the callback_

| Name | Type | Description |
| ---- | ---- | ----------- |
| recipient | address | The address which will receive the token0 and token1 amounts |
| amount0 | uint256 | The amount of token0 to send |
| amount1 | uint256 | The amount of token1 to send |
| data | bytes | Any data to be passed through to the callback |

### increaseObservationCardinalityNext

```solidity
function increaseObservationCardinalityNext(uint16 observationCardinalityNext) external
```

Increase the maximum number of price and liquidity observations that this pool will store

_This method is no-op if the pool already has an observationCardinalityNext greater than or equal to
the input observationCardinalityNext._

| Name | Type | Description |
| ---- | ---- | ----------- |
| observationCardinalityNext | uint16 | The desired minimum number of observations for the pool to store |

## IUniswapV3PoolDerivedState

Contains view functions to provide information about the pool that is computed rather than stored on the
blockchain. The functions here may have variable gas costs.

### observe

```solidity
function observe(uint32[] secondsAgos) external view returns (int56[] tickCumulatives, uint160[] secondsPerLiquidityCumulativeX128s)
```

Returns the cumulative tick and liquidity as of each timestamp `secondsAgo` from the current block timestamp

_To get a time weighted average tick or liquidity-in-range, you must call this with two values, one representing
the beginning of the period and another for the end of the period. E.g., to get the last hour time-weighted average tick,
you must call it with secondsAgos = [3600, 0].
The time weighted average tick represents the geometric time weighted average price of the pool, in
log base sqrt(1.0001) of token1 / token0. The TickMath library can be used to go from a tick value to a ratio._

| Name | Type | Description |
| ---- | ---- | ----------- |
| secondsAgos | uint32[] | From how long ago each cumulative tick and liquidity value should be returned |

| Name | Type | Description |
| ---- | ---- | ----------- |
| tickCumulatives | int56[] | Cumulative tick values as of each `secondsAgos` from the current block timestamp |
| secondsPerLiquidityCumulativeX128s | uint160[] | Cumulative seconds per liquidity-in-range value as of each `secondsAgos` from the current block timestamp |

### snapshotCumulativesInside

```solidity
function snapshotCumulativesInside(int24 tickLower, int24 tickUpper) external view returns (int56 tickCumulativeInside, uint160 secondsPerLiquidityInsideX128, uint32 secondsInside)
```

Returns a snapshot of the tick cumulative, seconds per liquidity and seconds inside a tick range

_Snapshots must only be compared to other snapshots, taken over a period for which a position existed.
I.e., snapshots cannot be compared if a position is not held for the entire period between when the first
snapshot is taken and the second snapshot is taken._

| Name | Type | Description |
| ---- | ---- | ----------- |
| tickLower | int24 | The lower tick of the range |
| tickUpper | int24 | The upper tick of the range |

| Name | Type | Description |
| ---- | ---- | ----------- |
| tickCumulativeInside | int56 | The snapshot of the tick accumulator for the range |
| secondsPerLiquidityInsideX128 | uint160 | The snapshot of seconds per liquidity for the range |
| secondsInside | uint32 | The snapshot of seconds per liquidity for the range |

## IUniswapV3PoolEvents

Contains all events emitted by the pool

### Initialize

```solidity
event Initialize(uint160 sqrtPriceX96, int24 tick)
```

Emitted exactly once by a pool when #initialize is first called on the pool

_Mint/Burn/Swap cannot be emitted by the pool before Initialize_

| Name | Type | Description |
| ---- | ---- | ----------- |
| sqrtPriceX96 | uint160 | The initial sqrt price of the pool, as a Q64.96 |
| tick | int24 | The initial tick of the pool, i.e. log base 1.0001 of the starting price of the pool |

### Mint

```solidity
event Mint(address sender, address owner, int24 tickLower, int24 tickUpper, uint128 amount, uint256 amount0, uint256 amount1)
```

Emitted when liquidity is minted for a given position

| Name | Type | Description |
| ---- | ---- | ----------- |
| sender | address | The address that minted the liquidity |
| owner | address | The owner of the position and recipient of any minted liquidity |
| tickLower | int24 | The lower tick of the position |
| tickUpper | int24 | The upper tick of the position |
| amount | uint128 | The amount of liquidity minted to the position range |
| amount0 | uint256 | How much token0 was required for the minted liquidity |
| amount1 | uint256 | How much token1 was required for the minted liquidity |

### Collect

```solidity
event Collect(address owner, address recipient, int24 tickLower, int24 tickUpper, uint128 amount0, uint128 amount1)
```

Emitted when fees are collected by the owner of a position

_Collect events may be emitted with zero amount0 and amount1 when the caller chooses not to collect fees_

| Name | Type | Description |
| ---- | ---- | ----------- |
| owner | address | The owner of the position for which fees are collected |
| recipient | address |  |
| tickLower | int24 | The lower tick of the position |
| tickUpper | int24 | The upper tick of the position |
| amount0 | uint128 | The amount of token0 fees collected |
| amount1 | uint128 | The amount of token1 fees collected |

### Burn

```solidity
event Burn(address owner, int24 tickLower, int24 tickUpper, uint128 amount, uint256 amount0, uint256 amount1)
```

Emitted when a position's liquidity is removed

_Does not withdraw any fees earned by the liquidity position, which must be withdrawn via #collect_

| Name | Type | Description |
| ---- | ---- | ----------- |
| owner | address | The owner of the position for which liquidity is removed |
| tickLower | int24 | The lower tick of the position |
| tickUpper | int24 | The upper tick of the position |
| amount | uint128 | The amount of liquidity to remove |
| amount0 | uint256 | The amount of token0 withdrawn |
| amount1 | uint256 | The amount of token1 withdrawn |

### Swap

```solidity
event Swap(address sender, address recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)
```

Emitted by the pool for any swaps between token0 and token1

| Name | Type | Description |
| ---- | ---- | ----------- |
| sender | address | The address that initiated the swap call, and that received the callback |
| recipient | address | The address that received the output of the swap |
| amount0 | int256 | The delta of the token0 balance of the pool |
| amount1 | int256 | The delta of the token1 balance of the pool |
| sqrtPriceX96 | uint160 | The sqrt(price) of the pool after the swap, as a Q64.96 |
| liquidity | uint128 | The liquidity of the pool after the swap |
| tick | int24 | The log base 1.0001 of price of the pool after the swap |

### Flash

```solidity
event Flash(address sender, address recipient, uint256 amount0, uint256 amount1, uint256 paid0, uint256 paid1)
```

Emitted by the pool for any flashes of token0/token1

| Name | Type | Description |
| ---- | ---- | ----------- |
| sender | address | The address that initiated the swap call, and that received the callback |
| recipient | address | The address that received the tokens from flash |
| amount0 | uint256 | The amount of token0 that was flashed |
| amount1 | uint256 | The amount of token1 that was flashed |
| paid0 | uint256 | The amount of token0 paid for the flash, which can exceed the amount0 plus the fee |
| paid1 | uint256 | The amount of token1 paid for the flash, which can exceed the amount1 plus the fee |

### IncreaseObservationCardinalityNext

```solidity
event IncreaseObservationCardinalityNext(uint16 observationCardinalityNextOld, uint16 observationCardinalityNextNew)
```

Emitted by the pool for increases to the number of observations that can be stored

_observationCardinalityNext is not the observation cardinality until an observation is written at the index
just before a mint/swap/burn._

| Name | Type | Description |
| ---- | ---- | ----------- |
| observationCardinalityNextOld | uint16 | The previous value of the next observation cardinality |
| observationCardinalityNextNew | uint16 | The updated value of the next observation cardinality |

### SetFeeProtocol

```solidity
event SetFeeProtocol(uint8 feeProtocol0Old, uint8 feeProtocol1Old, uint8 feeProtocol0New, uint8 feeProtocol1New)
```

Emitted when the protocol fee is changed by the pool

| Name | Type | Description |
| ---- | ---- | ----------- |
| feeProtocol0Old | uint8 | The previous value of the token0 protocol fee |
| feeProtocol1Old | uint8 | The previous value of the token1 protocol fee |
| feeProtocol0New | uint8 | The updated value of the token0 protocol fee |
| feeProtocol1New | uint8 | The updated value of the token1 protocol fee |

### CollectProtocol

```solidity
event CollectProtocol(address sender, address recipient, uint128 amount0, uint128 amount1)
```

Emitted when the collected protocol fees are withdrawn by the factory owner

| Name | Type | Description |
| ---- | ---- | ----------- |
| sender | address | The address that collects the protocol fees |
| recipient | address | The address that receives the collected protocol fees |
| amount0 | uint128 | The amount of token0 protocol fees that is withdrawn |
| amount1 | uint128 |  |

## IUniswapV3PoolImmutables

These parameters are fixed for a pool forever, i.e., the methods will always return the same values

### factory

```solidity
function factory() external view returns (address)
```

The contract that deployed the pool, which must adhere to the IUniswapV3Factory interface

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The contract address |

### token0

```solidity
function token0() external view returns (address)
```

The first of the two tokens of the pool, sorted by address

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The token contract address |

### token1

```solidity
function token1() external view returns (address)
```

The second of the two tokens of the pool, sorted by address

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The token contract address |

### fee

```solidity
function fee() external view returns (uint24)
```

The pool's fee in hundredths of a bip, i.e. 1e-6

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint24 | The fee |

### tickSpacing

```solidity
function tickSpacing() external view returns (int24)
```

The pool tick spacing

_Ticks can only be used at multiples of this value, minimum of 1 and always positive
e.g.: a tickSpacing of 3 means ticks can be initialized every 3rd tick, i.e., ..., -6, -3, 0, 3, 6, ...
This value is an int24 to avoid casting even though it is always positive._

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | int24 | The tick spacing |

### maxLiquidityPerTick

```solidity
function maxLiquidityPerTick() external view returns (uint128)
```

The maximum amount of position liquidity that can use any tick in the range

_This parameter is enforced per tick to prevent liquidity from overflowing a uint128 at any point, and
also prevents out-of-range liquidity from being used to prevent adding in-range liquidity to a pool_

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint128 | The max amount of liquidity per tick |

## IUniswapV3PoolOwnerActions

Contains pool methods that may only be called by the factory owner

### setFeeProtocol

```solidity
function setFeeProtocol(uint8 feeProtocol0, uint8 feeProtocol1) external
```

Set the denominator of the protocol's % share of the fees

| Name | Type | Description |
| ---- | ---- | ----------- |
| feeProtocol0 | uint8 | new protocol fee for token0 of the pool |
| feeProtocol1 | uint8 | new protocol fee for token1 of the pool |

### collectProtocol

```solidity
function collectProtocol(address recipient, uint128 amount0Requested, uint128 amount1Requested) external returns (uint128 amount0, uint128 amount1)
```

Collect the protocol fee accrued to the pool

| Name | Type | Description |
| ---- | ---- | ----------- |
| recipient | address | The address to which collected protocol fees should be sent |
| amount0Requested | uint128 | The maximum amount of token0 to send, can be 0 to collect fees in only token1 |
| amount1Requested | uint128 | The maximum amount of token1 to send, can be 0 to collect fees in only token0 |

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount0 | uint128 | The protocol fee collected in token0 |
| amount1 | uint128 | The protocol fee collected in token1 |

## IUniswapV3PoolState

These methods compose the pool's state, and can change with any frequency including multiple times
per transaction

### slot0

```solidity
function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)
```

The 0th storage slot in the pool stores many values, and is exposed as a single method to save gas
when accessed externally.

| Name | Type | Description |
| ---- | ---- | ----------- |
| sqrtPriceX96 | uint160 | The current price of the pool as a sqrt(token1/token0) Q64.96 value tick The current tick of the pool, i.e. according to the last tick transition that was run. This value may not always be equal to SqrtTickMath.getTickAtSqrtRatio(sqrtPriceX96) if the price is on a tick boundary. observationIndex The index of the last oracle observation that was written, observationCardinality The current maximum number of observations stored in the pool, observationCardinalityNext The next maximum number of observations, to be updated when the observation. feeProtocol The protocol fee for both tokens of the pool. Encoded as two 4 bit values, where the protocol fee of token1 is shifted 4 bits and the protocol fee of token0 is the lower 4 bits. Used as the denominator of a fraction of the swap fee, e.g. 4 means 1/4th of the swap fee. unlocked Whether the pool is currently locked to reentrancy |
| tick | int24 |  |
| observationIndex | uint16 |  |
| observationCardinality | uint16 |  |
| observationCardinalityNext | uint16 |  |
| feeProtocol | uint8 |  |
| unlocked | bool |  |

### feeGrowthGlobal0X128

```solidity
function feeGrowthGlobal0X128() external view returns (uint256)
```

The fee growth as a Q128.128 fees of token0 collected per unit of liquidity for the entire life of the pool

_This value can overflow the uint256_

### feeGrowthGlobal1X128

```solidity
function feeGrowthGlobal1X128() external view returns (uint256)
```

The fee growth as a Q128.128 fees of token1 collected per unit of liquidity for the entire life of the pool

_This value can overflow the uint256_

### protocolFees

```solidity
function protocolFees() external view returns (uint128 token0, uint128 token1)
```

The amounts of token0 and token1 that are owed to the protocol

_Protocol fees will never exceed uint128 max in either token_

### liquidity

```solidity
function liquidity() external view returns (uint128)
```

The currently in range liquidity available to the pool

_This value has no relationship to the total liquidity across all ticks_

### ticks

```solidity
function ticks(int24 tick) external view returns (uint128 liquidityGross, int128 liquidityNet, uint256 feeGrowthOutside0X128, uint256 feeGrowthOutside1X128, int56 tickCumulativeOutside, uint160 secondsPerLiquidityOutsideX128, uint32 secondsOutside, bool initialized)
```

Look up information about a specific tick in the pool

| Name | Type | Description |
| ---- | ---- | ----------- |
| tick | int24 | The tick to look up |

| Name | Type | Description |
| ---- | ---- | ----------- |
| liquidityGross | uint128 | the total amount of position liquidity that uses the pool either as tick lower or tick upper, liquidityNet how much liquidity changes when the pool price crosses the tick, feeGrowthOutside0X128 the fee growth on the other side of the tick from the current tick in token0, feeGrowthOutside1X128 the fee growth on the other side of the tick from the current tick in token1, tickCumulativeOutside the cumulative tick value on the other side of the tick from the current tick secondsPerLiquidityOutsideX128 the seconds spent per liquidity on the other side of the tick from the current tick, secondsOutside the seconds spent on the other side of the tick from the current tick, initialized Set to true if the tick is initialized, i.e. liquidityGross is greater than 0, otherwise equal to false. Outside values can only be used if the tick is initialized, i.e. if liquidityGross is greater than 0. In addition, these values are only relative and must be used only in comparison to previous snapshots for a specific position. |
| liquidityNet | int128 |  |
| feeGrowthOutside0X128 | uint256 |  |
| feeGrowthOutside1X128 | uint256 |  |
| tickCumulativeOutside | int56 |  |
| secondsPerLiquidityOutsideX128 | uint160 |  |
| secondsOutside | uint32 |  |
| initialized | bool |  |

### tickBitmap

```solidity
function tickBitmap(int16 wordPosition) external view returns (uint256)
```

Returns 256 packed tick initialized boolean values. See TickBitmap for more information

### positions

```solidity
function positions(bytes32 key) external view returns (uint128 _liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)
```

Returns the information about a position by the position's key

| Name | Type | Description |
| ---- | ---- | ----------- |
| key | bytes32 | The position's key is a hash of a preimage composed by the owner, tickLower and tickUpper |

| Name | Type | Description |
| ---- | ---- | ----------- |
| _liquidity | uint128 | The amount of liquidity in the position, Returns feeGrowthInside0LastX128 fee growth of token0 inside the tick range as of the last mint/burn/poke, Returns feeGrowthInside1LastX128 fee growth of token1 inside the tick range as of the last mint/burn/poke, Returns tokensOwed0 the computed amount of token0 owed to the position as of the last mint/burn/poke, Returns tokensOwed1 the computed amount of token1 owed to the position as of the last mint/burn/poke |
| feeGrowthInside0LastX128 | uint256 |  |
| feeGrowthInside1LastX128 | uint256 |  |
| tokensOwed0 | uint128 |  |
| tokensOwed1 | uint128 |  |

### observations

```solidity
function observations(uint256 index) external view returns (uint32 blockTimestamp, int56 tickCumulative, uint160 secondsPerLiquidityCumulativeX128, bool initialized)
```

Returns data about a specific observation index

_You most likely want to use #observe() instead of this method to get an observation as of some amount of time
ago, rather than at a specific index in the array._

| Name | Type | Description |
| ---- | ---- | ----------- |
| index | uint256 | The element of the observations array to fetch |

| Name | Type | Description |
| ---- | ---- | ----------- |
| blockTimestamp | uint32 | The timestamp of the observation, Returns tickCumulative the tick multiplied by seconds elapsed for the life of the pool as of the observation timestamp, Returns secondsPerLiquidityCumulativeX128 the seconds per in range liquidity for the life of the pool as of the observation timestamp, Returns initialized whether the observation has been initialized and the values are safe to use |
| tickCumulative | int56 |  |
| secondsPerLiquidityCumulativeX128 | uint160 |  |
| initialized | bool |  |

## UniswapPriceConsumerLib

### NAMESPACE

```solidity
string NAMESPACE
```

### POSITION

```solidity
bytes32 POSITION
```

### StateStorage

```solidity
struct StateStorage {
  bool isInit;
  address factoryAddr;
}
```

### getState

```solidity
function getState() internal pure returns (struct UniswapPriceConsumerLib.StateStorage stateStorage)
```

