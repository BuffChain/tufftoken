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

## License
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

[Full License](LICENSE). All source code files need to start with a comment containing `SPDX-License-Identifier: agpl-3.0`.
