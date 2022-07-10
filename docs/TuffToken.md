# Solidity API

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

ERC20 governance token used by TuffGovernor.


| Name | Type | Description |
| ---- | ---- | ----------- |
| name_ | string | The name of the token |
| symbol_ | string | The symbol of the token |



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





### _afterTokenTransfer

```solidity
function _afterTokenTransfer(address from, address to, uint256 amount) internal
```



_Move voting power when tokens are transferred.

Emits a {DelegateVotesChanged} event._




### _mint

```solidity
function _mint(address to, uint256 amount) internal
```



_Snapshots the totalSupply after it has been increased._




### _burn

```solidity
function _burn(address account, uint256 amount) internal
```



_Snapshots the totalSupply after it has been decreased._





