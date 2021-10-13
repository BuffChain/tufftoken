// SPDX-License-Identifier: agpl-3.0

const hre = require("hardhat");
const { getContractAddress } = require("@ethersproject/address");
const {WETH9_ADDRESS, DAI_ADDRESS, UNISWAP_POOL_BASE_FEE, CHAINLINK_ETH_USD_AGGREGATOR_ADDRESS, UNISWAP_FACTORY_ADDRESS} = require("../test/utils");

module.exports = async () => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer, contractOwner } = await getNamedAccounts();

  console.log(`Deployer address [${deployer}]`)
  console.log(`Contract owner address [${contractOwner}]`)

  const deployerAcct = await hre.ethers.getSigner(deployer);
  let transactionCount = await deployerAcct.getTransactionCount();
  const farmTreasuryAddress = getContractAddress({
    from: deployer,

    //Add one as we want the contract address after next. Another way to say that is, we want the farmTreasury contract
    // address, which will be the address after the aaveLPManager contract is deployed
    nonce: transactionCount + 1
  })

  const aaveLPManager = await deploy('AaveLPManager', {
    from: deployer,
    args: [farmTreasuryAddress],
    log: true,
  });

  const farmTreasury = await deploy('FarmTreasury', {
    from: deployer,
    args: [contractOwner, aaveLPManager.address],
    log: true,
  });

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

};

module.exports.tags = ['v0001'];
