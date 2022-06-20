# Solidity API

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








