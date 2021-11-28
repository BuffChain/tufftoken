// SPDX-License-Identifier: agpl-3.0

const hre = require("hardhat");

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

  await tuffTokenDiamondContract.initAaveLPManager();
  await tuffTokenDiamondContract.initTuffToken(contractOwner);
};

module.exports.tags = ['v0001'];
