// SPDX-License-Identifier: agpl-3.0

import hre from "hardhat";

const {
    consts, UNISWAP_POOL_BASE_FEE, TOKEN_NAME, TOKEN_SYMBOL, TOKEN_DECIMALS, TOKEN_FARM_FEE, TOKEN_DEV_FEE,
    TOKEN_TOTAL_SUPPLY, TOKEN_DAYS_UNTIL_MATURITY, AAVE_BALANCE_BUFFER_PERCENTAGE
} = require("../utils/consts");
const { log } = require("../utils/deployment_helpers");

module.exports.tags = ["v0002"];
module.exports = async () => {
    log(`Deploying and initializing ${TOKEN_SYMBOL}`);

    const { deployments, getNamedAccounts } = hre;
    const { deployer, contractOwner, buffChain } = await getNamedAccounts();
    const contractOwnerAcct = await hre.ethers.getSigner(contractOwner);

    let tuffDUUDeployment = await deployments.diamond.deploy(TOKEN_SYMBOL, {
        from: deployer,
        owner: contractOwner,
        facets: [
            "TuffOwner",
            "TuffVBT",
            "AaveLPManager",
            "TuffKeeper",
            "TokenMaturity",
            "UniswapManager",
            "PriceConsumer"
        ],
        log: true
    });
    let tuffDUU = await hre.ethers.getContractAt(tuffDUUDeployment.abi, tuffDUUDeployment.address, contractOwnerAcct);
    log(`${TOKEN_SYMBOL} address [${await tuffDUU.address}]`);

    if (!await tuffDUU.isTuffOwnerInit()) {
        let initTx = await tuffDUU.initTuffOwner(
            contractOwner
        );
        log("Initialized TuffOwner: " + initTx.hash);
    }

    if (!await tuffDUU.isTuffVBTInit()) {
        let initTx = await tuffDUU.initTuffVBT(
            contractOwner,
            TOKEN_NAME,
            TOKEN_SYMBOL,
            TOKEN_DECIMALS,
            TOKEN_FARM_FEE,
            TOKEN_DEV_FEE,
            buffChain,
            TOKEN_TOTAL_SUPPLY
        );
        log("Initialized TuffVBT: " + initTx.hash);
    }

    if (!await tuffDUU.isAaveInit()) {
        let tx = await tuffDUU.initAaveLPManager(
            consts("AAVE_LENDINGPOOL_PROVIDER_ADDR"), consts("AAVE_PROTOCOL_DATA_PROVIDER_ADDR"),
            consts("WETH9_ADDR"), AAVE_BALANCE_BUFFER_PERCENTAGE
        );
        log("Initialized AaveLPManager: " + tx.hash);

        tx = await tuffDUU.addAaveSupportedToken(
            consts("DAI_ADDR"), consts("CHAINLINK_ETH_DAI_AGGR_ADDR"), 500000);
        log("\tAdded DAI support to AaveLPManager: " + tx.hash);

        tx = await tuffDUU.addAaveSupportedToken(
            consts("USDC_ADDR"), consts("CHAINLINK_ETH_USDC_AGGR_ADDR"), 250000);
        log("\tAdded USDC support to AaveLPManager: " + tx.hash);

        tx = await tuffDUU.addAaveSupportedToken(
            consts("USDT_ADDR"), consts("CHAINLINK_ETH_USDT_AGGR_ADDR"), 250000);
        log("\tAdded USDT support to AaveLPManager: " + tx.hash);
    }

    if (!await tuffDUU.isTuffKeeperInit()) {
        let initTx = await tuffDUU.initTuffKeeper();
        log("Initialized TuffKeeper: " + initTx.hash);
    }

    if (!await tuffDUU.isTokenMaturityInit()) {
        let initTx = await tuffDUU.initTokenMaturity(TOKEN_DAYS_UNTIL_MATURITY);
        log("Initialized TokenMaturity: " + initTx.hash);
    }

    if (!await tuffDUU.isUniswapManagerInit()) {
        let initTx = await tuffDUU.initUniswapManager(
            consts("UNISWAP_V3_ROUTER_ADDR"),
            consts("WETH9_ADDR"),
            UNISWAP_POOL_BASE_FEE
        );
        log("Initialized UniswapManager: " + initTx.hash);
    }

    if (!await tuffDUU.isPriceConsumerInit()) {
        let initTx = await tuffDUU.initPriceConsumer(consts("UNISWAP_V3_FACTORY_ADDR"));
        log("Initialized PriceConsumer: " + initTx.hash);
    }
};
