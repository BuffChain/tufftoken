# Solidity API

## TuffGovernor


This is the core governance contract that will be used to manage proposals and voting.

_Implementation of openzepplin governance https://docs.openzeppelin.com/contracts/4.x/governance#governor._




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

The Governor implementation uses GovernorVotesQuorumFraction which works together with ERC20Votes to
define quorum as a percentage of the total supply at the block a proposal's voting power is retrieved (4%).

_Quorum Fraction is set to 4%._

| Name | Type | Description |
| ---- | ---- | ----------- |
| _token | contract ERC20Votes | The underlying ERC20 token with voting capabilities. |
| _timelock | contract TimelockController | Allows users to exit the system if they disagree with a decision before it is executed. |



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

Set voting delay.

_Voting Delay is initially set to 1 day._

| Name | Type | Description |
| ---- | ---- | ----------- |
| delay | uint256 | The amount of delay after a proposal is created before it can be voted on. |



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

Set voting period.

_Voting Period is initially set to 1 week._

| Name | Type | Description |
| ---- | ---- | ----------- |
| period | uint256 | The amount of time a proposal can be voted on. |



### proposalThreshold

```solidity
function proposalThreshold() public view returns (uint256)
```



_Part of the Governor Bravo's interface: _"The number of votes required in order for a voter to become a proposer"_._




### setProposalThreshold

```solidity
function setProposalThreshold(uint256 threshold) public
```

Set proposal threshold.

_Threshold is initially set to 1._

| Name | Type | Description |
| ---- | ---- | ----------- |
| threshold | uint256 | How much voting power is needed to create a proposal. |



### quorum

```solidity
function quorum(uint256 blockNumber) public view returns (uint256)
```

Minimum number of cast voted required for a proposal to be successful.

_Returns the quorum for a block number, in terms of number of votes: `supply * numerator / denominator`._




### getVotes

```solidity
function getVotes(address account, uint256 blockNumber) public view returns (uint256)
```

Get votes

_Voting power of an `account` at a specific `blockNumber`.

Note: this can be implemented in a number of ways, for example by reading the delegated balance from one (or
multiple), {ERC20Votes} tokens._




### state

```solidity
function state(uint256 proposalId) public view returns (enum IGovernor.ProposalState)
```

Current state of a proposal, following Compound's convention

_Overridden version of the {Governor-state} function with added support for the `Queued` status._




### propose

```solidity
function propose(address[] targets, uint256[] values, bytes[] calldatas, string description) public returns (uint256)
```

Create a proposal

_Create a new proposal. Vote start {IGovernor-votingDelay} blocks after the proposal is created and ends
{IGovernor-votingPeriod} blocks after the voting starts.

Emits a {ProposalCreated} event._




### _execute

```solidity
function _execute(uint256 proposalId, address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash) internal
```

Overridden execute function that run the already queued proposal through the timelock.

_Internal execution mechanism. Can be overridden to implement different execution mechanism_




### _cancel

```solidity
function _cancel(address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash) internal returns (uint256)
```

Overridden version of the {Governor-_cancel} function to cancel the timelocked proposal if it as already been queued.

_Internal cancel mechanism: locks up the proposal timer, preventing it from being re-submitted. Marks it as
canceled to allow distinguishing it from executed proposals.

Emits a {IGovernor-ProposalCanceled} event._




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








