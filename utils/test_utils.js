// SPDX-License-Identifier: agpl-3.0

const hre = require("hardhat");
const SwapRouterABI = require("@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json").abi;
const WETH9ABI = require("@uniswap/v3-periphery/artifacts/contracts/interfaces/external/IWETH9.sol/IWETH9.json").abi;
const IERC20ABI = require("@uniswap/v3-core/artifacts/contracts/interfaces/IERC20Minimal.sol/IERC20Minimal.json").abi;

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
        console.log(`[${fromAccount.address}] has [${hre.ethers.utils.formatEther(await hre.ethers.provider.getBalance(fromAccount.address))}] ETH`);
        console.log(`[${toAddr}] has [${hre.ethers.utils.formatEther(await hre.ethers.provider.getBalance(toAddr))}] ETH`);
    }
    const transactionHash = await fromAccount.sendTransaction({
        to: toAddr,
        value: hre.ethers.utils.parseEther(amount),
    });
    if (hre.hardhatArguments.verbose) {
        console.log(`[${fromAccount.address}] has [${hre.ethers.utils.formatEther(await hre.ethers.provider.getBalance(fromAccount.address))}] ETH`);
        console.log(`[${toAddr}] has [${hre.ethers.utils.formatEther(await hre.ethers.provider.getBalance(toAddr))}] ETH`);
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
        .then(async () => {
            await hre.network.provider.request({
                method: "hardhat_stopImpersonatingAccount",
                params: [acct.address],
            });
        })
        .catch(async (err) => {
            await hre.network.provider.request({
                method: "hardhat_stopImpersonatingAccount",
                params: [acct.address],
            });

            console.error(err);
            throw err;
        });
}

/**
 * General method to procure ETH, WETH, and DAI to a specific address
 * @param fromAcct:
 * @param toAddr
 * @param daiAmount
 * @returns {Promise<void>}
 */
async function sendTokensToAddr(fromAcct, toAddr, daiAmount="") {
    //Set up accounts and variables
    const toAcct = await hre.ethers.getSigner(toAddr);
    await transferETH(fromAcct, toAddr);
    const expiryDate = Math.floor(Date.now() / 1000) + 60 * 20; //20 minutes from the current Unix time
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
        await weth9Contract.connect(acct).approve(acct.address, qtyInWETH);
        await weth9Contract.connect(acct).deposit({"value": qtyInWETH});

        //Approve uniswap to transfer all WETH, if needed
        await weth9Contract.connect(acct).approve(uniswapSwapRouterContract.address, qtyInWETH);
    });

    //If test specifies DAI amount, then give exact DAI amount, otherwise default to half of the WETH
    if (daiAmount) {
        const outDAIQty = hre.ethers.utils.parseEther(daiAmount);
        await uniswapExactOutputSingle(weth9Contract, uniswapSwapRouterContract, toAcct, expiryDate, outDAIQty);
    } else {
        const inWETHQty = qtyInWETH.div(2);
        await uniswapExactInputSingle(weth9Contract, uniswapSwapRouterContract, toAcct, expiryDate, inWETHQty);
    }

    if (hre.hardhatArguments.verbose) {
        console.log(`[${toAddr}] balance of ETH is [${hre.ethers.utils.formatEther(await hre.ethers.provider.getBalance(toAddr))}]`);
        console.log(`[${toAddr}] balance of WETH is [${hre.ethers.utils.formatEther(await weth9Contract.balanceOf(toAddr))}]`);
        console.log(`[${toAddr}] balance of DAI is [${hre.ethers.utils.formatEther(await daiContract.balanceOf(toAddr))}]`);
    }
}

async function uniswapExactOutputSingle(weth9Contract, uniswapSwapRouterContract, toAcct, expiryDate, outDAIQty) {
    const params = {
        tokenIn: consts("WETH9_ADDR"),
        tokenOut: consts("DAI_ADDR"),
        fee: 3000,
        recipient: toAcct.address,
        deadline: expiryDate,
        sqrtPriceLimitX96: 0,
        amountOut: outDAIQty,
        amountInMaximum: hre.ethers.constants.MaxUint256,
    };
    await runCallbackImpersonatingAcct(toAcct, async (acct) => {
        await uniswapSwapRouterContract.connect(acct).exactOutputSingle(params);
    });
}

async function uniswapExactInputSingle(weth9Contract, uniswapSwapRouterContract, toAcct, expiryDate, inWETHQty) {
    const params = {
        tokenIn: consts("WETH9_ADDR"),
        tokenOut: consts("DAI_ADDR"),
        fee: 3000,
        recipient: toAcct.address,
        deadline: expiryDate,
        sqrtPriceLimitX96: 0,
        amountIn: inWETHQty,
        amountOutMinimum: 0,
    };
    await runCallbackImpersonatingAcct(toAcct, async (acct) => {
        await uniswapSwapRouterContract.connect(acct).exactInputSingle(params);
    });
}

module.exports = {
    getDAIContract,
    getWETH9Contract,
    getUSDCContract,
    getADAIContract,
    transferETH,
    runCallbackImpersonatingAcct,
    sendTokensToAddr
}
