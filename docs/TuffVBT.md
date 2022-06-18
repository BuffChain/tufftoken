# Solidity API

## TuffVBT

### onlyOwner

```solidity
modifier onlyOwner()
```

### initTuffVBT

```solidity
function initTuffVBT(address _initialOwner, string _name, string _symbol, uint8 _decimals, uint256 _farmFee, uint256 _devFee, address _devWalletAddress, uint256 _totalSupply) public
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
function calculateFee(uint256 _amount, uint256 feePercent, bool takeFee) public pure returns (uint256)
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

