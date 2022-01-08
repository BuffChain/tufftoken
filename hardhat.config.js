const fs = require("fs/promises");
const path = require("path");

require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-web3");
require('hardhat-deploy');
require('hardhat-deploy-ethers');
require("hardhat-gas-reporter");
const {TASK_DEPLOY_MAIN} = require('hardhat-deploy');

require('dotenv').config();

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    paths: {
        tests: "./test/unit_tests"
    },
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
                version: "0.8.9",
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
            timeout: 30000

            // This is useful to imitate mainnet block processing
            // mining: {
            //     auto: false,
            //     interval: 5000
            // }
        },
        mainnet_cloudflare: {
            url: "https://cloudflare-eth.com"
        },
        kovan: {
            url: process.env.INFURA_URL,
            accounts: [process.env.ETH_ACCOUNT_PRIV_KEY]
        }
    },
    namedAccounts: {
        deployer: {
            default: 0, //For tests and hardhat network, use accounts[0]
            1: '', //TODO: Multi-sig ETH account for mainnet
            "kovan": '0x4d5031A3BF5b4828932D0e1C3006cC860b97aC3c',
        },
        contractOwner: {
            default: 1, //For tests and hardhat network, use accounts[1]
            1: '', //TODO: Multi-sig ETH account for mainnet
            "kovan": '0x4d5031A3BF5b4828932D0e1C3006cC860b97aC3c',
        }
    },
    external: {
        contracts: [
            {
                artifacts: "node_modules/@uniswap/v3-core/artifacts",
            }
        ]
    }
};

extendEnvironment((hre) => {
    if (hre.hardhatArguments.verbose) {
        console.log("Enabling hre logging")
        hre.network.config.loggingEnabled = true;
    }
});

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();

    for (const account of accounts) {
        console.log(account.address);
    }
});

task("download_block_data", "Downloads and serializes tx data for a range of blocks")
    .addParam("startBlockNumber", "Start of the block range you want to serialize")
    .addParam("endBlockNumber", "End of the block range you want to serialize")
    .setAction(async (taskArgs, hre) => {
        const provider = hre.ethers.provider;
        const blockDataPath = path.join(process.cwd(), "block_data");

        const startBlockNumber = parseInt(taskArgs["startBlockNumber"]);
        const endBlockNumber = parseInt(taskArgs["endBlockNumber"]);

        if (startBlockNumber >= endBlockNumber) {
            throw `startBlockNumber: [${startBlockNumber}] is lge than endBlockNumber: [${endBlockNumber}]`;
        }

        const forkedBlockNum = hre.network.config.forking.blockNumber;
        if (endBlockNumber > forkedBlockNum) {
            throw `endBlockNumber: [${endBlockNumber}] occurs after forkedBlockNum: [${forkedBlockNum}] set in 
            hardhat.config.js. The forked network thus does not have access to block ${endBlockNumber}`;
        }

        const blockCount = endBlockNumber - startBlockNumber;
        for (let i = 0; i < blockCount; i++) {
            const blockNumber = startBlockNumber + i;
            const blockData = await provider.getBlockWithTransactions(blockNumber);

            const blockJsonFile = path.join(blockDataPath.toString(), `${blockNumber}.json`);
            console.log(`Writing block's [${blockNumber}] tx data...`);
            await fs.writeFile(blockJsonFile, JSON.stringify(blockData["transactions"]));
        }

        console.log(`Finished writing block data`);
    });

task("test")
    .setAction(async (taskArgs, hre, runSuper) => {
        console.log(`Running tests within ${hre.config.paths.tests}`);

        taskArgs["deployFixture"] = true;
        return await runSuper(taskArgs);
    });

task("test:backtest")
    .setAction(async (taskArgs, hre) => {
        hre.config.paths.tests = path.join(path.parse(hre.config.paths.tests).dir, "back_tests");
        return await hre.run("test");
    });

/**
 * Added this hook into the hardhat deploy plugin to automatically write log output to the corresponding network's
 * deployment folder
 */
subtask(TASK_DEPLOY_MAIN, async (taskArgs, hre, runSuper) => {
    const networkName = hre.network.name;
    const manifestPath = path.join(process.cwd(), "deployments", networkName, ".manifest.json");

    // Get deployedCount
    let deployedCount = 0;
    fs.readFile(manifestPath)
        .then(function (buffer) {
            let content = JSON.parse(buffer.toString());
            deployedCount = parseInt(content["deployedCount"]);
        })
        .catch(function () {
        });

    // Run deployment
    const taskResult = await runSuper(taskArgs);

    // Persist deployedCount
    if (networkName !== "hardhat") {
        let content = JSON.stringify({
            "deployedCount": ++deployedCount
        });
        await fs.writeFile(manifestPath, content);
    }

    return taskResult;
});
