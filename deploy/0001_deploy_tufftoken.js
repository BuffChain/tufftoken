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

  const uniswapV3PoolManager = await deploy('UniswapV3PoolManager', {
    from: deployer,
    args: [
        contractOwner,
    ],
    log: true,
  });

  const marketTrend = await deploy('MarketTrend', {
    from: deployer,
    args: [
        uniswapV3PoolManager.address,
        false
    ],
    log: true,
  });


  // // Main net ETH/USD 0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419
  // const marketTrend = await deploy('MarketTrend', {
  //   from: deployer,
  //   args: [
  //     "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
  //     false
  //   ],
  //   log: true,
  // });

};

module.exports.tags = ['v0001'];
