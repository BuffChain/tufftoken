```
TTTTTTTTTTTTTTTTTTTTTTT     OOOOOOOOO     KKKKKKKKK    KKKKKKKEEEEEEEEEEEEEEEEEEEEEENNNNNNNN        NNNNNNNNXXXXXXX       XXXXXXX
T:::::::::::::::::::::T   OO:::::::::OO   K:::::::K    K:::::KE::::::::::::::::::::EN:::::::N       N::::::NX:::::X       X:::::X
T:::::::::::::::::::::T OO:::::::::::::OO K:::::::K    K:::::KE::::::::::::::::::::EN::::::::N      N::::::NX:::::X       X:::::X
T:::::TT:::::::TT:::::TO:::::::OOO:::::::OK:::::::K   K::::::KEE::::::EEEEEEEEE::::EN:::::::::N     N::::::NX::::::X     X::::::X
TTTTTT  T:::::T  TTTTTTO::::::O   O::::::OKK::::::K  K:::::KKK  E:::::E       EEEEEEN::::::::::N    N::::::NXXX:::::X   X:::::XXX
        T:::::T        O:::::O     O:::::O  K:::::K K:::::K     E:::::E             N:::::::::::N   N::::::N   X:::::X X:::::X   
        T:::::T        O:::::O     O:::::O  K::::::K:::::K      E::::::EEEEEEEEEE   N:::::::N::::N  N::::::N    X:::::X:::::X    
        T:::::T        O:::::O     O:::::O  K:::::::::::K       E:::::::::::::::E   N::::::N N::::N N::::::N     X:::::::::X     
        T:::::T        O:::::O     O:::::O  K:::::::::::K       E:::::::::::::::E   N::::::N  N::::N:::::::N     X:::::::::X     
        T:::::T        O:::::O     O:::::O  K::::::K:::::K      E::::::EEEEEEEEEE   N::::::N   N:::::::::::N    X:::::X:::::X    
        T:::::T        O:::::O     O:::::O  K:::::K K:::::K     E:::::E             N::::::N    N::::::::::N   X:::::X X:::::X   
        T:::::T        O::::::O   O::::::OKK::::::K  K:::::KKK  E:::::E       EEEEEEN::::::N     N:::::::::NXXX:::::X   X:::::XXX
      TT:::::::TT      O:::::::OOO:::::::OK:::::::K   K::::::KEE::::::EEEEEEEE:::::EN::::::N      N::::::::NX::::::X     X::::::X
      T:::::::::T       OO:::::::::::::OO K:::::::K    K:::::KE::::::::::::::::::::EN::::::N       N:::::::NX:::::X       X:::::X
      T:::::::::T         OO:::::::::OO   K:::::::K    K:::::KE::::::::::::::::::::EN::::::N        N::::::NX:::::X       X:::::X
      TTTTTTTTTTT           OOOOOOOOO     KKKKKKKKK    KKKKKKKEEEEEEEEEEEEEEEEEEEEEENNNNNNNN         NNNNNNNXXXXXXX       XXXXXXX
```
# tokenx

## Getting Started
First install all dependencies with:
```
npm install
```

This includes the main framework Hardhat. Hardhat will let you run a dev blockchain, test cases, and other utility 
commands. Some helpful hardhat commands are:
```
npx hardhat accounts
npx hardhat compile
npx hardhat test
npx hardhat node
node scripts/sample-script.js
npx hardhat help
```

However, it is recommended to use the scripts provided in `./package.json`, such as:
```
npm run test
npm run compile
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
