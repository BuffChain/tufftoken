# Diamond Contracts

We chose to structure our contracts with the diamond standard to ensure we write clean and concise code, while still 
practicing separation-of-concerns. Among other benefits, the diamond standard also enabled us to treat our code as one 
meta-contract which shares the same owner, address, and wallet. Architecting our contract this way also means 
transactions will use less gas as they do not have to transfer tokens from each contract's wallet.

It is encouraged to familiarize yourself with Diamonds, [this repo](https://github.com/mudgen/diamond) is a good place 
to start. Note that we chose the 3rd implementation [here](https://github.com/mudgen/diamond-3-hardhat).

## Getting Started

The contracts within this directory, or `./contracts/diamond` from the root of the repo, were cloned from 
https://github.com/mudgen/diamond-3-hardhat.


