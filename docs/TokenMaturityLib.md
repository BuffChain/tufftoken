# Solidity API

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








