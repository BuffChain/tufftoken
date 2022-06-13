// SPDX-License-Identifier: agpl-3.0

import hre from 'hardhat';
import { AAVE_BALANCE_BUFFER_PERCENTAGE } from '../utils/consts';

const {
    consts, UNISWAP_POOL_BASE_FEE, TOKEN_NAME, TOKEN_SYMBOL, TOKEN_DECIMALS, TOKEN_FARM_FEE, TOKEN_DEV_FEE,
    TOKEN_TOTAL_SUPPLY, TOKEN_DAYS_UNTIL_MATURITY
} = require("../utils/consts");
const {logDeploymentTx} = require("../utils/deployment_helpers");

module.exports = async () => {
    console.log(`[DEPLOY][v0002] - Deploying and initializing ${TOKEN_SYMBOL}`);

    const {deployments, getNamedAccounts} = hre;
    const {deployer, contractOwner, buffChain} = await getNamedAccounts();
    const contractOwnerAcct = await hre.ethers.getSigner(contractOwner);

    console.log(`Deployer address [${deployer}]`);
    console.log(`Contract owner address [${contractOwner}]`);

    let tuffDUUDeployment = await deployments.diamond.deploy(TOKEN_SYMBOL, {
        from: deployer,
        owner: contractOwner,
        facets: [
            {
                name: "TuffOwner",
                args: [contractOwner],
            },
            {
                name: "TuffVBT",
                args: [
                    contractOwner,
                    TOKEN_NAME,
                    TOKEN_SYMBOL,
                    TOKEN_DECIMALS,
                    TOKEN_FARM_FEE,
                    TOKEN_DEV_FEE,
                    buffChain,
                    TOKEN_TOTAL_SUPPLY
                ],
            },
            {
                name: "AaveLPManager",
                args: [
                    consts("AAVE_LENDINGPOOL_PROVIDER_ADDR"),
                    consts("AAVE_PROTOCOL_DATA_PROVIDER_ADDR"),
                    consts("WETH9_ADDR"), AAVE_BALANCE_BUFFER_PERCENTAGE
                ],
            },
            {
                name: "TuffKeeper"
            },
            {
                name: "TokenMaturity",
                args: [TOKEN_DAYS_UNTIL_MATURITY],
            },
            {
                name: "UniswapManager",
                args: [
                    consts("UNISWAP_V3_ROUTER_ADDR"),
                    consts("WETH9_ADDR"),
                    UNISWAP_POOL_BASE_FEE
                ],
            },
            {
                name: "PriceConsumer",
                args: [consts("UNISWAP_V3_FACTORY_ADDR")],
            }
        ],
        log: true
    });
    let tuffDUU = await hre.ethers.getContractAt(tuffDUUDeployment.abi, tuffDUUDeployment.address, contractOwnerAcct);
    console.log(`${TOKEN_SYMBOL} address [${await tuffDUU.address}]`);

    if (!await tuffDUU.isTuffOwnerInit()) {
        let initTx = await tuffDUU.initTuffOwner(
            contractOwner
        );
        logDeploymentTx("Initialized TuffOwner:", initTx);
    }

    // if (!await tuffDUU.isTuffVBTInit()) {
    //     let initTx = await tuffDUU.initTuffVBT(
    //         contractOwner,
    //         TOKEN_NAME,
    //         TOKEN_SYMBOL,
    //         TOKEN_DECIMALS,
    //         TOKEN_FARM_FEE,
    //         TOKEN_DEV_FEE,
    //         buffChain,
    //         TOKEN_TOTAL_SUPPLY
    //     );
    //     logDeploymentTx("Initialized Tuff VBT:", initTx);
    // }
    //
    // if (!await tuffDUU.isAaveInit()) {
    //     let tx = await tuffDUU.initAaveLPManager(
    //         consts("AAVE_LENDINGPOOL_PROVIDER_ADDR"), consts("AAVE_PROTOCOL_DATA_PROVIDER_ADDR"),
    //         consts("WETH9_ADDR"), AAVE_BALANCE_BUFFER_PERCENTAGE
    //     );
    //     logDeploymentTx("Initialized AaveLPManager:", tx);
    //
    //     tx = await tuffDUU.addAaveSupportedToken(
    //         consts("DAI_ADDR"), consts("CHAINLINK_ETH_DAI_AGGR_ADDR"), 500000);
    //     logDeploymentTx("Added DAI support to AaveLPManager:", tx);
    //
    //     tx = await tuffDUU.addAaveSupportedToken(
    //         consts("USDC_ADDR"), consts("CHAINLINK_ETH_USDC_AGGR_ADDR"), 250000);
    //     logDeploymentTx("Added USDC support to AaveLPManager:", tx);
    //
    //     tx = await tuffDUU.addAaveSupportedToken(
    //         consts("USDT_ADDR"), consts("CHAINLINK_ETH_USDT_AGGR_ADDR"), 250000);
    //     logDeploymentTx("Added USDT support to AaveLPManager:", tx);
    // }
    //
    // if (!await tuffDUU.isTuffKeeperInit()) {
    //     let initTx = await tuffDUU.initTuffKeeper();
    //     logDeploymentTx("Initialized TuffKeeper:", initTx);
    // }
    //
    // if (!await tuffDUU.isTokenMaturityInit()) {
    //     let initTx = await tuffDUU.initTokenMaturity(TOKEN_DAYS_UNTIL_MATURITY);
    //     logDeploymentTx("Initialized TokenMaturity:", initTx);
    // }
    //
    // if (!await tuffDUU.isUniswapManagerInit()) {
    //     let initTx = await tuffDUU.initUniswapManager(
    //         consts("UNISWAP_V3_ROUTER_ADDR"),
    //         consts("WETH9_ADDR"),
    //         UNISWAP_POOL_BASE_FEE
    //     );
    //     logDeploymentTx("Initialized UniswapManager:", initTx);
    // }
    //
    // if (!await tuffDUU.isPriceConsumerInit()) {
    //     let initTx = await tuffDUU.initPriceConsumer(consts("UNISWAP_V3_FACTORY_ADDR"));
    //     logDeploymentTx("Initialized PriceConsumer:", initTx);
    // }
};

module.exports.tags = ['v0002'];
