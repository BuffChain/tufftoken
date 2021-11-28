// SPDX-License-Identifier: agpl-3.0

const hre = require("hardhat");

module.exports = async () => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer, contractOwner } = await getNamedAccounts();
  const tuffToken = await hre.ethers.getContract('TuffToken', deployer);

  // const governance = await deploy('Governance', {
  //   from: deployer,
  //   args: [contractOwner, tuffToken.address],
  //   log: true,
  // });

};

module.exports.tags = ['v0002'];
