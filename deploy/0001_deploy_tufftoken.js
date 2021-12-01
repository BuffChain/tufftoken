// SPDX-License-Identifier: agpl-3.0

const hre = require("hardhat");
const {
    WETH9_ADDRESS,
    DAI_ADDRESS,
    UNISWAP_POOL_BASE_FEE,
    CHAINLINK_ETH_USD_AGGREGATOR_ADDRESS,
    UNISWAP_FACTORY_ADDRESS,
    CHAINLINK_PRICE_CONSUMER_ENUM,
    UNISWAP_PRICE_CONSUMER_ENUM
} = require("../test/utils");

module.exports = async () => {
    const {deployments, getNamedAccounts} = hre;
    const {deployer, contractOwner} = await getNamedAccounts();

    console.log(`Deployer address [${deployer}]`)
    console.log(`Contract owner address [${contractOwner}]`)

    let tuffTokenDiamond = await deployments.diamond.deploy('TuffTokenDiamond', {
        from: deployer,
        owner: contractOwner,
        facets: [
            "TuffToken",
            "AaveLPManager",
            // "UniswapPoolDeployer",
            "UniswapPriceConsumer",
            "ChainLinkPriceConsumer",
            "MarketTrend",
            "Governance"
        ],
        log: true
    });
    let tuffTokenDiamondContract = await hre.ethers.getContractAt(tuffTokenDiamond.abi, tuffTokenDiamond.address, contractOwner);
    console.log(`TuffTokenDiamond address [${await tuffTokenDiamondContract.address}]`);

    await tuffTokenDiamondContract.initTuffToken(contractOwner);
    await tuffTokenDiamondContract.initAaveLPManager();
    // await tuffTokenDiamondContract.initUniswapPoolDeployer(WETH9_ADDRESS, DAI_ADDRESS, UNISWAP_POOL_BASE_FEE);
    await tuffTokenDiamondContract.initUniswapPriceConsumer(WETH9_ADDRESS, DAI_ADDRESS, UNISWAP_POOL_BASE_FEE, UNISWAP_FACTORY_ADDRESS);
    await tuffTokenDiamondContract.initChainLinkPriceConsumer(CHAINLINK_ETH_USD_AGGREGATOR_ADDRESS);
    await tuffTokenDiamondContract.initMarketTrend(UNISWAP_PRICE_CONSUMER_ENUM, false);
    await tuffTokenDiamondContract.initGovernance();
};

module.exports.tags = ['v0001'];
