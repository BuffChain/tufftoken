// SPDX-License-Identifier: agpl-3.0

const hre = require("hardhat");

const consts = require("../consts");

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
    await tuffTokenDiamondContract.initUniswapPriceConsumer(consts.WETH9_ADDRESS, consts.DAI_ADDRESS, consts.UNISWAP_POOL_BASE_FEE, consts.UNISWAP_V3_FACTORY_ADDRESS);
    await tuffTokenDiamondContract.initChainLinkPriceConsumer(consts.CHAINLINK_TOTAL_MARKETCAP_USD_AGGREGATOR_ADDRESS);
    await tuffTokenDiamondContract.initMarketTrend(consts.CHAINLINK_PRICE_CONSUMER_ENUM, false);
    await tuffTokenDiamondContract.initGovernance();
};

module.exports.tags = ['v0001'];
