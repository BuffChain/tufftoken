// SPDX-License-Identifier: agpl-3.0

import hre from 'hardhat';

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
        facets: [
            "TuffVBT",
            "AaveLPManager",
            "TuffKeeper",
            "TokenMaturity",
            "UniswapManager",
            "ChainLinkPriceConsumer"
        ],
        log: true
    });
    let tuffDUU = await hre.ethers.getContractAt(tuffDUUDeployment.abi, tuffDUUDeployment.address, contractOwnerAcct);
    console.log(`${TOKEN_SYMBOL} address [${await tuffDUU.address}]`);

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
        logDeploymentTx("Initialized Tuff VBT:", initTx);
    }

    if (!await tuffDUU.isAaveInit()) {
        let tx = await tuffDUU.initAaveLPManager(
            consts("AAVE_LENDINGPOOL_PROVIDER_ADDR"), consts("AAVE_PROTOCOL_DATA_PROVIDER_ADDR"),
            consts("WETH9_ADDR")
        );
        logDeploymentTx("Initialized AaveLPManager:", tx);

        tx = await tuffDUU.addAaveSupportedToken(
            consts("DAI_ADDR"), consts("CHAINLINK_ETH_DAI_AGGR_ADDR"), 5000);
        logDeploymentTx("Added DAI support to AaveLPManager:", tx);

        tx = await tuffDUU.addAaveSupportedToken(
            consts("USDC_ADDR"), consts("CHAINLINK_ETH_USDC_AGGR_ADDR"), 2500);
        logDeploymentTx("Added USDC support to AaveLPManager:", tx);

        tx = await tuffDUU.addAaveSupportedToken(
            consts("USDT_ADDR"), consts("CHAINLINK_ETH_USDT_AGGR_ADDR"), 2500);
        logDeploymentTx("Added USDT support to AaveLPManager:", tx);
    }

    if (!await tuffDUU.isTuffKeeperInit()) {
        let initTx = await tuffDUU.initTuffKeeper();
        logDeploymentTx("Initialized TuffKeeper:", initTx);
    }

    if (!await tuffDUU.isTokenMaturityInit()) {
        let initTx = await tuffDUU.initTokenMaturity(TOKEN_DAYS_UNTIL_MATURITY);
        logDeploymentTx("Initialized TokenMaturity:", initTx);
    }

    if (!await tuffDUU.isUniswapManagerInit()) {
        let initTx = await tuffDUU.initUniswapManager(
            consts("UNISWAP_V3_ROUTER_ADDR"),
            consts("WETH9_ADDR"),
            UNISWAP_POOL_BASE_FEE
        );
        logDeploymentTx("Initialized UniswapManager:", initTx);
    }
};

module.exports.tags = ['v0002'];