# Solidity API

## TuffVBT


This contract is the implementation of a TuffVBT (volume bond token). It is an ERC20 token that takes fees
upon transfer to help build up the treasury.





### onlyOwner

```solidity
modifier onlyOwner()
```



_functions with the onlyOwner modifier can only be called by the contract itself or the contract owner_




### initTuffVBT

```solidity
function initTuffVBT(address _initialOwner, string _name, string _symbol, uint8 _decimals, uint256 _farmFee, uint256 _devFee, address _devWalletAddress, uint256 _totalSupply) public
```

Basically a constructor, but the hardhat-deploy plugin does not support diamond contracts with facets that has
constructors. We imitate a constructor with a one-time only function. This is called immediately after deployment

_modifier onlyOwner can only be called by the contract itself or the contract owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _initialOwner | address | the initial owner of the contract |
| _name | string | name of the token |
| _symbol | string | symbol of the token |
| _decimals | uint8 | decimals of the token |
| _farmFee | uint256 | fee amount taken to build the treasury |
| _devFee | uint256 | fee amount sent to dev team for continued development work |
| _devWalletAddress | address | address to send the dev fees |
| _totalSupply | uint256 | total supply of the token |



### isTuffVBTInit

```solidity
function isTuffVBTInit() public view returns (bool)
```







### name

```solidity
function name() public view returns (string)
```

returns the name of the token





### symbol

```solidity
function symbol() public view returns (string)
```

returns the symbol of the token





### decimals

```solidity
function decimals() public view returns (uint8)
```

returns the decimals of the token





### totalSupply

```solidity
function totalSupply() public view returns (uint256)
```

returns the total supply of the token





### getFarmFee

```solidity
function getFarmFee() public view returns (uint256)
```

returns the farm fee (treasury fee) of the token





### setFarmFee

```solidity
function setFarmFee(uint256 _farmFee) public
```

used by contract owner to set the farm fee

_modifier onlyOwner can only be called by the contract itself or the contract owner_




### getDevFee

```solidity
function getDevFee() public view returns (uint256)
```

returns the dev fee of the token





### setDevFee

```solidity
function setDevFee(uint256 _devFee) public
```

used by contract owner to set the dev fee

_modifier onlyOwner can only be called by the contract itself or the contract owner_




### getDevWalletAddress

```solidity
function getDevWalletAddress() public view returns (address)
```

returns the dev wallet address of the token





### setDevWalletAddress

```solidity
function setDevWalletAddress(address _devWalletAddress) public
```

used by contract owner to set the dev wallet address

_modifier onlyOwner can only be called by the contract itself or the contract owner_




### balanceOf

```solidity
function balanceOf(address account) public view returns (uint256)
```

get the balance of an address


| Name | Type | Description |
| ---- | ---- | ----------- |
| account | address | account to get the balance of |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | returns the balance |


### transfer

```solidity
function transfer(address recipient, uint256 amount) public returns (bool)
```

transfer an amount of the TuffVBT to an account


| Name | Type | Description |
| ---- | ---- | ----------- |
| recipient | address | recipient of the tokens from the msg sender |
| amount | uint256 | amount of tokens being sent (before fees are taken) |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | returns true if transfer is successful |


### allowance

```solidity
function allowance(address owner, address spender) public view returns (uint256)
```

get the allowance spender for a specified owner


| Name | Type | Description |
| ---- | ---- | ----------- |
| owner | address | owner of the tokens |
| spender | address | spender of the owners tokens |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | returns allowance |


### approve

```solidity
function approve(address spender, uint256 amount) public returns (bool)
```

approve a holder to spend an amount


| Name | Type | Description |
| ---- | ---- | ----------- |
| spender | address | address that will be granted to spend the specified amount |
| amount | uint256 | amount granted to the spender to spend |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | returns true if approval is successful |


### transferFrom

```solidity
function transferFrom(address from, address to, uint256 amount) public returns (bool)
```

transfer from an account to another


| Name | Type | Description |
| ---- | ---- | ----------- |
| from | address | from address |
| to | address | to address |
| amount | uint256 | amount to send |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | returns true if transfer is successful |


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

exclude an account from fees

_modifier onlyOwner can only be called by the contract itself or the contract owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| account | address | the account to exclude |



### includeInFee

```solidity
function includeInFee(address account) public
```

include an account in fees

_modifier onlyOwner can only be called by the contract itself or the contract owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| account | address | the account to include |



### isExcludedFromFee

```solidity
function isExcludedFromFee(address account) public view returns (bool)
```

checks if an address is excluded from fees

_modifier onlyOwner can only be called by the contract itself or the contract owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| account | address | the account to check if it is excluded |



### calculateFee

```solidity
function calculateFee(uint256 _amount, uint256 feePercent, bool takeFee) public pure returns (uint256)
```

helper to calculate fee


| Name | Type | Description |
| ---- | ---- | ----------- |
| _amount | uint256 | the base amount to calculate the fee amount from |
| feePercent | uint256 | the fee percent to multiply by the base amount |
| takeFee | bool | boolean override to have calculated fee be 0. Ex: account is excluded from fees |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | calculated fee amount |


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

Fees will be taken unless the address is excluded or if the token has reached maturity.

Emits a {Transfer} event.

Requirements:

- `from` cannot be the zero address.
- `to` cannot be the zero address.
- `from` must have a balance of at least `amount`._

| Name | Type | Description |
| ---- | ---- | ----------- |
| from | address | from address |
| to | address | to address |
| amount | uint256 | amount to send |



### burn

```solidity
function burn(address account, uint256 amount) public
```

used by the contract itself post token maturity when a holder redeems their VBT.

_modifier onlyOwner can only be called by the contract itself or the contract owner

Emits a {Transfer} event.

Requirements:

- `account` cannot be the zero address.
- balance of `account` must have a sufficient amount for the burn._

| Name | Type | Description |
| ---- | ---- | ----------- |
| account | address | the account that will have the amount burned. |
| amount | uint256 | the amount of the asset to be burned. |



### receive

```solidity
receive() external payable
```








