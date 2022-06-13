// SPDX-License-Identifier: agpl-3.0

const {expect} = require("chai");
const hre = require("hardhat");
const {expectRevert} = require("@openzeppelin/test-helpers");

describe("TuffOwner", function () {

    let owner;
    let buffChainAddr;
    let accounts;

    let tuffVBTDiamond;

    before(async function () {
        const {contractOwner, buffChain} = await hre.getNamedAccounts();
        owner = await hre.ethers.getSigner(contractOwner);
        buffChainAddr = buffChain;

        //Per `hardhat.config.ts`, the 0 and 1 index accounts are named accounts. They are reserved for deployment uses
        [, , ...accounts] = await hre.ethers.getSigners();
    });

    beforeEach(async function () {
        const {tDUU} = await hre.deployments.fixture();
        tuffVBTDiamond = await hre.ethers.getContractAt(tDUU.abi, tDUU.address, owner);
    });

    it('should set owner', async () => {

        let tuffOwner = await tuffVBTDiamond.getTuffOwner();
        expect(tuffOwner).to.equal(owner.address, "incorrect starting owner");

        const nonOwnerAccountAddress = accounts[1].address;
        await tuffVBTDiamond.transferTuffOwnership(nonOwnerAccountAddress);

        tuffOwner = await tuffVBTDiamond.getTuffOwner();
        expect(tuffOwner).to.equal(nonOwnerAccountAddress, "unexpected owner after set");

        await expectRevert(tuffVBTDiamond.transferTuffOwnership(owner.address), "Ownable: caller is not the owner");
    });

});
