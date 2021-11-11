// SPDX-License-Identifier: agpl-3.0

const hre = require("hardhat");

module.exports = async () => {
  const { deployments, getNamedAccounts } = hre;
  const { deployer, contractOwner } = await getNamedAccounts();

  console.log(`Deployer address [${deployer}]`)
  console.log(`Contract owner address [${contractOwner}]`)

  await deployments.diamond.deploy('TuffTokenDiamond', {
    from: deployer,
    owner: contractOwner,
    facets: ['DiamondBase'],
    execute: {
      methodName: 'initBase',
      args: [],
    }
  });

  let tuffTokenDiamondDeployment = await deployments.diamond.deploy('TuffTokenDiamond', {
    from: contractOwner,
    owner: contractOwner,
    facets: ['DiamondBase', 'TuffToken'],
    execute: {
      methodName: 'initTuffToken',
      args: [contractOwner],
    },
  });

  // let tuffTokenDiamondContract = await hre.ethers.getContractAt(tuffTokenDiamondDeployment.abi, tuffTokenDiamondDeployment.address, contractOwner);
  // const isTuffTokenInitialized = await tuffTokenDiamondContract.isTuffTokenInitialized();
  // console.log(`tuffTokenDiamondContract.isTuffTokenInitialized=${isTuffTokenInitialized}`)

  //This doesn't work as the aave facet has not been deploy yet, thus it can't be initialized!
  // const isAaveInitialized = await tuffTokenDiamondContract.isAaveInitialized();
  // console.log(`tuffTokenDiamondContract.isAaveInitialized=${isAaveInitialized}`)

  tuffTokenDiamondDeployment = await deployments.diamond.deploy('TuffTokenDiamond', {
    from: contractOwner,
    owner: contractOwner,
    facets: ['DiamondBase', 'TuffToken', 'AaveLPManager'],
    execute: {
      methodName: 'initAaveLPManager',
      args: [],
    },
  });

  // tuffTokenDiamondContract = await hre.ethers.getContractAt(tuffTokenDiamondDeployment.abi, tuffTokenDiamondDeployment.address, contractOwner);
  // const isAaveInit = await tuffTokenDiamondContract.isAaveInit();
  // console.log(`tuffTokenDiamondContract.isAaveInit=${isAaveInit}`);

  // tuffTokenDiamondDeployment = await deployments.diamond.deploy('TuffTokenDiamond', {
  //   from: contractOwner,
  //   owner: contractOwner,
  //   facets: ['DiamondBase', 'TuffToken', 'AaveLPManager', 'AaveLPDemo'],
  //   execute: {
  //     methodName: 'initAaveLPDemo',
  //     args: [],
  //   },
  // });
};

module.exports.tags = ['v0001'];
