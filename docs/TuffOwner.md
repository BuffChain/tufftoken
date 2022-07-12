# Solidity API

## TuffOwner




_inspired by https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol
owner() is already defined in the TuffTokenDiamond, we cannot import openzepplin's Ownable contract as it shadows
the existing definition and we need to allow calls coming from other facets on the diamond contract._




### isTuffOwnerInit

```solidity
function isTuffOwnerInit() public view returns (bool)
```







### initTuffOwner

```solidity
function initTuffOwner(address initialOwner) public
```

psuedo constructor


| Name | Type | Description |
| ---- | ---- | ----------- |
| initialOwner | address | contract initial owner |



### OwnershipTransferred

```solidity
event OwnershipTransferred(address previousOwner, address newOwner)
```

Emitted when ownership is transferred





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





