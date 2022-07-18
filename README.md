```
████████ ██    ██ ███████ ███████ ████████  ██████  ██   ██ ███████ ███    ██ 
   ██    ██    ██ ██      ██         ██    ██    ██ ██  ██  ██      ████   ██ 
   ██    ██    ██ █████   █████      ██    ██    ██ █████   █████   ██ ██  ██ 
   ██    ██    ██ ██      ██         ██    ██    ██ ██  ██  ██      ██  ██ ██ 
   ██     ██████  ██      ██         ██     ██████  ██   ██ ███████ ██   ████ 
```
# TuffToken

## Getting Started
First install all dependencies with:
```
npm install
```

Next, copy the `.env-template` to a `.env` file. Fill out the variables, you can reach out to a team member to acquire 
any shared secrets.

Now you are ready to start running some commands. `./package.json` contains helpful aliases, but here are a few common 
commands:
```
npm run test
npm run test test/aaveLPManager.ts
npm run compile

npx hardhat accounts
npx hardhat node
```

## Contract Development
Be aware of the purposeful directory structure within `./contract`. With hardhat, we can compile contracts with `n` 
number of versions, but contracts compiled on two different versions cannot directly call each other. We came up with 
the following directory structure to ensure development is quick and easy, and the code stays safe.

Everything that is using the latest solidity version that this repo supports lives in the root of `./contract/`. If a 
contract uses a lower solidity version then it will live in the respective version folder. For example, a contract that 
requires solidity 0.6.12 then it belongs in`./contract/v6/`. Thus, anything that is in a `./contract/v*` sub folder 
must be called via `abi`. This should help make it clear which contracts you can import directly, and thus easier and 
safer to use, vs which you must call via abi.

### Diamond Contracts
We decided to structure our contracts with the diamond standard to ensure we write clean and concise code, while still
practicing separation-of-concerns. Among other benefits, the diamond standard also enabled us to treat our code as one
meta-contract which shares the same owner, address, and wallet. Architecting our contract this way also means
transactions will use less gas as they do not have to transfer tokens from each contract's wallet.

It is encouraged to familiarize yourself with Diamonds, [this repo](https://github.com/mudgen/diamond) is a good place
to start. Note that we chose the 3rd implementation [here](https://github.com/mudgen/diamond-3-hardhat). 

It is imperative that you understand how state and storage is managed with within Diamonds. [This link](https://medium.com/1milliondevs/solidity-storage-layout-for-proxy-contracts-and-diamonds-c4f009b6903) 
goes over several options and their pros and cons. This project uses the diamond storage method, which you can learn 
more about [here](https://dev.to/mudgen/how-diamond-storage-works-90e) and [here](https://eips.ethereum.org/EIPS/eip-2535#facets-state-variables-and-diamond-storage). 
There are a few additional quirks I would like to call out:
- There are some key differences with inline assembly between solidity version
- All first-party contract function names must be unique. This means no interfaces
- The key feature to support diamond storage was released in solidity v0.6.4. Thus, all contracts must compile with 
versions higher than that
- You can mix and match different storage solutions, but that should only be a last resort. It is untested

## Testing


## Back Testing
In a similar fashion to testing, we fork mainnet to a local hardhat network. This lets us imitate mainnet and explore 
various scenarios given our contracts. To do this, the local network is forked at a specific block, then we deploy our 
contracts, and finally we apply the txs found in subsequent blocks. This will model how our contract will behave given 
the changes occurred in the mainnet enviroment.

Before we can start modeling, we need the "future" tx data that we will be replaying for the local network. We have 
created a convenient download and serializer hardhat task to handle this for you. It requires two parameters where you 
specify the range of blocks you want to fetch. Note that the values cannot exceed the `blockNumber` configured in `hardhat.config.ts`, 
as hardhat relies on that forked, archival block data to create the local network; from which we fetch that tx data 
from.
```
# Block number at 01/01/2021 00:00 GMT
export START_BLOCK_NUM=11565019
export START_BLOCK_NUM=13302360

# Block number at 01/01/2022 00:00 GMT
export END_BLOCK_NUM=13916166
export END_BLOCK_NUM=13302372

npm run download_block_data -- --start-block-number ${START_BLOCK_NUM} --end-block-number ${END_BLOCK_NUM}

pip3 install ethereum-etl

ethereumetl export_blocks_and_transactions --start-block ${START_BLOCK_NUM} --end-block ${END_BLOCK_NUM} --provider-uri https://mainnet.infura.io/v3/0feb75e50f9a4dc2ae2d4333d4707333 --transactions-output ./block_data/transactions.csv
```

With the block txs downloaded, we must now configure hardhat's network to start at the appropriate block. Using the 
example from above, we would update the `blockNumber` configured in `hardhat.config.ts` to 13302359 (one less than the 
start block number). We do this because then we will deploy the contract, and then apply the txs we just fetched.

## Deploying

### Pre-Deploy Checks
1) Ensure `TUFF_STARTING_PRICE` is set to the correct value based on the current blocks ETH price
2) Review and source your `.env` file. Enusre all wallets have the correct private key
3) Run `npm run node` to deploy a local version of the contracts based on the current mainnet block
4) Review logs from step above
5) Run `npm run deploy_kovan` to deploy the contracts to kovan
6) Review logs from step above

### Deploy to mainnet
1) Ensure wallets have sufficient ETH to pay for gas. Check the latest main GitHub actions to get estimated contract
deployment gas cost
2) Run `npm run deploy_mainnet` to deploy the contracts to mainnet
3) Review logs from step above

### Post-Deploy
1) Commit deployment logs to main branch
2) Review addresses on etherscan and dApp

## License
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

[Full License](LICENSE). All source code files need to start with a comment containing `SPDX-License-Identifier: agpl-3.0`.
