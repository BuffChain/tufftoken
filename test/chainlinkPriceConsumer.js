// SPDX-License-Identifier: agpl-3.0

const {expect} = require("chai");
const hre = require("hardhat");

describe('ChainLinkPriceConsumer', function () {

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
    });

    it('should get latest round data', async () => {
        const [
            roundId,
            answer,
            startedAt,
            updatedAt,
            answeredInRound
        ] = await tuffTokenDiamond.getLatestRoundData();

        expect(answer > 0).to.equal(true, "unexpected answer.")
    });

    it('should get price', async () => {
        const price = await tuffTokenDiamond.getChainLinkPrice();

        expect(price > 0).to.equal(true, "unexpected price.")
    });
});
