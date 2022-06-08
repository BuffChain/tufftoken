# Solidity API

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
