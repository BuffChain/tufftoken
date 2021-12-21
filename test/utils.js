// SPDX-License-Identifier: agpl-3.0

const hre = require("hardhat");

const SwapRouterABI = require("@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json").abi;
const WETH9ABI = require("@uniswap/v3-periphery/artifacts/contracts/interfaces/external/IWETH9.sol/IWETH9.json").abi;
const IERC20ABI = require("@uniswap/v3-core/artifacts/contracts/interfaces/IERC20Minimal.sol/IERC20Minimal.json").abi;

const WETH9_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const DAI_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const ADAI_ADDRESS = "0x028171bCA77440897B824Ca71D1c56caC55b68A3";
const UNISWAP_WETH_DAI_POOL_ADDRESS = "0x60594a405d53811d3BC4766596EFD80fd545A270";
const UNISWAP_WETH_USDC_POOL_ADDRESS = "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640";
const UNISWAP_POOL_BASE_FEE = 500;
const CHAINLINK_ETH_USD_AGGREGATOR_ADDRESS = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419";
const CHAINLINK_TOTAL_MARKETCAP_USD_AGGREGATOR_ADDRESS = "0xEC8761a0A73c34329CA5B1D3Dc7eD07F30e836e2";
const UNISWAP_V3_ROUTER_ADDRESS = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
const UNISWAP_FACTORY_ADDRESS = "0x1F98431c8aD98523631AE4a59f267346ea31F984";

const CHAINLINK_PRICE_CONSUMER_ENUM = 0;
const UNISWAP_PRICE_CONSUMER_ENUM = 1;

async function getDAIContract() {
    return await hre.ethers.getContractAt(IERC20ABI, DAI_ADDRESS);
}

async function getWETH9Contract() {
    return await hre.ethers.getContractAt(WETH9ABI, WETH9_ADDRESS);
}

async function getUSDCContract() {
    return await hre.ethers.getContractAt(IERC20ABI, USDC_ADDRESS);
}

async function getADAIContract() {
    return await hre.ethers.getContractAt(IERC20ABI, ADAI_ADDRESS);
}

/**
 * Hardhat provides a default set of accounts that hold 10000 ETH each (https://hardhat.org/hardhat-network/reference/#initial-state).
 * You can use those accounts, and their signer, to send ETH to other accounts, such as contracts.
 * @param fromAccount: The signer and its address from which you want to send ETH from
 * @param toAddr: The address from which you want to receive the ETH to
 * @param amount: Amount of ETH to transfer Defaults to 100
 * @returns {Promise<Contract>}
 */
async function transferETH(fromAccount, toAddr, amount="100") {
    if (hre.hardhatArguments.verbose) {
        console.log(`[${fromAccount.address}] has [${hre.ethers.utils.formatEther(await hre.ethers.provider.getBalance(fromAccount.address))}]`);
        console.log(`[${toAddr}] has [${hre.ethers.utils.formatEther(await hre.ethers.provider.getBalance(toAddr))}]`);
    }
    const transactionHash = await fromAccount.sendTransaction({
        to: toAddr,
        value: hre.ethers.utils.parseEther(amount),
    });
    if (hre.hardhatArguments.verbose) {
        console.log(`[${fromAccount.address}] has [${hre.ethers.utils.formatEther(await hre.ethers.provider.getBalance(fromAccount.address))}]`);
        console.log(`[${toAddr}] has [${hre.ethers.utils.formatEther(await hre.ethers.provider.getBalance(toAddr))}]`);
    }
}

/**
 * Use this function to sign txs, within the `callbackFn`, for accounts that hardhat does not maintain.
 * @param acct: ethers.Signer account for a specific address. i.e. `await hre.ethers.getSigner(address)`
 * @param callbackFn: Async function that contains eth calls and txs to be run under the impersonated account
 * @returns {Promise<void>}
 */
async function runCallbackImpersonatingAcct(acct, callbackFn) {
    await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [acct.address],
    });

    await callbackFn(acct)

    await hre.network.provider.request({
        method: "hardhat_stopImpersonatingAccount",
        params: [acct.address],
    });
}

/**
 * General method to procure ETH, WETH, and DAI to a specific address
 * @param fromAcct:
 * @param toAddr
 * @returns {Promise<void>}
 */
async function sendTokensToAddress(fromAcct, toAddr) {
    //Set up accounts and variables
    const toAcct = await hre.ethers.getSigner(toAddr);
    await transferETH(fromAcct, toAddr)
    const expiryDate = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
    const qtyInWETH = hre.ethers.utils.parseEther("20");

    //Get smart contracts
    const daiContract = await getDAIContract();
    const weth9Contract = await getWETH9Contract();
    const uniswapSwapRouterContract = await hre.ethers.getContractAt(
        SwapRouterABI,
        UNISWAP_V3_ROUTER_ADDRESS
    );

    //Convert ETH to WETH
    await runCallbackImpersonatingAcct(toAcct, async (acct) => {
        await weth9Contract.connect(acct).approve(acct.address, qtyInWETH)
        await weth9Contract.connect(acct).deposit({"value": qtyInWETH})
    })

    //Swap half of the WETH to DAI with uniswap_v3
    const params = {
        tokenIn: WETH9_ADDRESS,
        tokenOut: DAI_ADDRESS,
        fee: 3000,
        recipient: toAddr,
        deadline: expiryDate,
        amountIn: qtyInWETH.div(2),
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0,
    };
    await runCallbackImpersonatingAcct(toAcct, async (acct) => {
        await weth9Contract.connect(acct).approve(uniswapSwapRouterContract.address, qtyInWETH);
        await uniswapSwapRouterContract.connect(acct).exactInputSingle(params);
    })

    if (hre.hardhatArguments.verbose) {
        console.log(`[${toAddr}] balance of ETH is [${hre.ethers.utils.formatEther(await hre.ethers.provider.getBalance(toAddr))}]`);
        console.log(`[${toAddr}] balance of WETH is [${hre.ethers.utils.formatEther(await weth9Contract.balanceOf(toAddr))}]`)
        console.log(`[${toAddr}] balance of DAI is [${hre.ethers.utils.formatEther(await daiContract.balanceOf(toAddr))}]`)
    }
}

module.exports.WETH9_ADDRESS = WETH9_ADDRESS;
module.exports.DAI_ADDRESS = DAI_ADDRESS;
module.exports.USDC_ADDRESS = USDC_ADDRESS;
module.exports.ADAI_ADDRESS = ADAI_ADDRESS;
module.exports.UNISWAP_WETH_DAI_POOL_ADDRESS = UNISWAP_WETH_DAI_POOL_ADDRESS;
module.exports.UNISWAP_WETH_USDC_POOL_ADDRESS = UNISWAP_WETH_USDC_POOL_ADDRESS;
module.exports.UNISWAP_POOL_BASE_FEE = UNISWAP_POOL_BASE_FEE;
module.exports.CHAINLINK_ETH_USD_AGGREGATOR_ADDRESS = CHAINLINK_ETH_USD_AGGREGATOR_ADDRESS;
module.exports.CHAINLINK_TOTAL_MARKETCAP_USD_AGGREGATOR_ADDRESS = CHAINLINK_TOTAL_MARKETCAP_USD_AGGREGATOR_ADDRESS;
module.exports.UNISWAP_FACTORY_ADDRESS = UNISWAP_FACTORY_ADDRESS

module.exports.CHAINLINK_PRICE_CONSUMER_ENUM = CHAINLINK_PRICE_CONSUMER_ENUM;
module.exports.UNISWAP_PRICE_CONSUMER_ENUM = UNISWAP_PRICE_CONSUMER_ENUM;

module.exports.getDAIContract = getDAIContract;
module.exports.getWETH9Contract = getWETH9Contract;
module.exports.getUSDCContract = getUSDCContract;
module.exports.getADAIContract = getADAIContract;
module.exports.transferETH = transferETH;
module.exports.runCallbackImpersonatingAcct = runCallbackImpersonatingAcct;
module.exports.sendTokensToAddress = sendTokensToAddress;
