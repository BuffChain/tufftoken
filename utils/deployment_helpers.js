// SPDX-License-Identifier: agpl-3.0

module.exports.logDeploymentTx = (logTitle, tx) => {
    console.log(logTitle);
    console.dir(tx);
    console.log("-------------\n");
};
