// SPDX-License-Identifier: agpl-3.0

const hre = require("hardhat");

module.exports = async () => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer, contractOwner } = await getNamedAccounts();
  const tuffToken = await hre.ethers.getContract('TuffToken', deployer);

  const governance = await deploy('Governance', {
    from: deployer,
    args: [contractOwner, tuffToken.address],
    log: true,
  });

  const currentTimestamp = Date.now();
  const electionEnd = currentTimestamp + 60000;
  const election = await deploy('Election', {
    from: deployer,
    args: [contractOwner, "Test Election", "This is a test.", "Ian Ballard", electionEnd, tuffToken.address],
    log: true,
  });

  const electionPastEnd = await deploy('ElectionPastEnd', {
    contract: 'Election',
    from: deployer,
    args: [contractOwner, "Test Election 2", "This is a test.", "Ian Ballard", 1, tuffToken.address],
    log: true,
  });
};

module.exports.tags = ['v0002'];
