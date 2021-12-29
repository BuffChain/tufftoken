// SPDX-License-Identifier: agpl-3.0

const {expect} = require("chai");
const hre = require("hardhat");

const consts = require("../consts");
const {BN} = require("@openzeppelin/test-helpers");
const {randomBytes} = require('crypto');
const utils = require("./utils");

describe('TokenMaturity', function () {

    const nowTimeStamp = Math.floor(Date.now() / 1000);

    let owner;
    let accounts;

    let tuffTokenDiamond;

    before(async function () {
        const {contractOwner} = await hre.getNamedAccounts();
        owner = await hre.ethers.getSigner(contractOwner);

        //Per `hardhat.config.js`, the 0 and 1 index accounts are named accounts. They are reserved for deployment uses
        [, , ...accounts] = await hre.ethers.getSigners();

    });

    beforeEach(async function () {
        const {TuffTokenDiamond} = await hre.deployments.fixture();
        tuffTokenDiamond = await hre.ethers.getContractAt(TuffTokenDiamond.abi, TuffTokenDiamond.address, owner);

        const fromAccount = owner;
        const toAddr = TuffTokenDiamond.address;
        const amount = "100";
        await utils.transferETH(
            fromAccount,
            toAddr,
            amount
        )
    });


    it('should set token maturity', async () => {

        await tuffTokenDiamond.setContractMaturityTimestamp(nowTimeStamp);

        let isMatured = await tuffTokenDiamond.isTokenMatured(nowTimeStamp - 1);

        expect(isMatured).to.equal(false, "should not have reached maturity");

        isMatured = await tuffTokenDiamond.isTokenMatured(nowTimeStamp);

        expect(isMatured).to.equal(true, "should have reached maturity");

    });

    it('should get treasury liquidation status', async () => {

        let isLiquidated = await tuffTokenDiamond.getIsTreasuryLiquidated();

        expect(isLiquidated).to.equal(false, "should not have been liquidated");

        await tuffTokenDiamond.liquidateTreasury();

        isLiquidated = await tuffTokenDiamond.getIsTreasuryLiquidated();

        expect(isLiquidated).to.equal(true, "should have been liquidated");

    });


    it('should get token supply', async () => {

        let totalSupply = parseFloat(await tuffTokenDiamond.totalSupply());

        const expectedStartingSupply = 1000000000 * 10 ** 9;

        expect(totalSupply).to.equal(expectedStartingSupply, "incorrect totalSupply");

        let totalSupplyForRedemption = parseFloat(await tuffTokenDiamond.totalSupplyForRedemption());

        expect(totalSupplyForRedemption).to.equal(totalSupply, "incorrect totalSupply");

        await tuffTokenDiamond.setTotalSupplyForRedemption("" + (expectedStartingSupply - 1))

        totalSupplyForRedemption = parseFloat(await tuffTokenDiamond.totalSupplyForRedemption());

        expect(totalSupplyForRedemption).to.equal(expectedStartingSupply - 1, "incorrect totalSupply");

    });

    it('should get token eth balance', async () => {

        let startingEthBalance = await tuffTokenDiamond.getContractStartingEthBalance();

        expect(startingEthBalance).to.equal(0, "incorrect starting balance");

        await tuffTokenDiamond.setContractStartingEthBalance(100);

        startingEthBalance = await tuffTokenDiamond.getContractStartingEthBalance();

        expect(startingEthBalance).to.equal(100, "incorrect starting balance");

    });

});
