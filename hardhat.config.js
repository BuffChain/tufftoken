require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-web3");
require('hardhat-deploy');
require('hardhat-deploy-ethers');

require('dotenv').config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();

    for (const account of accounts) {
        console.log(account.address);
    }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    solidity: {
        compilers: [
            {
                version: "0.6.12",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 1000,
                    },
                }
            },
            {
                version: "0.8.4",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 1000,
                    },
                },
            },
            {
                version: "0.7.6",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 1000,
                    },
                },
            },
        ],
        overrides: {
            "contracts/v6": {
                version: "0.6.12",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 1000,
                    },
                }
            },
            "contracts/v7": {
                version: "0.7.6",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 1000,
                    },
                }
            },
            "@uniswap/v3-core/contracts/libraries/TickMath.sol": {
                version: "0.7.6",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 1000,
                    },
                }
            },
            "@uniswap/v3-core/contracts/libraries/FullMath.sol": {
                version: "0.7.6",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 1000,
                    },
                }
            },
            "@uniswap/v3-periphery/contracts/libraries/PoolAddress.sol": {
                version: "0.7.6",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 1000,
                    },
                }
            }
        }
    },
    networks: {
        hardhat: {
            forking: {
                url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMAPI_KEY}`,
                // url: "https://cloudflare-eth.com"

                //Feel free to update at any time. This is here to make local development and caching easier
                blockNumber: 13302370
            },

            // This is useful to imitate mainnet block processing
            // mining: {
            //     auto: false,
            //     interval: 5000
            // }
        },
        mainnet_cloudflare: {
            url: "https://cloudflare-eth.com"
        },
    },
    namedAccounts: {
        deployer: {
            default: 0, //For tests and hardhat network, use accounts[0]
            1: '', //TODO: Multi-sig ETH account
            "rinkeby": '', //TODO: ETH account
        },
        contractOwner: {
            default: 1, //For tests and hardhat network, use accounts[1]
            1: '', //TODO: Multi-sig ETH account
            "rinkeby": '', //TODO: ETH account
        }
    },
    etherscan: {
        //TODO: This will help verify the smart contract code (https://github.com/wighawag/hardhat-deploy/tree/master#4-hardhat-etherscan-verify)
        apiKey: ''
    }
};

extendEnvironment((hre) => {
    if (hre.hardhatArguments.verbose) {
        console.log("Enabling hre logging")
        hre.network.config.loggingEnabled = true;
    }
});
