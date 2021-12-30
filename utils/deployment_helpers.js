// SPDX-License-Identifier: agpl-3.0

const hre = require("hardhat");

module.exports.logDeploymentTx = (logTitle, tx) => {
    if (hre.network.name === "hardhat") {
        return;
    }

    console.log(logTitle);
    console.dir(tx);
    console.log("-------------\n");
};
