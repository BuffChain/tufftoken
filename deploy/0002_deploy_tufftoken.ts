// SPDX-License-Identifier: agpl-3.0

import hre from 'hardhat';

const {
    consts, UNISWAP_POOL_BASE_FEE, TOKEN_NAME, TOKEN_SYMBOL, TOKEN_DECIMALS, TOKEN_FARM_FEE, TOKEN_DEV_FEE,
    TOKEN_TOTAL_SUPPLY, TOKEN_DAYS_UNTIL_MATURITY
} = require("../utils/consts");
const {logDeploymentTx} = require("../utils/deployment_helpers");

module.exports = async () => {
    console.log("[DEPLOY][v0002] - Deploying and initializing TuffVBTDiamond");

    const {deployments, getNamedAccounts} = hre;
    const {deployer, contractOwner, buffChain} = await getNamedAccounts();

    console.log(`Deployer address [${deployer}]`);
    console.log(`Contract owner address [${contractOwner}]`);

    let tuffVBTDiamond = await deployments.diamond.deploy('TuffVBTDiamond', {
        from: deployer,
        owner: contractOwner,
        facets: [
            "TuffVBT",
            "AaveLPManager",
            "TuffKeeper",
            "TokenMaturity",
            "UniswapManager",
            "UniswapPriceConsumer"
        ],
        log: true
    });
    // @ts-ignore
    let tuffVBTDiamondContract = await hre.ethers.getContractAt(tuffVBTDiamond.abi, tuffVBTDiamond.address, contractOwner);
    const tuffVBTAddress = await tuffVBTDiamondContract.address;
    console.log(`TuffVBTDiamond address [${tuffVBTAddress}]`);

    if (!await tuffVBTDiamondContract.isTuffVBTInit()) {
        let initTx = await tuffVBTDiamondContract.initTuffVBT(
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

    if (!await tuffVBTDiamondContract.isAaveInit()) {
        let tx = await tuffVBTDiamondContract.initAaveLPManager(
            consts("AAVE_LENDINGPOOL_PROVIDER_ADDR"), consts("AAVE_PROTOCOL_DATA_PROVIDER_ADDR"),
            consts("WETH9_ADDR")
        );
        logDeploymentTx("Initialized AaveLPManager:", tx);

        tx = await tuffVBTDiamondContract.addAaveSupportedToken(consts("DAI_ADDR"), 5000);
        logDeploymentTx("Added DAI support to AaveLPManager:", tx);

        tx = await tuffVBTDiamondContract.addAaveSupportedToken(consts("USDC_ADDR"), 2500);
        logDeploymentTx("Added USDC support to AaveLPManager:", tx);

        tx = await tuffVBTDiamondContract.addAaveSupportedToken(consts("USDT_ADDR"), 2500);
        logDeploymentTx("Added USDT support to AaveLPManager:", tx);
    }

    if (!await tuffVBTDiamondContract.isTuffKeeperInit()) {
        let initTx = await tuffVBTDiamondContract.initTuffKeeper();
        logDeploymentTx("Initialized TuffKeeper:", initTx);
    }

    if (!await tuffVBTDiamondContract.isTokenMaturityInit()) {
        let initTx = await tuffVBTDiamondContract.initTokenMaturity(TOKEN_DAYS_UNTIL_MATURITY);
        logDeploymentTx("Initialized TokenMaturity:", initTx);
    }

    if (!await tuffVBTDiamondContract.isUniswapManagerInit()) {
        let initTx = await tuffVBTDiamondContract.initUniswapManager(
            consts("UNISWAP_V3_ROUTER_ADDR"),
            consts("WETH9_ADDR"),
            UNISWAP_POOL_BASE_FEE
        );
        logDeploymentTx("Initialized UniswapManager:", initTx);
    }

    if (!await tuffVBTDiamondContract.isUniswapPriceConsumerInit()) {
        let initTx = await tuffVBTDiamondContract.initUniswapPriceConsumer(consts("UNISWAP_V3_FACTORY_ADDR"));
        logDeploymentTx("Initialized UniswapPriceConsumer:", initTx);
    }
};

module.exports.tags = ['v0002'];
