// SPDX-License-Identifier: agpl-3.0

const hre = require("hardhat");

const path = require("path");
const fs = require("fs/promises");

const {consts} = require("./consts");
const testUtils = require("./test_utils");

/**
 * Deserialize the block data for a given block and send all txs from it
 * @param blockNumber: The block number to get the list of txs from
 * @returns {Promise<void>}
 */
async function sendTxsFromBlock(blockNumber) {
    const blockDataPath = path.join(process.cwd(), "block_data", `${blockNumber}.json`);

    let txs = []
    fs.readFile(blockDataPath)
        .then(function (buffer) {
            txs = JSON.parse(buffer.toString());
        });

    for (let tx in txs) {
        const fromAcct = await hre.ethers.getSigner(tx["from"]);
        await testUtils.runCallbackImpersonatingAcct(fromAcct, (acct) => {
            acct.sendTransaction(tx);
        });
    }

    await mineBlock();
}

/**
 * Process multiple blocks at once
 * @param startBlockNumber: Start of the block range you want to process
 * @param endBlockNumber: End of the block range you want to process
 * @returns {Promise<void>}
 */
async function sendTxsFromBlocks(startBlockNumber, endBlockNumber) {
    if (startBlockNumber >= endBlockNumber) {
        throw `startBlockNumber: [${startBlockNumber}] is lge than endBlockNumber: [${endBlockNumber}]`;
    }

    const blockCount = endBlockNumber - startBlockNumber;
    for (let i = 0; i < blockCount; i++) {
        const blockNumber = startBlockNumber + i;
        console.log(`Replaying all transactions for block [${blockNumber}]`);
        await sendTxsFromBlock(blockNumber);
    }

    console.log(`Finished writing block data`);
}

/**
 * Force hardhat to mine a block
 * @returns {Promise<void>}
 */
async function mineBlock() {
    await hre.ethers.provider.send("evm_increaseTime", [consts("BLOCKTIME")])
    await hre.ethers.provider.send('evm_mine');
}

/**
 * Force hardhat to mine a block
 * @returns {Promise<void>}
 */
async function simulateBlockChainActivity(startBlockNumber=13302360, endBlockNumber=13302370) {
    await mineBlock();
    await sendTxsFromBlocks(startBlockNumber, endBlockNumber);
}

module.exports = {
    sendTxsFromBlock,
    sendTxsFromBlocks,
    mineBlock,
    simulateBlockChainActivity
}
