// SPDX-License-Identifier: agpl-3.0

const {expect} = require("chai");
const {
    BN,           // Big Number support
    constants,    // Common constants, like the zero address and largest integers
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');
const hre = require("hardhat");

const utils = require("../../utils/test_utils");
const {consts} = require("../../utils/consts");

describe('AaveLPManager', function () {
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

        await utils.sendTokensToAddr(accounts.at(-1), tuffTokenDiamond.address);
    });

    it('should be initialized', async () => {
        const isAaveInit = await tuffTokenDiamond.isAaveInit();
        expect(isAaveInit).to.be.true;
    });

    it('should set pool address correctly', async () => {
        const address = await tuffTokenDiamond.getAaveLPAddr();

        //The correct address is pulled from https://docs.aave.com/developers/deployed-contracts/deployed-contracts
        expect(address).to.equal("0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9");
    });

    it('should have the correct tokens supported at launch', async () => {
        const supportedTokens = await tuffTokenDiamond.getAllAaveSupportedTokens();

        expect(supportedTokens.length).to.equal(3);
        expect(supportedTokens).to.contain(consts("DAI_ADDR"));
        expect(supportedTokens).to.contain(consts("USDC_ADDR"));
        expect(supportedTokens).to.contain(consts("USDT_ADDR"));
    });

    it('should add a token', async () => {
        let supportedTokens = await tuffTokenDiamond.getAllAaveSupportedTokens();
        expect(supportedTokens.length).to.equal(3);
        expect(supportedTokens).to.not.contain(consts("ADAI_ADDR"));

        await tuffTokenDiamond.addAaveSupportedToken(consts("ADAI_ADDR"));

        supportedTokens = await tuffTokenDiamond.getAllAaveSupportedTokens();
        expect(supportedTokens.length).to.equal(4);
        expect(supportedTokens).to.contain(consts("ADAI_ADDR"));
    });

    it('should remove a token', async () => {
        let supportedTokens = await tuffTokenDiamond.getAllAaveSupportedTokens();
        expect(supportedTokens.length).to.equal(3);
        expect(supportedTokens).to.contain(consts("DAI_ADDR"));

        await tuffTokenDiamond.removeAaveSupportedToken(consts("DAI_ADDR"));

        supportedTokens = await tuffTokenDiamond.getAllAaveSupportedTokens();
        expect(supportedTokens.length).to.equal(2);
        expect(supportedTokens).to.not.contain(consts("DAI_ADDR"));
    });

    it('reverts if adding a non-ERC20 token', async () => {
        await expectRevert(tuffTokenDiamond.addAaveSupportedToken(consts("UNISWAP_V3_ROUTER_ADDR")),
            "The tokenAddr supplied is not ERC20 compatible");
    });

    it("should deposit dai into aave from TuffToken's wallet", async () => {
        const qtyInDAI = hre.ethers.utils.parseEther("2000");

        //Check that the account has enough DAI
        const daiContract = await utils.getDAIContract();
        const startDaiQty = await daiContract.balanceOf(tuffTokenDiamond.address);
        expect(new BN(startDaiQty.toString())).to.be.bignumber.greaterThan(new BN(qtyInDAI.toString()));

        //Check that the account has no aDAI
        const adaiContract = await utils.getADAIContract();
        const startAdaiQty = await adaiContract.balanceOf(tuffTokenDiamond.address);
        expect(new BN(0)).to.be.bignumber.equal(new BN(startAdaiQty.toString()));

        //Make the call to deposit Aave
        await tuffTokenDiamond.depositToAave(consts("DAI_ADDR"), qtyInDAI);

        //Check that the account has deposited the DAI
        const endDaiQty = await daiContract.balanceOf(tuffTokenDiamond.address);
        expect(new BN(endDaiQty.toString())).to.be.bignumber.equal(new BN(startDaiQty.sub(qtyInDAI).toString()));

        //Check that the account now has aDAI equal to the DAI we deposited
        const endAdaiQty = await adaiContract.balanceOf(tuffTokenDiamond.address);
        expect(new BN(qtyInDAI.toString())).to.be.bignumber.equal(new BN(endAdaiQty.toString()));
    });

    it("revert if token deposited is not supported", async () => {
        await expectRevert(tuffTokenDiamond.depositToAave(consts("WETH9_ADDR"), 0),
            "This token is not currently supported");
    });
});