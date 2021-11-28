// SPDX-License-Identifier: agpl-3.0

const hre = require("hardhat");

module.exports = async () => {
  const { deployments, getNamedAccounts } = hre;
  const { deployer, contractOwner } = await getNamedAccounts();

  console.log(`Deployer address [${deployer}]`)
  console.log(`Contract owner address [${contractOwner}]`)

  const tuffToken = await deployments.deploy({
    name: 'TuffToken',
    from: deployer,
    log: true
  });
  let tuffTokenContract = await hre.ethers.getContractAt(tuffToken.abi, tuffToken.address, contractOwner);
  console.log(`TuffToken address [${await tuffTokenContract.address}]`);

  const aaveLPManager = await deployments.deploy({
    name: 'AaveLPManager',
    from: deployer,
    log: true
  });
  let aaveLPManagerContract = await hre.ethers.getContractAt(aaveLPManager.abi, aaveLPManager.address, contractOwner);
  console.log(`AaveLPManager address [${await aaveLPManagerContract.address}]`);

  let tuffTokenDiamond = await deployments.diamond.deploy({
    name: 'TuffTokenDiamond',
    from: deployer,
    owner: contractOwner,
    facets: [tuffToken, aaveLPManager],
    log: true
  });
  let tuffTokenDiamondContract = await hre.ethers.getContractAt(tuffTokenDiamond.abi, tuffTokenDiamond.address, contractOwner);
  console.log(`TuffTokenDiamond address [${await tuffTokenDiamondContract.address}]`);

  await tuffTokenDiamondContract.initAaveLPManager();
  await tuffTokenDiamondContract.initTuffToken(contractOwner);
};

module.exports.tags = ['v0001'];
