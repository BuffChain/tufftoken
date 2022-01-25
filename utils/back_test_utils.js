// SPDX-License-Identifier: agpl-3.0

const hre = require("hardhat");

const path = require("path");
const fs = require("fs");
const Papa = require("papaparse");

const {consts} = require("./consts");
const testUtils = require("./test_utils");
const {BigNumber} = require("ethers");

/**
 * Deserialize the block data for a range of blocks and send all txs from them
 * @param startBlockNumber: Start of the block range you want to process
 * @param endBlockNumber: End of the block range you want to process
 * @returns {Promise<void>}
 */
async function sendTxsFromBlocks(startBlockNumber, endBlockNumber) {
    if (startBlockNumber >= endBlockNumber) {
        throw `startBlockNumber: [${startBlockNumber}] is lge than endBlockNumber: [${endBlockNumber}]`;
    }
    console.log(`Processing blocks ${startBlockNumber} to ${endBlockNumber}`);

    const blockDataPath = path.join(process.cwd(), "transactions.csv");
    const dataStream = fs.createReadStream(blockDataPath);
    const parseStream = Papa.parse(Papa.NODE_STREAM_INPUT, {delimiter: ",", header: true});
    dataStream.pipe(parseStream);

    let replayingBlock = startBlockNumber;
    let txCount = 0;
    let faultyTx = 0;

    for await (const row of parseStream) {
        let blockNumber = parseInt(row["block_number"]);

        if (replayingBlock < blockNumber) {
            console.log(`Replayed ${txCount + 1} txs from block ${replayingBlock}`);
            await mineBlock();
            replayingBlock = blockNumber;
        }

        txCount = parseInt(row["transaction_index"]);

        if (startBlockNumber <= blockNumber && blockNumber <= endBlockNumber) {
            const tx = {
                nonce: convertToHexString(row["nonce"]),
                from: row["from_address"],
                to: row["to_address"],
                value: convertToHexString(row["value"]),
                data: row["data"],
                type: convertToHexString(row["transaction_type"]),
                gasLimit: convertToHexString(row["gas"])
            }

            if (row["transaction_type"] === "2") {
                tx["maxFeePerGas"] = convertToHexString(row["max_fee_per_gas"]);
                tx["maxPriorityFeePerGas"] = convertToHexString(row["max_priority_fee_per_gas"]);
            } else {
                tx["gasPrice"] = convertToHexString(row["gas_price"]);
            }

            const fromAcct = await hre.ethers.getSigner(tx["from"]);
            await testUtils.runCallbackImpersonatingAcct(fromAcct, async (acct) => {
                await acct.sendTransaction(tx)
                    .then((tx) => {
                        // console.log(`Completed tx ${txCount} from block ${blockNumber}`);
                    })
                    .catch((err) => {
                        // console.error(err);
                        // console.dir(tx);
                        faultyTx++;
                    })
            });
        }
    }

    console.log(`This simulation contained a total of ${faultyTx} txs that did not completed`);
}

/**
 * Force hardhat to mine a block
 * @returns {Promise<void>}
 */
async function mineBlock() {
    await hre.ethers.provider.send("evm_increaseTime", [consts("BLOCKTIME")]);
    await hre.ethers.provider.send("evm_mine");
}

function convertToHexString(str) {
    if (str) {
        return BigNumber.from(str).toHexString();
    } else {
        return "0x";
    }
}

/**
 * Force hardhat to mine a block
 * @returns {Promise<void>}
 */
async function simulateBlockChainActivity(startBlockNumber=hre.config.startBlockNumber, endBlockNumber=hre.config.endBlockNumber) {
    const priorAutomine = hre.network.config.mining.auto;
    const priorInterval = hre.network.config.mining.interval;
    await hre.network.provider.send("evm_setAutomine", [false]);
    await hre.network.provider.send("evm_setIntervalMining", [0]);

    await mineBlock();
    await sendTxsFromBlocks(startBlockNumber, endBlockNumber);

    await hre.network.provider.send("evm_setAutomine", [priorAutomine]);
    await hre.network.provider.send("evm_setIntervalMining", [priorInterval]);
}

module.exports = {
    sendTxsFromBlocks,
    mineBlock,
    simulateBlockChainActivity
}
