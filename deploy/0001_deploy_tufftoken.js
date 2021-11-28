// SPDX-License-Identifier: agpl-3.0

const hre = require("hardhat");
const { getContractAddress } = require("@ethersproject/address");
const {WETH9_ADDRESS, DAI_ADDRESS, UNISWAP_POOL_BASE_FEE, CHAINLINK_ETH_USD_AGGREGATOR_ADDRESS, UNISWAP_FACTORY_ADDRESS} = require("../test/utils");

module.exports = async () => {
  const { deployments, getNamedAccounts } = hre;
  const { deployer, contractOwner } = await getNamedAccounts();

  console.log(`Deployer address [${deployer}]`)
  console.log(`Contract owner address [${contractOwner}]`)

  let tuffTokenDiamond = await deployments.diamond.deploy('TuffTokenDiamond',{
    from: deployer,
    owner: contractOwner,
    facets: ["TuffToken", "AaveLPManager"],
    log: true
  });
  let tuffTokenDiamondContract = await hre.ethers.getContractAt(tuffTokenDiamond.abi, tuffTokenDiamond.address, contractOwner);
  console.log(`TuffTokenDiamond address [${await tuffTokenDiamondContract.address}]`);

  const tuffToken = await deploy('TuffToken', {
    from: deployer,
    args: [contractOwner, farmTreasury.address],
    log: true,
  });

  const uniswapPoolDeployer = await deploy('UniswapPoolDeployer', {
    from: deployer,
    args: [
        contractOwner,
        WETH9_ADDRESS,
        DAI_ADDRESS,
        UNISWAP_POOL_BASE_FEE
    ],
    log: true,
  });

  transactionCount = await deployerAcct.getTransactionCount();

  const marketTrendAddress = getContractAddress({
    from: deployer,

    //Add one as we want the contract address after next.
    nonce: transactionCount + 2
  })

  const uniswapPriceConsumer = await deploy('UniswapPriceConsumer', {
    from: deployer,
    args: [
      marketTrendAddress,
      WETH9_ADDRESS,
      DAI_ADDRESS,
      UNISWAP_POOL_BASE_FEE,
      UNISWAP_FACTORY_ADDRESS
    ],
    log: true,
  });

  // Main net ETH/USD 0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419
  const chainLinkPriceConsumer = await deploy('ChainLinkPriceConsumer', {
    from: deployer,
    args: [
      marketTrendAddress,
      CHAINLINK_ETH_USD_AGGREGATOR_ADDRESS,
    ],
    log: true,
  });

  const marketTrend = await deploy('MarketTrend', {
    from: deployer,
    args: [
      contractOwner,
      uniswapPriceConsumer.address,
      false
    ],
    log: true,
  });

  await tuffTokenDiamondContract.initAaveLPManager();
  await tuffTokenDiamondContract.initTuffToken(contractOwner);
};

module.exports.tags = ['v0001'];
