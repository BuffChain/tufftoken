// SPDX-License-Identifier: agpl-3.0

const hre = require("hardhat");

const {consts, UNISWAP_POOL_BASE_FEE, CHAINLINK_PRICE_CONSUMER_ENUM} = require("../utils/consts");
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
            "UniswapPriceConsumer",
            "ChainLinkPriceConsumer",
            "MarketTrend",
            "Governance"
        ],
        log: true
    });
    let tuffTokenDiamondContract = await hre.ethers.getContractAt(tuffTokenDiamond.abi, tuffTokenDiamond.address, contractOwner);
    console.log(`TuffTokenDiamond address [${await tuffTokenDiamondContract.address}]`);

    if (!await tuffTokenDiamondContract.isTuffTokenInit()) {
        let initTx = await tuffTokenDiamondContract.initTuffToken(contractOwner);
        logDeploymentTx("Initialized TuffToken:", initTx);
    }

    if (!await tuffTokenDiamondContract.isAaveInit()) {
        let initTx = await tuffTokenDiamondContract.initAaveLPManager(consts("AAVE_LENDINGPOOL_PROVIDER_ADDR"), [
            consts("DAI_ADDR"), consts("USDC_ADDR"), consts("USDT_ADDR")
        ]);
        logDeploymentTx("Initialized AaveLPManager:", initTx);
    }

    if (!await tuffTokenDiamondContract.isUniswapPriceConsumerInit()) {
        let initTx = await tuffTokenDiamondContract.initUniswapPriceConsumer(consts("WETH9_ADDR"), consts("DAI_ADDR"), UNISWAP_POOL_BASE_FEE, consts("UNISWAP_V3_FACTORY_ADDR"));
        logDeploymentTx("Initialized UniswapPriceConsumer:", initTx);
    }

    if (!await tuffTokenDiamondContract.isChainLinkPriceConsumerInit()) {
        let initTx = await tuffTokenDiamondContract.initChainLinkPriceConsumer(consts("CHAINLINK_AGGREGATOR_ADDR"));
        logDeploymentTx("Initialized ChainLinkPriceConsumer:", initTx);
    }

    if (!await tuffTokenDiamondContract.isMarketTrendInit()) {
        let initTx = await tuffTokenDiamondContract.initMarketTrend(CHAINLINK_PRICE_CONSUMER_ENUM, false);
        logDeploymentTx("Initialized MarketTrend:", initTx);
    }

    if (!await tuffTokenDiamondContract.isGovernanceInit()) {
        let initTx = await tuffTokenDiamondContract.initGovernance();
        logDeploymentTx("Initialized Governance:", initTx);
    }
};

module.exports.tags = ['v0001'];
