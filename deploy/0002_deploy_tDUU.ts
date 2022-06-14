// SPDX-License-Identifier: agpl-3.0

import hre from 'hardhat';
import { AAVE_BALANCE_BUFFER_PERCENTAGE } from '../utils/consts';

const {
    consts, UNISWAP_POOL_BASE_FEE, TOKEN_NAME, TOKEN_SYMBOL, TOKEN_DECIMALS, TOKEN_FARM_FEE, TOKEN_DEV_FEE,
    TOKEN_TOTAL_SUPPLY, TOKEN_DAYS_UNTIL_MATURITY
} = require("../utils/consts");
const {logDeploymentTx} = require("../utils/deployment_helpers");

module.exports = async () => {
    console.log(`[DEPLOY][v0002] - Deploying and initializing ${TOKEN_SYMBOL}`);

    const {deployments, getNamedAccounts} = hre;
    const {deployer, contractOwner, buffChain} = await getNamedAccounts();
    const contractOwnerAcct = await hre.ethers.getSigner(contractOwner);

    console.log(`Deployer address [${deployer}]`);
    console.log(`Contract owner address [${contractOwner}]`);

    let tuffDUUDeployment = await deployments.diamond.deploy(TOKEN_SYMBOL, {
        from: deployer,
        owner: contractOwner,
        execute: {
            methodName: "initialize",
            args: [
                contractOwner,
                TOKEN_NAME,
                TOKEN_SYMBOL,
                TOKEN_DECIMALS,
                TOKEN_FARM_FEE,
                TOKEN_DEV_FEE,
                buffChain,
                TOKEN_TOTAL_SUPPLY
            ],
        },
        facets: ["TuffVBT"],
        log: true
    });
    let tuffDUU = await hre.ethers.getContractAt(tuffDUUDeployment.abi, tuffDUUDeployment.address, contractOwnerAcct);
    console.log(`${TOKEN_SYMBOL} address [${await tuffDUU.address}]`);

    const farmFee = await tuffDUU.connect(contractOwnerAcct).getFarmFee();
    console.log(`farmFee: ${farmFee}`);

    throw new Error("asdf");

    //        TuffVBT tuffVBT = TuffVBT(payable(address(this)));
    //         ss.totalSupplyForRedemption = tuffVBT.totalSupply();
};

module.exports.tags = ['v0002'];
