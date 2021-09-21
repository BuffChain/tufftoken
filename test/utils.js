// SPDX-License-Identifier: agpl-3.0

const {BigNumber} = require("ethers");
const hre = require("hardhat");

const { Pool } = require("@uniswap/v3-sdk");
const { Token } = require("@uniswap/sdk-core");
const ethers = require("ethers");
const SwapRouterABI = require("@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json").abi;
const WETH9ABI = require("@uniswap/v3-periphery/artifacts/contracts/interfaces/external/IWETH9.sol/IWETH9.json").abi;
const IERC20ABI = require("@uniswap/v3-core/artifacts/contracts/interfaces/IERC20Minimal.sol/IERC20Minimal.json").abi;

// const UNISWAP_V2_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const UNISWAP_V3_ROUTER_ADDRESS = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
const WETH9_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const DAI_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

async function getDAIContract() {
    return await hre.ethers.getContractAt(
        IERC20ABI,
        DAI_ADDRESS
    );
}

async function getWETH9Contract() {
    return await hre.ethers.getContractAt(
        IERC20ABI,
        WETH9_ADDRESS
    );
}

async function getUSDCContract() {
    return await hre.ethers.getContractAt(
        IERC20ABI,
        USDC_ADDRESS
    );
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
        console.log(`fromAddr has [${await hre.ethers.provider.getBalance(fromAccount.address)}] wei`);
        console.log(`toAddr has [${await hre.ethers.provider.getBalance(toAddr)}] wei`);
    }
    const transactionHash = await fromAccount.sendTransaction({
        to: toAddr,
        value: hre.ethers.utils.parseEther(amount),
    });
    if (hre.hardhatArguments.verbose) {
        console.log(`fromAddr has [${await hre.ethers.provider.getBalance(fromAccount.address)}] wei`);
        console.log(`toAddr has [${await hre.ethers.provider.getBalance(toAddr)}] wei`);
        console.log(transactionHash)
    }
}

async function setUpAccountFunds(owner, treasuryAddress) {
    await transferETH(owner, treasuryAddress)
    const expiryDate = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
    const ethToSend = BigNumber.from(5000).toHexString();

    const uniswapSwapRouterContract = await hre.ethers.getContractAt(
        SwapRouterABI,
        UNISWAP_V3_ROUTER_ADDRESS
    );

    const weth9Contract = await getWETH9Contract();
    await weth9Contract.approve(treasuryAddress, ethToSend)
    await weth9Contract.approve(owner.address, ethToSend)

    const daiContract = await getDAIContract();
    await daiContract.approve(treasuryAddress, ethToSend)
    await daiContract.approve(owner.address, ethToSend)

    if (hre.hardhatArguments.verbose) {
        console.log(`The balance of WETH is [${await weth9Contract.balanceOf(treasuryAddress)}]`)
        console.log(`The balance of WETH is [${await weth9Contract.balanceOf(owner.address)}]`)

        console.log(`The balance of DAI is [${await daiContract.balanceOf(treasuryAddress)}]`)
        console.log(`The balance of DAI is [${await daiContract.balanceOf(owner.address)}]`)
    }

    const params = {
        tokenIn: WETH9_ADDRESS,
        tokenOut: DAI_ADDRESS,
        fee: 3000,
        recipient: treasuryAddress,
        deadline: expiryDate,
        amountIn: "50.0",
        // amountIn: ethToSend,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0,
    };
    console.log(params)

    const tx_builder = await uniswapSwapRouterContract.exactInputSingle(params);
    if (hre.hardhatArguments.verbose) {
        console.log(tx_builder)

        console.log(`The balance of WETH is [${await weth9Contract.balanceOf(treasuryAddress)}]`)
        console.log(`The balance of WETH is [${await weth9Contract.balanceOf(owner.address)}]`)

        console.log(`The balance of DAI is [${await daiContract.balanceOf(treasuryAddress)}]`)
        console.log(`The balance of DAI is [${await daiContract.balanceOf(owner.address)}]`)
    }

    // const encoded_tx = tx_builder.encodeABI();
    //
    // const swapTxHash = await owner.sendTransaction({
    //     gas: 238989, // gas fee needs updating?
    //     data: encoded_tx,
    //     from: treasuryAddress,
    //     to: UNISWAP_V3_ROUTER_ADDRESS
    // });

    // const trace = await hre.network.provider.send("eth_sendTransaction", [
    //     "0x123...",
    //     ...txOptions
    // ]);



    // const _uniswapV2Router = IUniswapV2Router02(UNISWAP_ROUTER_ADDRESS);
    // uniswapV2Pair = IUniswapV2Factory(_uniswapV2Router.factory()).createPair(address(this), _uniswapV2Router.WETH());
}

module.exports.getDAIContract = getDAIContract;
module.exports.getWETH9Contract = getWETH9Contract;
module.exports.getUSDCContract = getUSDCContract;
module.exports.transferETH = transferETH;
module.exports.setUpAccountFunds = setUpAccountFunds;
