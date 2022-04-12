// SPDX-License-Identifier: agpl-3.0

const hre = require("hardhat");

const {consts, UNISWAP_POOL_BASE_FEE, TOKEN_NAME, TOKEN_SYMBOL, TOKEN_DECIMALS, TOKEN_FARM_FEE, TOKEN_DEV_FEE,
    TOKEN_TOTAL_SUPPLY, TOKEN_DAYS_UNTIL_MATURITY
} = require("../utils/consts");
const {logDeploymentTx} = require("../utils/deployment_helpers");

module.exports = async () => {
    const {deployments, getNamedAccounts} = hre;
    const {deployer, contractOwner} = await getNamedAccounts();

    console.log(`Deployer address [${deployer}]`);
    console.log(`Contract owner address [${contractOwner}]`);

    let tuffTokenDiamond = await deployments.diamond.deploy('TuffTokenDiamond', {
        from: deployer,
        owner: contractOwner,
        facets: [
            "TuffToken",
            "AaveLPManager",
            "TuffKeeper",
            "TokenMaturity",
            "UniswapManager",
            "UniswapPriceConsumer"
        ],
        log: true
    });
    let tuffTokenDiamondContract = await hre.ethers.getContractAt(tuffTokenDiamond.abi, tuffTokenDiamond.address, contractOwner);
    const tuffTokenAddress = await tuffTokenDiamondContract.address;
    console.log(`TuffTokenDiamond address [${tuffTokenAddress}]`);

    if (!await tuffTokenDiamondContract.isTuffTokenInit()) {
        let initTx = await tuffTokenDiamondContract.initTuffToken(
            contractOwner,
            TOKEN_NAME,
            TOKEN_SYMBOL,
            TOKEN_DECIMALS,
            TOKEN_FARM_FEE,
            TOKEN_DEV_FEE,
            consts("DEV_WALLET_ADDR"),
            TOKEN_TOTAL_SUPPLY
        );
        logDeploymentTx("Initialized TuffToken:", initTx);
    }

    if (!await tuffTokenDiamondContract.isAaveInit()) {
        let tx = await tuffTokenDiamondContract.initAaveLPManager(
            consts("AAVE_LENDINGPOOL_PROVIDER_ADDR"),  consts("AAVE_PROTOCOL_DATA_PROVIDER_ADDR"),
            consts("WETH9_ADDR")
        );
        logDeploymentTx("Initialized AaveLPManager:", tx);

        tx = await tuffTokenDiamondContract.addAaveSupportedToken(consts("DAI_ADDR"), 5000);
        logDeploymentTx("Added DAI support to AaveLPManager:", tx);

        tx = await tuffTokenDiamondContract.addAaveSupportedToken(consts("USDC_ADDR"), 2500);
        logDeploymentTx("Added USDC support to AaveLPManager:", tx);

        tx = await tuffTokenDiamondContract.addAaveSupportedToken(consts("USDT_ADDR"), 2500);
        logDeploymentTx("Added USDT support to AaveLPManager:", tx);
    }

    if (!await tuffTokenDiamondContract.isTuffKeeperInit()) {
        let initTx = await tuffTokenDiamondContract.initTuffKeeper();
        logDeploymentTx("Initialized TuffKeeper:", initTx);
    }

    if (!await tuffTokenDiamondContract.isTokenMaturityInit()) {
        let initTx = await tuffTokenDiamondContract.initTokenMaturity(TOKEN_DAYS_UNTIL_MATURITY);
        logDeploymentTx("Initialized TokenMaturity:", initTx);
    }

    if (!await tuffTokenDiamondContract.isUniswapManagerInit()) {
        let initTx = await tuffTokenDiamondContract.initUniswapManager(
            consts("UNISWAP_V3_ROUTER_ADDR"),
            consts("WETH9_ADDR"),
            UNISWAP_POOL_BASE_FEE
        );
        logDeploymentTx("Initialized UniswapManager:", initTx);
    }


    if (!await tuffTokenDiamondContract.isUniswapPriceConsumerInit()) {
        let initTx = await tuffTokenDiamondContract.initUniswapPriceConsumer(consts("UNISWAP_V3_FACTORY_ADDR"));
        logDeploymentTx("Initialized UniswapPriceConsumer:", initTx);
    }
};

module.exports.tags = ['v0001'];
