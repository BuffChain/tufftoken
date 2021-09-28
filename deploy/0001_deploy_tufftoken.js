// SPDX-License-Identifier: agpl-3.0

const hre = require("hardhat");
const { getContractAddress } = require("@ethersproject/address");

module.exports = async () => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer, contractOwner } = await getNamedAccounts();

  console.log(`Deployer address [${deployer}]`)
  console.log(`Contract owner address [${contractOwner}]`)

  const deployerAcct = await hre.ethers.getSigner(deployer);
  const transactionCount = await deployerAcct.getTransactionCount();
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

  // MAIN NET WETH9 / DAI
  const tokenA = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  const tokenB = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
  const fee = 500;

  const uniswapPoolDeployer = await deploy('UniswapPoolDeployer', {
    from: deployer,
    args: [
        contractOwner,
        tokenA,
        tokenB,
        fee
    ],
    log: true,
  });

  const uniswapPriceConsumer = await deploy('UniswapPriceConsumer', {
    from: deployer,
    args: [
      contractOwner,
      tokenA,
      tokenB,
      fee
    ],
    log: true,
  });

  // Main net ETH/USD 0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419
  const chainLinkPriceConsumer = await deploy('ChainLinkPriceConsumer', {
    from: deployer,
    args: [
        "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
    ],
    log: true,
  });

  const uniswapMarketTrend = await deploy('MarketTrend', {
    from: deployer,
    args: [
      uniswapPriceConsumer.address,
      false
    ],
    log: true,
  });

};

module.exports.tags = ['v0001'];
