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
    facets: ['TuffToken'],
    execute: {
      methodName: 'initTuffToken',
      args: [contractOwner],
    },
  });

  await deployments.diamond.deploy('TuffTokenDiamond', {
    from: contractOwner,
    owner: contractOwner,
    facets: ['TuffToken', 'AaveLPManager'],
    execute: {
      methodName: 'initAaveLPManager',
      args: [],
    },
  });
};

module.exports.tags = ['v0001'];
