// SPDX-License-Identifier: agpl-3.0

const hre = require("hardhat");
const SwapRouterABI = require("@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json").abi;
const WETH9ABI = require("@uniswap/v3-periphery/artifacts/contracts/interfaces/external/IWETH9.sol/IWETH9.json").abi;
const IERC20ABI = require("@openzeppelin/contracts/build/contracts/ERC20.json").abi;
const AaveProtocolDataProviderABI = require("@aave/protocol-v2/artifacts/contracts/misc/AaveProtocolDataProvider.sol/AaveProtocolDataProvider.json").abi;
const IUniswapV3FactoryABI = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Factory.sol/IUniswapV3Factory.json").abi;
const IUniswapV3PoolABI = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json").abi;

const {consts, TOKEN_DECIMALS, TOKEN_SYMBOL} = require("./consts");
const {BigNumber} = require("ethers");
const {expect} = require("chai");
const {BN} = require("@openzeppelin/test-helpers");


async function getWETH9Contract() {
    return await hre.ethers.getContractAt(WETH9ABI, consts("WETH9_ADDR"));
}

async function getDAIContract() {
    return await hre.ethers.getContractAt(IERC20ABI, consts("DAI_ADDR"));
}

async function getUSDCContract() {
    return await hre.ethers.getContractAt(IERC20ABI, consts("USDC_ADDR"));
}

async function getUSDTContract() {
    return await hre.ethers.getContractAt(IERC20ABI, consts("USDT_ADDR"));
}

async function getADAIContract() {
    return await hre.ethers.getContractAt(IERC20ABI, consts("ADAI_ADDR"));
}

async function getATokenContract(erc20TokenAddr) {
    const aaveProtocolDataProvider = await hre.ethers.getContractAt(AaveProtocolDataProviderABI, consts("AAVE_PROTOCOL_DATA_PROVIDER_ADDR"));
    const result = await aaveProtocolDataProvider.getReserveTokensAddresses(erc20TokenAddr);
    return await hre.ethers.getContractAt(IERC20ABI, result.aTokenAddress);
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
 * Upon deployment of TuffVBT, the `contractOwner` account is supplied with all TUFF tokens. Thus, we use this
 * account to transfer tokens to the desired address
 * @param toAddr: The address to receive TUFF tokens
 * @param amount: Amount of TUFF tokens to transfer. Defaults to 10000
 * @returns {Promise<void>}
 */
async function transferTuffDUU(toAddr, amount = "10000") {
    const {deployments, getNamedAccounts} = hre;

    const {contractOwner} = await getNamedAccounts();
    const tuffDUUDeployment = await deployments.get(TOKEN_SYMBOL);
    const tuffDUU = await hre.ethers.getContractAt(
        tuffDUUDeployment.abi, tuffDUUDeployment.address, contractOwner);

    if (hre.hardhatArguments.verbose) {
        console.log(`[${contractOwner}] has [${hre.ethers.utils.formatEther(
            await tuffDUU.balanceOf(contractOwner))}] ${TOKEN_SYMBOL}`);
        console.log(`[${toAddr}] has [${hre.ethers.utils.formatEther(
            await tuffDUU.balanceOf(toAddr))}] ${TOKEN_SYMBOL}`);
    }

    const tuffAmt = hre.ethers.utils.parseUnits(amount, TOKEN_DECIMALS);
    await tuffDUU.transfer(toAddr, tuffAmt, {from: contractOwner});

    if (hre.hardhatArguments.verbose) {
        console.log(`[${contractOwner}] has [${hre.ethers.utils.formatEther(
            await tuffDUU.balanceOf(contractOwner))}] ${TOKEN_SYMBOL}`);
        console.log(`[${toAddr}] has [${hre.ethers.utils.formatEther(
            await tuffDUU.balanceOf(toAddr))}] ${TOKEN_SYMBOL}`);
    }

    return tuffAmt;
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
 * @returns {Promise<void>}
 */
async function sendTokensToAddr(fromAcct, toAddr) {
    //Set up accounts and variables
    const toAcct = await hre.ethers.getSigner(toAddr);
    await transferETH(fromAcct, toAddr);
    const expiryDate = Math.floor(Date.now() / 1000) + 60 * 20; //20 minutes from the current Unix time
    const qtyInWETH = hre.ethers.utils.parseEther("40");

    //Swap ETH for WETH
    const weth9Contract = await getWETH9Contract()
    await runCallbackImpersonatingAcct(toAcct, async (acct) => {
        await weth9Contract.connect(acct).approve(consts("UNISWAP_V3_ROUTER_ADDR"), qtyInWETH);
    });
    const {uniswapSwapRouterContract} = await swapEthForWeth(toAcct, qtyInWETH);

    //Split WETH up between DAU, USDC, and USDT
    const inWETHQty = qtyInWETH.div(4);
    await uniswapExactInputSingle(consts("WETH9_ADDR"), consts("DAI_ADDR"), uniswapSwapRouterContract, toAcct, expiryDate, inWETHQty);
    await uniswapExactInputSingle(consts("WETH9_ADDR"), consts("USDC_ADDR"), uniswapSwapRouterContract, toAcct, expiryDate, inWETHQty);
    await uniswapExactInputSingle(consts("WETH9_ADDR"), consts("USDT_ADDR"), uniswapSwapRouterContract, toAcct, expiryDate, inWETHQty);

    if (hre.hardhatArguments.verbose) {
        const daiContract = await getDAIContract();
        const usdcContract = await getUSDCContract();
        const usdtContract = await getUSDTContract();

        console.log(`[${toAddr}] balance of ETH is [${hre.ethers.utils.formatEther(await hre.ethers.provider.getBalance(toAddr))}]`);
        console.log(`[${toAddr}] balance of WETH is [${hre.ethers.utils.formatEther(await weth9Contract.balanceOf(toAddr))}]`);
        console.log(`[${toAddr}] balance of DAI is [${hre.ethers.utils.formatEther(await daiContract.balanceOf(toAddr))}]`);
        console.log(`[${toAddr}] balance of USDC is [${hre.ethers.utils.formatEther(await usdcContract.balanceOf(toAddr))}]`);
        console.log(`[${toAddr}] balance of USDT is [${hre.ethers.utils.formatEther(await usdtContract.balanceOf(toAddr))}]`);
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
async function getUniswapPriceQuote(tokenA, tokenB, poolFee, period, inverse=true) {
    const poolContract = await getUniswapPoolContract(tokenA, tokenB, poolFee);
    const observations = await poolContract.observe([period, 0]);
    const tick1 = observations[0][0];
    const tick2 = observations[0][1];
    const avgTick = (tick2 - tick1) / period;
    const quote = Math.pow(1.0001, avgTick);

    const tokenADecimals = await (await getERC20Contract(tokenA)).decimals();
    const tokenBDecimals = await (await getERC20Contract(tokenB)).decimals();
    const decimalDiff = Math.abs(tokenADecimals - tokenBDecimals);
    const decimalFactor = Math.pow(10, decimalDiff);

    //Return normalized quote
    return inverse ? 1 / (quote * decimalFactor) : quote * decimalFactor;
}

async function printAcctBal(tuffVBTDiamond, acctAddr) {
    const ethBal = BigNumber.from(await hre.ethers.provider.getBalance(acctAddr));
    console.log(`[${acctAddr}] has [${hre.ethers.utils.formatEther(ethBal)}] ETH`);

    const wethBal = BigNumber.from(await (await getWETH9Contract()).balanceOf(acctAddr));
    console.log(`[${acctAddr}] has [${hre.ethers.utils.formatEther(wethBal)}] WETH`);

    const tuffBal = BigNumber.from(await tuffVBTDiamond.balanceOf(acctAddr));
    console.log(`[${acctAddr}] has [${tuffBal.toString()}] ${TOKEN_SYMBOL}`);

    return {ethBal, wethBal, tuffBal};
}

async function assertDepositERC20ToAave(tuffVBTDiamond, erc20TokenAddr, tokenQtyToDeposit="2000", isEtherFormat=false) {
    let erc20Qty;
    if (isEtherFormat) {
        erc20Qty = tokenQtyToDeposit;
    } else {
        erc20Qty = hre.ethers.utils.parseEther(tokenQtyToDeposit);
    }

    //Check that the account has enough ERC20
    const erc20Contract = await getERC20Contract(erc20TokenAddr);
    const startERC20Qty = await erc20Contract.balanceOf(tuffVBTDiamond.address);
    expect(new BN(startERC20Qty.toString())).to.be.bignumber.greaterThan(new BN(erc20Qty.toString()));

    //Check that the account has no aToken
    const aTokenContract = await getATokenContract(erc20TokenAddr);
    const startATokenQty = await aTokenContract.balanceOf(tuffVBTDiamond.address);
    expect(new BN(0)).to.be.bignumber.equal(new BN(startATokenQty.toString()));

    //Make the call to deposit Aave
    await tuffVBTDiamond.depositToAave(erc20TokenAddr, erc20Qty);

    //Check that the account has deposited the erc20Token
    const tokenQtyAfterDeposit = await erc20Contract.balanceOf(tuffVBTDiamond.address);
    expect(new BN(tokenQtyAfterDeposit.toString())).to.be.bignumber.equal(new BN(startERC20Qty.sub(erc20Qty).toString()),
        "unexpected token balance after deposit");

    //Check that the account now has aToken equal to the erc20Token we deposited
    const aTokenQtyAfterDeposit = await aTokenContract.balanceOf(tuffVBTDiamond.address);
    expect(new BN(erc20Qty.toString())).to.be.bignumber.equal(new BN(aTokenQtyAfterDeposit.toString()),
        "unexpected aToken balance after deposit of token");
    return {startERC20Qty};
}

module.exports = {
    getWETH9Contract,
    getDAIContract,
    getUSDCContract,
    getUSDTContract,
    getADAIContract,
    getATokenContract,
    getERC20Contract,
    transferETH,
    transferTuffDUU,
    swapEthForWeth,
    swapTokens,
    runCallbackImpersonatingAcct,
    sendTokensToAddr,
    getSqrtPriceX96,
    getUniswapPoolContract,
    getUniswapPriceQuote,
    printAcctBal,
    assertDepositERC20ToAave
}
