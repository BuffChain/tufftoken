// SPDX-License-Identifier: agpl-3.0

import hre, { Web3 } from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { randomBytes } from "crypto";
import { TuffVBT, TuffKeeper, TuffOwner, AaveLPManager } from "../../src/types";

type TuffVBTDiamond = TuffVBT & TuffKeeper & TuffOwner & AaveLPManager;

import { consts } from "../../utils/consts";
import {
    mineBlock, sendTokensToAddr
} from "../../utils/test_utils";

const { expectRevert } = require("@openzeppelin/test-helpers");

describe("TuffKeeper", function() {

    let owner: SignerWithAddress;
    let accounts: SignerWithAddress[];

    let tuffVBTDiamond: TuffVBTDiamond;

    before(async function() {
        const { contractOwner } = await hre.getNamedAccounts();
        owner = await hre.ethers.getSigner(contractOwner);

        //Per `hardhat.config.ts`, the 0 and 1 index accounts are named accounts. They are reserved for deployment uses
        [, , ...accounts] = await hre.ethers.getSigners();
    });

    beforeEach(async function() {
        const { tDUU } = await hre.deployments.fixture();
        tuffVBTDiamond = await hre.ethers.getContractAt(tDUU.abi, tDUU.address, owner) as TuffVBTDiamond;

        await sendTokensToAddr(accounts.slice(-1)[0], tuffVBTDiamond.address);

        await tuffVBTDiamond.depositToAave(consts("DAI_ADDR"), hre.ethers.utils.parseEther("2000"));
    });


    it("should perform upkeep on token maturity", async () => {
        const interval = await tuffVBTDiamond.getTokenMaturityInterval();
        const dayInSeconds = 86400;

        expect(interval).to.equal(dayInSeconds, "interval should be 1 day.");

        await assertUpkeep(setTokenMaturityInterval, getLastTokenMaturityTimestamp, "TokenMaturityUpkeepPerformed");
    });

    it("should perform upkeep on balancing assets", async () => {
        //Increase the block time to prime the pool
        await hre.ethers.provider.send("evm_increaseTime", [3600]);
        await hre.ethers.provider.send("evm_mine", []);

        const interval = await tuffVBTDiamond.getBalanceAssetsInterval();
        const weekInSeconds = 86400 * 7;

        expect(interval).to.equal(weekInSeconds, "interval should be 1 week.");

        await assertUpkeep(setBalanceAssetsInterval, getLastBalanceAssetsTimestamp, "BalanceAssetsUpkeepPerformed");

    });

    async function getLastTokenMaturityTimestamp(): Promise<BigNumber> {
        return await tuffVBTDiamond.getLastTokenMaturityTimestamp();
    }

    async function getLastBalanceAssetsTimestamp(): Promise<BigNumber> {
        return await tuffVBTDiamond.getLastBalanceAssetsTimestamp();
    }

    async function setTokenMaturityInterval(newInterval: number) {
        await tuffVBTDiamond.setTokenMaturityInterval(newInterval);
    }

    async function setBalanceAssetsInterval(newInterval: number) {
        await tuffVBTDiamond.setBalanceAssetsInterval(newInterval);
    }

    async function assertUpkeep(setInterval: (newInterval: number) => any, getTimestamp: () => Promise<BigNumber>,
                                eventEmitted: string) {
        const startingTimeStamp = await getTimestamp();

        let [needed, performData] = await tuffVBTDiamond.checkUpkeep(randomBytes(0));

        expect(needed).to.equal(false, "should not need upkeep yet.");

        const expectedBlockTimestamp = parseInt(Web3.utils.toAscii(performData));

        let latestBlock = await hre.ethers.provider.getBlock("latest");
        const startingBlockTimestamp = latestBlock.timestamp;

        expect(startingBlockTimestamp).to.equal(expectedBlockTimestamp, "perform data should be block timestamp.");

        // shorten intervals to appease isIntervalComplete
        await setInterval(1);

        await mineBlock();

        latestBlock = await hre.ethers.provider.getBlock("latest");
        let latestTimestamp = latestBlock.timestamp;

        expect(latestTimestamp > startingBlockTimestamp).to.equal(true, "should have mined a block.");

        [needed, performData] = await tuffVBTDiamond.checkUpkeep(randomBytes(0));

        expect(needed).to.equal(true, "should need upkeep.");

        const upkeepTxResponse = await tuffVBTDiamond.performUpkeep(performData);
        const upkeepTxReceipt = await upkeepTxResponse.wait();

        const upkeepEvent = upkeepTxReceipt.events &&
            upkeepTxReceipt.events.filter(event => event.event === eventEmitted);
        expect(upkeepEvent);
        // @ts-ignore
        expect(upkeepEvent.length).to.equal(1);

        const endingTimestamp = await getTimestamp();

        expect(endingTimestamp > startingTimeStamp).to.equal(true,
            "last timestamp that performed upkeep should greater than the starting value");

        latestBlock = await hre.ethers.provider.getBlock("latest");
        latestTimestamp = latestBlock.timestamp;

        expect(latestTimestamp.toString()).to.equal(endingTimestamp,
            "last timestamp that performed upkeep should be the latest block.");
    }

    it("should fail due to only owner check", async () => {
        await tuffVBTDiamond.setTokenMaturityInterval(1);
        let interval = await tuffVBTDiamond.getTokenMaturityInterval();
        expect(interval).to.equal(1, "unexpected interval");

        const nonOwnerAccountAddress = accounts[1].address;
        await tuffVBTDiamond.transferTuffOwnership(nonOwnerAccountAddress);

        await expectRevert(tuffVBTDiamond.setTokenMaturityInterval(2), "NO");

        interval = await tuffVBTDiamond.getDevFee();
        expect(interval).to.equal(1, "interval should be left unchanged");
    });
});
