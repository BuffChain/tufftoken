// SPDX-License-Identifier: agpl-3.0
const hre = require("hardhat");
const SwapRouterABI = require("@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json").abi;
const WETH9ABI = require("@uniswap/v3-periphery/artifacts/contracts/interfaces/external/IWETH9.sol/IWETH9.json").abi;
const IERC20ABI = require("@uniswap/v3-core/artifacts/contracts/interfaces/IERC20Minimal.sol/IERC20Minimal.json").abi;
const IUniswapV3FactoryABI = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Factory.sol/IUniswapV3Factory.json").abi;
const IUniswapV3PoolABI = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json").abi;

const {consts} = require("./consts");

async function getDAIContract() {
    return await hre.ethers.getContractAt(IERC20ABI, consts("DAI_ADDR"));
}

async function getWETH9Contract() {
    return await hre.ethers.getContractAt(WETH9ABI, consts("WETH9_ADDR"));
}

async function getUSDCContract() {
    return await hre.ethers.getContractAt(IERC20ABI, consts("USDC_ADDR"));
}

async function getADAIContract() {
    return await hre.ethers.getContractAt(IERC20ABI, consts("ADAI_ADDR"));
}

/**
 * Hardhat provides a default set of accounts that hold 10000 ETH each (https://hardhat.org/hardhat-network/reference/#initial-state).
 * You can use those accounts, and their signer, to send ETH to other accounts, such as contracts.
 * @param fromAccount: The signer and its address from which you want to send ETH from
 * @param toAddr: The address from which you want to receive the ETH to
 * @param amount: Amount of ETH to transfer Defaults to 100
 * @returns {Promise<Contract>}
 */
async function transferETH(fromAccount, toAddr, amount = "100") {
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

    await callbackFn(acct);

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
async function sendTokensToAddr(fromAcct, toAddr) {
    //Set up accounts and variables
    const toAcct = await hre.ethers.getSigner(toAddr);
    await transferETH(fromAcct, toAddr);
    const expiryDate = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
    const qtyInWETH = hre.ethers.utils.parseEther("20");

    //Get smart contracts
    const daiContract = await getDAIContract();
    const weth9Contract = await getWETH9Contract();
    const uniswapSwapRouterContract = await hre.ethers.getContractAt(
        SwapRouterABI,
        consts("UNISWAP_V3_ROUTER_ADDR")
    );

    //Convert ETH to WETH
    await runCallbackImpersonatingAcct(toAcct, async (acct) => {
        await weth9Contract.connect(acct).approve(acct.address, qtyInWETH)
        await weth9Contract.connect(acct).deposit({"value": qtyInWETH})
    });

    //Swap half of the WETH to DAI with uniswap_v3
    const params = {
        tokenIn: consts("WETH9_ADDR"),
        tokenOut: consts("DAI_ADDR"),
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
    });

    if (hre.hardhatArguments.verbose) {
        console.log(`[${toAddr}] balance of ETH is [${hre.ethers.utils.formatEther(await hre.ethers.provider.getBalance(toAddr))}]`);
        console.log(`[${toAddr}] balance of WETH is [${hre.ethers.utils.formatEther(await weth9Contract.balanceOf(toAddr))}]`);
        console.log(`[${toAddr}] balance of DAI is [${hre.ethers.utils.formatEther(await daiContract.balanceOf(toAddr))}]`);
    }
}

function sqrtPriceX96(price) {
    // sqrtRatioX96 price per uniswap v3 https://docs.uniswap.org/sdk/guides/fetching-prices#understanding-sqrtprice
    return BigInt(Math.sqrt(price) * 2 ** 96).toString();
}

async function getUniswapPoolContract(tokenA, tokenB, poolFee) {
    const uniswapV3Factory = await hre.ethers.getContractAt(IUniswapV3FactoryABI, consts("UNISWAP_V3_FACTORY_ADDR"));
    const poolAddress = await uniswapV3Factory.getPool(tokenA, tokenB, poolFee);
    return await hre.ethers.getContractAt(IUniswapV3PoolABI, poolAddress);
}

// https://docs.uniswap.org/protocol/concepts/V3-overview/oracle#tick-accumulator
async function getUniswapPriceQuote(tokenA, tokenB, poolFee, period) {
    const poolContract = await getUniswapPoolContract(tokenA, tokenB, poolFee);
    const observations = await poolContract.observe([period, 0]);
    const tick1 = observations[0][0]
    const tick2 = observations[0][1]
    const avgTick = (tick2 - tick1) / period;
    return Math.pow(1.0001, avgTick)
}


module.exports = {
    getDAIContract,
    getWETH9Contract,
    getUSDCContract,
    getADAIContract,
    transferETH,
    runCallbackImpersonatingAcct,
    sendTokensToAddr,
    sqrtPriceX96,
    getUniswapPriceQuote
}
