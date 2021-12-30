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
npm run test test/aaveLPManager.js
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
- //TODO: Public vs private within diamond storage?
- //TODO: Contract ownership?
- //TODO: Use address(this) everywhere since the state and storage are based in the diamond contract, and facets are just used for their logic?

## Deploying
First, source your `.env` file. Then run the npm deploy script for the respective network. For example, if you are 
deploying to `kovan`, then run `npm run deploy_kovan`. Review the logs after the deployment has finished. The addresses 
and transaction hashes of the contract deployments are also persisted to `./deployments/kovan/*.json`. To finish the 
deployment commit and push those file changes.

## License
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

[Full License](LICENSE). All source code files need to start with a comment containing `SPDX-License-Identifier: agpl-3.0`.
