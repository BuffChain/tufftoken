// SPDX-License-Identifier: agpl-3.0

const hre = require("hardhat");

module.exports = async () => {

    const {deployments, getNamedAccounts} = hre;
    const {deployer, contractOwner} = await getNamedAccounts();

    console.log(`Deployer address [${deployer}]`);
    console.log(`Contract owner address [${contractOwner}]`);

    const tuffTokenDiamond = await deployments.get("TuffTokenDiamond");

    let tuffGovToken = await deployments.deploy('TuffGovToken', {
        from: deployer,
        owner: contractOwner,
        args: [tuffTokenDiamond.address],
        log: true
    });

    console.log(`TuffGovToken address [${tuffGovToken.address}]`);

    let timelockController = await deployments.deploy('TimelockController', {
        from: deployer,
        owner: contractOwner,
        // TODO: decide access roles
        args: [60, [contractOwner], [contractOwner]],
        log: true
    });

    console.log(`TimelockController address [${timelockController.address}]`);

    let tuffGovernor = await deployments.deploy('TuffGovernor', {
        from: deployer,
        owner: contractOwner,
        args: [tuffGovToken.address, timelockController.address],
        log: true
    });

    console.log(`TuffGovernor address [${await tuffGovernor.address}]`);


};

module.exports.tags = ['v0003'];
