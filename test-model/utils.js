// SPDX-License-Identifier: agpl-3.0

const hre = require("hardhat");

const testUtils = require("../test/utils");
const path = require("path");
const fs = require("fs/promises");

/**
 * Deserialize the block data for a given block and send all txs from it
 * @param blockNumber: The block number to get the list of txs from
 * @returns {Promise<void>}
 */
async function sendTxsForBlock(blockNumber) {
    const blockDataPath = path.join(process.cwd(), "block-data", `${blockNumber}.json`);

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
async function sendTxsForBlocks(startBlockNumber, endBlockNumber) {
    if (startBlockNumber >= endBlockNumber) {
        throw `startBlockNumber: [${startBlockNumber}] is lge than endBlockNumber: [${endBlockNumber}]`;
    }

    const blockCount = endBlockNumber - startBlockNumber;
    for (let i = 0; i < blockCount; i++) {
        const blockNumber = startBlockNumber + i;
        console.log(`Replaying all transactions for block [${blockNumber}]`);
        await sendTxsForBlock(blockNumber);
    }

    console.log(`Finished writing block data`);
}

/**
 * Force hardhat to mine a block
 * @returns {Promise<void>}
 */
async function mineBlock() {
    await hre.ethers.provider.send('evm_mine');
}

module.exports.sendTxsForBlock = sendTxsForBlock;
module.exports.sendTxsForBlocks = sendTxsForBlocks;
module.exports.mineBlock = mineBlock;
