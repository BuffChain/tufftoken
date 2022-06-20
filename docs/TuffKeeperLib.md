# Solidity API

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








