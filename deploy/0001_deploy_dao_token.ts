// SPDX-License-Identifier: agpl-3.0

import hre from 'hardhat';

const AccessControlABI = require('../artifacts/@openzeppelin/contracts/access/AccessControl.sol/AccessControl.json').abi;

module.exports = async () => {
    console.log("[DEPLOY][v0005] - Deploying TuffGov token");

    const {deployments, getNamedAccounts} = hre;
    const {deployer, contractOwner} = await getNamedAccounts();

    console.log(`Deployer address [${deployer}]`);
    console.log(`Contract owner address [${contractOwner}]`);

    const tuffTokenDiamond = await deployments.get("TuffTokenDiamond");

    let tuffDAOToken = await deployments.deploy('TuffDAOToken', {
        from: contractOwner,
        args: ["TuffDAOToken", "TuffDAO"],
        log: true
    });

    console.log(`TuffDAOToken address [${tuffDAOToken.address}]`);

    // @ts-ignore
    const tuffTokenDiamondContract = await hre.ethers.getContractAt(tuffTokenDiamond.abi, tuffTokenDiamond.address, contractOwner);

    await tuffTokenDiamondContract.excludeFromFee(tuffDAOToken.address);

    let timelockController = await deployments.deploy('TimelockController', {
        from: contractOwner,
        // access control: https://docs.openzeppelin.com/contracts/4.x/governance#timelock
        args: [0, [], []],
        log: true
    });

    console.log(`TimelockController address [${timelockController.address}]`);

    let tuffGovernor = await deployments.deploy('TuffGovernor', {
        from: contractOwner,
        args: [tuffDAOToken.address, timelockController.address],
        log: true
    });

    console.log(`TuffGovernor address [${await tuffGovernor.address}]`);

    //https://docs.openzeppelin.com/defender/guide-timelock-roles
    const proposerRole = '0xb09aa5aeb3702cfd50b6b62bc4532604938f21248a27a1d5ca736082b6819cc1';
    const executorRole = '0xd8aa0f3194971a2a116679f7c2090f6939c8d4e01a2a8d7e41d55e5351469e63';
    const adminRole = '0x5f58e3a2316349923ce3780f8d587db2d72378aed66a8261c916544fa6846ca5';

    // @ts-ignore
    let accessControl = await hre.ethers.getContractAt(AccessControlABI, timelockController.address, contractOwner);

    // access control: https://docs.openzeppelin.com/contracts/4.x/governance#timelock
    await accessControl.grantRole(proposerRole, tuffGovernor.address);
    await accessControl.grantRole(executorRole, tuffGovernor.address);
    await accessControl.revokeRole(adminRole, deployer);
};

module.exports.tags = ['v0001'];
