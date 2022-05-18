import * as fs from 'fs';
import path from "path";

import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-web3';
import 'hardhat-deploy';
import 'hardhat-deploy-ethers';
import 'hardhat-gas-reporter';
import '@typechain/hardhat'; //Generate types from ABI of compiled contracts
import {TASK_DEPLOY_MAIN} from 'hardhat-deploy';
import {task, extendEnvironment, HardhatUserConfig, subtask} from 'hardhat/config';

import 'dotenv/config';
import {HardhatNetworkConfig} from "hardhat/src/types/config";
import {
    HardhatRuntimeEnvironment,
    RunSuperFunction,
    TaskArguments
} from "hardhat/types";

interface BackTestConfig {
    startBlockNumber: number
    endBlockNumber: number
}

declare module 'hardhat/types/config' {
    export interface HardhatUserConfig {
        backTest: BackTestConfig
    }

    export interface HardhatConfig {
        backTest: BackTestConfig
    }
}

const config: HardhatUserConfig = {
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
            }
        }
    },
    networks: {
        hardhat: {
            live: false,
            forking: {
                url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMAPI_KEY}`,

                //Feel free to update at any time. This is here to make local development and caching easier
                blockNumber: 14787817
            },
            accounts: {
                mnemonic: process.env.ETH_HARDHAT_ACCOUNT_MNEMONIC
            }

            // mining: {
            //     auto: false,
            //     interval: 5000
            // }
        },
        mainnet_cloudflare: {
            live: false,
            url: "https://cloudflare-eth.com"
        },
        kovan: {
            live: true,
            url: process.env.INFURA_URL || "",
            accounts: [process.env.ETH_KOVAN_ACCOUNT_PRIV_KEY || "0000000000000000000000000000000000000000000000000000000000000000"]
        },
        mainnet: {
            live: true,
            url: process.env.INFURA_URL || "",
            accounts: [process.env.ETH_MAINNET_ACCOUNT_PRIV_KEY || "0000000000000000000000000000000000000000000000000000000000000000"]
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
        },
        buffChain: {
            default: '0x4d5031A3BF5b4828932D0e1C3006cC860b97aC3c',
            1: '', //TODO: Multi-sig ETH account for mainnet
            "kovan": '',
        },
        tuffDAO: {
            default: '0x46E7BDD2b003a98C85dA07b930cd3354E97D7F0d',
            1: '', //TODO: Multi-sig ETH account for mainnet
            "kovan": '',
        }
    },
    external: {
        contracts: [
            {
                artifacts: "node_modules/@uniswap/v3-core/artifacts",
            }
        ]
    },
    mocha: {
        timeout: 30000
    },
    typechain: {
        outDir: "src/types",
        target: "ethers-v5",
        externalArtifacts: ['node_modules/@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json']
    },
    backTest: {
        startBlockNumber: 0,
        endBlockNumber: 0,
    }
};

export default config;

extendEnvironment((hre: HardhatRuntimeEnvironment) => {
    if (hre.hardhatArguments.verbose) {
        console.log("Enabling hre logging");
        (hre.network.config as HardhatNetworkConfig).loggingEnabled = true;
    }
});

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();

    for (const account of accounts) {
        console.log(account.address);
    }
});

task("download_block_data", "Downloads and serializes tx data for a range of blocks")
    .addOptionalParam("startBlockNumber", "Start of the block range you want to serialize, inclusive")
    .addOptionalParam("endBlockNumber", "End of the block range you want to serialize, inclusive")
    .setAction(async (taskArgs: TaskArguments, hre: HardhatRuntimeEnvironment) => {
        const blockDataPath = path.join(process.cwd(), "block_data");
        const {startBlockNumber, endBlockNumber} = getBlockParams(taskArgs, hre);
        console.log(`Downloading blocks [${startBlockNumber},${endBlockNumber}]`);

        //Update forking blockNumber so the provider has access to all previous block info,
        // ending at endBlockNumber (inclusive)
        const config = hre.network.config as HardhatNetworkConfig;
        if (config.forking) {
            config.forking.blockNumber = endBlockNumber + 1;
        } else {
            throw new Error("Forking was not configured in hardhat config");
        }

        //Plus one for inclusive range of [startBlockNumber,endBlockNumber]
        const numOfBlocks = endBlockNumber - startBlockNumber + 1;
        for (let i = 0; i < numOfBlocks; i++) {
            const blockNumber = startBlockNumber + i;
            const blockData = await hre.ethers.provider.getBlockWithTransactions(blockNumber);
            // console.dir(blockData);

            const blockJsonFile = path.join(blockDataPath.toString(), `${blockNumber}.json`);
            await fs.promises.access(blockJsonFile, fs.constants.F_OK)
                .then(() => console.log(`${blockJsonFile} already exists. Skipping...`))
                .catch(async function() {
                    console.log(`Writing block's [${blockNumber}] tx data...`);
                    await fs.promises.writeFile(blockJsonFile, JSON.stringify(blockData["transactions"]));
                });
        }

        console.log(`Finished writing block data`);
    });

task("test")
    .setAction(async (taskArgs: TaskArguments, hre: HardhatRuntimeEnvironment, runSuper: RunSuperFunction<any>) => {
        console.log(`Running tests within ${hre.config.paths.tests}`);

        taskArgs["deployFixture"] = true;
        return await runSuper(taskArgs);
    });

task("test:backtest")
    .addOptionalParam("startBlockNumber", "Start block of the backtest, defaults to one block after the forking block " +
        "number")
    .addOptionalParam("endBlockNumber", "End block of the backtest, defaults to 10 blocks after the startBlockNumber")
    .setAction(async (taskArgs: TaskArguments, hre: HardhatRuntimeEnvironment) => {
        const {startBlockNumber, endBlockNumber} = getBlockParams(taskArgs, hre);
        // hre.network.config.forking.blockNumber = startBlockNumber - 1;
        hre.config.backTest.startBlockNumber = startBlockNumber;
        hre.config.backTest.endBlockNumber = endBlockNumber;

        hre.config.paths.tests = path.join(path.parse(hre.config.paths.tests).dir, "back_tests");
        hre.config.mocha.timeout = Number.MAX_SAFE_INTEGER;
        return await hre.run("test");
    });

function getBlockParams(taskArgs: TaskArguments, hre: HardhatRuntimeEnvironment) {
    let startBlockNumber = 0, endBlockNumber;

    if (taskArgs["startBlockNumber"]) {
        startBlockNumber = parseInt(taskArgs["startBlockNumber"]);
    } else {
        const config = hre.network.config as HardhatNetworkConfig;
        if (config?.forking?.blockNumber) {
            startBlockNumber = config.forking.blockNumber;
        } else {
            throw new Error("Forking was not configured in hardhat config");
        }
    }

    if (taskArgs["endBlockNumber"]) {
        endBlockNumber = parseInt(taskArgs["endBlockNumber"]);
    } else {
        endBlockNumber = startBlockNumber + 10;
    }

    if (startBlockNumber >= endBlockNumber) {
        throw `startBlockNumber: [${startBlockNumber}] is lge than endBlockNumber: [${endBlockNumber}]`;
    }

    return {startBlockNumber, endBlockNumber};
}

/**
 * Added this hook into the hardhat deploy plugin to automatically write log output to the corresponding network's
 * deployment folder
 */
subtask(TASK_DEPLOY_MAIN, async (taskArgs: TaskArguments, hre: HardhatRuntimeEnvironment, runSuper: RunSuperFunction<any>) => {
    const networkName = hre.network.name;
    const manifestPath = path.join(process.cwd(), "deployments", networkName, ".manifest.json");

    // Get deployedCount
    let deployedCount = 0;
    fs.promises.readFile(manifestPath)
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
        await fs.promises.writeFile(manifestPath, content);
    }

    return taskResult;
});
