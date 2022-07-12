# Solidity API

## TuffOwnerLib


storage lib for the TuffOwner contract.





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








