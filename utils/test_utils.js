// SPDX-License-Identifier: agpl-3.0

const hre = require("hardhat");
const SwapRouterABI = require("@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json").abi;
const WETH9ABI = require("@uniswap/v3-periphery/artifacts/contracts/interfaces/external/IWETH9.sol/IWETH9.json").abi;
const IERC20ABI = require("@uniswap/v3-core/artifacts/contracts/interfaces/IERC20Minimal.sol/IERC20Minimal.json").abi;
const IUniswapV3FactoryABI = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Factory.sol/IUniswapV3Factory.json").abi;
const IUniswapV3PoolABI = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json").abi;

const {consts, TOKEN_DECIMALS} = require("./consts");
const {Contract, BigNumber} = require("ethers");
const {Address} = require("hardhat-deploy/dist/types");

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

async function getERC20Contract(contractAddr) {
    return await hre.ethers.getContractAt(IERC20ABI, contractAddr);
}

/**
 * Hardhat provides a default set of accounts that hold 10000 ETH each (https://hardhat.org/hardhat-network/reference/#initial-state).
 * You can use those accounts, and their signer, to send ETH to other accounts, such as contracts.
 * @param fromAccount: The signer and its address from which you want to send ETH from
 * @param toAddr: The address to receive TUFF tokens
 * @param amount: Amount of ETH to transfer Defaults to 100
 * @returns {Promise<void>}
 */
async function transferETH(fromAccount, toAddr, amount = "100") {
    if (hre.hardhatArguments.verbose) {
        console.log(`[${fromAccount.address}] has [${hre.ethers.utils.formatEther(
            await hre.ethers.provider.getBalance(fromAccount.address))}] ETH`);
        console.log(`[${toAddr}] has [${hre.ethers.utils.formatEther(
            await hre.ethers.provider.getBalance(toAddr))}] ETH`);
    }

    const transactionHash = await fromAccount.sendTransaction({
        to: toAddr,
        value: hre.ethers.utils.parseEther(amount),
    });

    if (hre.hardhatArguments.verbose) {
        console.log(`[${fromAccount.address}] has [${hre.ethers.utils.formatEther(
            await hre.ethers.provider.getBalance(fromAccount.address))}] ETH`);
        console.log(`[${toAddr}] has [${hre.ethers.utils.formatEther(
            await hre.ethers.provider.getBalance(toAddr))}] ETH`);
    }
}

/**
 * Upon deployment of TuffToken, the `contractOwner` account is supplied with all TUFF tokens. Thus, we use this
 * account to transfer tokens to the desired address
 * @param toAddr: The address to receive TUFF tokens
 * @param amount: Amount of TUFF tokens to transfer. Defaults to 10000
 * @returns {Promise<void>}
 */
async function transferTUFF(toAddr, amount = "10000") {
    const {deployments, getNamedAccounts} = hre;

    const {contractOwner} = await getNamedAccounts();
    const TuffTokenDiamond = await deployments.get("TuffTokenDiamond");
    const tuffTokenDiamond = await hre.ethers.getContractAt(
        TuffTokenDiamond.abi, TuffTokenDiamond.address, contractOwner);

    if (hre.hardhatArguments.verbose) {
        console.log(`[${contractOwner}] has [${hre.ethers.utils.formatEther(
            await tuffTokenDiamond.balanceOf(contractOwner))}] TUFF`);
        console.log(`[${toAddr}] has [${hre.ethers.utils.formatEther(
            await tuffTokenDiamond.balanceOf(toAddr))}] TUFF`);
    }

    const tuffAmt = hre.ethers.utils.parseUnits(amount, TOKEN_DECIMALS);
    await tuffTokenDiamond.transfer(toAddr, tuffAmt, {from: contractOwner});

    if (hre.hardhatArguments.verbose) {
        console.log(`[${contractOwner}] has [${hre.ethers.utils.formatEther(
            await tuffTokenDiamond.balanceOf(contractOwner))}] TUFF`);
        console.log(`[${toAddr}] has [${hre.ethers.utils.formatEther(
            await tuffTokenDiamond.balanceOf(toAddr))}] TUFF`);
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

async function swapEthForWeth(toAcct, qtyInWETH) {
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
        // await weth9Contract.connect(acct).approve(uniswapSwapRouterContract.address, qtyInWETH);
    });

    return {weth9Contract, uniswapSwapRouterContract};
}

async function swapTokens(toAcct, tokenIn, tokenOut, qtyOut) {
    const expiryDate = Math.floor(Date.now() / 1000) + 60 * 20; //20 minutes from the current Unix time

    const uniswapSwapRouterContract = await hre.ethers.getContractAt(
        SwapRouterABI,
        consts("UNISWAP_V3_ROUTER_ADDR")
    );

    await uniswapExactOutputSingle(tokenIn, tokenOut, uniswapSwapRouterContract, toAcct, expiryDate, qtyOut);
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

    //Swap ETH for WETH
    const {weth9Contract, uniswapSwapRouterContract} = await swapEthForWeth(toAcct, qtyInWETH);

    //If test specifies DAI amount, then give exact DAI amount, otherwise default to half of the WETH
    const daiContract = await getDAIContract();
    if (daiAmount) {
        const outDAIQty = hre.ethers.utils.parseEther(daiAmount);
        await uniswapExactOutputSingle(consts("WETH9_ADDR"), consts("DAI_ADDR"), uniswapSwapRouterContract, toAcct, expiryDate, outDAIQty);
    } else {
        const inWETHQty = qtyInWETH.div(2);
        await uniswapExactInputSingle(consts("WETH9_ADDR"), consts("DAI_ADDR"), uniswapSwapRouterContract, toAcct, expiryDate, inWETHQty);
    }

    if (hre.hardhatArguments.verbose) {
        console.log(`[${toAddr}] balance of ETH is [${hre.ethers.utils.formatEther(await hre.ethers.provider.getBalance(toAddr))}]`);
        console.log(`[${toAddr}] balance of WETH is [${hre.ethers.utils.formatEther(await weth9Contract.balanceOf(toAddr))}]`);
        console.log(`[${toAddr}] balance of DAI is [${hre.ethers.utils.formatEther(await daiContract.balanceOf(toAddr))}]`);
    }
}

async function uniswapExactOutputSingle(tokenInAddr, tokenOutAddr, uniswapSwapRouterContract, toAcct, expiryDate, outAmt) {
    const params = {
        tokenIn: tokenInAddr,
        tokenOut: tokenOutAddr,
        fee: 3000,
        recipient: toAcct.address,
        deadline: expiryDate,
        sqrtPriceLimitX96: 0,
        amountOut: outAmt,
        amountInMaximum: hre.ethers.constants.MaxUint256,
    };

    await uniswapSwapRouterContract.connect(toAcct).exactOutputSingle(params);
}

async function uniswapExactInputSingle(tokenInAddr, tokenOutAddr, uniswapSwapRouterContract, toAcct, expiryDate, inWETHQty) {
    const params = {
        tokenIn: tokenInAddr,
        tokenOut: tokenOutAddr,
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

function getSqrtPriceX96(price) {
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
    const tick1 = observations[0][0];
    const tick2 = observations[0][1];
    const avgTick = (tick2 - tick1) / period;
    return Math.pow(1.0001, avgTick);
}

const wrapTuffToGov = async (tuffToken, tuffGovToken, amount) => {
    await tuffToken.approve(tuffGovToken.address, amount);
    await tuffGovToken.deposit(amount)
}

const unwrapGovToTuff = async (tuffGovToken, amount) => {
    await tuffGovToken.withdraw(amount)
}

async function printAcctBal(tuffTokenDiamond, acctAddr) {
    const ethBal = BigNumber.from(await hre.ethers.provider.getBalance(acctAddr));
    console.log(`[${acctAddr}] has [${hre.ethers.utils.formatEther(ethBal)}] ETH`);

    const wethBal = BigNumber.from(await (await getWETH9Contract()).balanceOf(acctAddr));
    console.log(`[${acctAddr}] has [${hre.ethers.utils.formatEther(wethBal)}] WETH`);

    const tuffBal = BigNumber.from(await tuffTokenDiamond.balanceOf(acctAddr));
    console.log(`[${acctAddr}] has [${tuffBal.toString()}] TUFF`);

    return {ethBal, wethBal, tuffBal};
}

module.exports = {
    getDAIContract,
    getWETH9Contract,
    getUSDCContract,
    getADAIContract,
    getERC20Contract,
    transferETH,
    transferTUFF,
    swapEthForWeth,
    swapTokens,
    runCallbackImpersonatingAcct,
    sendTokensToAddr,
    getSqrtPriceX96,
    getUniswapPoolContract,
    getUniswapPriceQuote,
    wrapTuffToGov,
    unwrapGovToTuff,
    printAcctBal
}
