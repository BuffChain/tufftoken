// // SPDX-License-Identifier: agpl-3.0
//
// const hre = require("hardhat");
// const WETH9ABI = require("@uniswap/v3-periphery/artifacts/contracts/interfaces/external/IWETH9.sol/IWETH9.json").abi;
// const IERC721EnumerableABI = require("@openzeppelin/contracts/build/contracts/ERC721Enumerable.json").abi;
// const IERC20ABI = require("@uniswap/v3-core/artifacts/contracts/interfaces/IERC20Minimal.sol/IERC20Minimal.json").abi;
// const IUniswapV3FactoryABI = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Factory.sol/IUniswapV3Factory.json").abi;
// const IUniswapV3PoolABI = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json").abi;
//
// const {consts} = require("./consts");
//
// async function getDAIContract() {
//     return await hre.ethers.getContractAt(IERC20ABI, consts("DAI_ADDR"));
// }
//
// async function getWETH9Contract() {
//     return await hre.ethers.getContractAt(WETH9ABI, consts("WETH9_ADDR"));
// }
//
// async function getUSDCContract() {
//     return await hre.ethers.getContractAt(IERC20ABI, consts("USDC_ADDR"));
// }
//
// async function getADAIContract() {
//     return await hre.ethers.getContractAt(IERC20ABI, consts("ADAI_ADDR"));
// }
//
// async function getERC20Contract(contractAddr) {
//     return await hre.ethers.getContractAt(IERC20ABI, contractAddr);
// }
//
// async function getERC721EnumerableContract(contractAddr) {
//     return await hre.ethers.getContractAt(IERC721EnumerableABI, contractAddr);
// }
//
// /**
//  * Hardhat provides a default set of accounts that hold 10000 ETH each (https://hardhat.org/hardhat-network/reference/#initial-state).
//  * You can use those accounts, and their signer, to send ETH to other accounts, such as contracts.
//  * @param fromAccount: The signer and its address from which you want to send ETH from
//  * @param toAddr: The address to receive TUFF tokens
//  * @param amount: Amount of ETH to transfer Defaults to 100
//  * @returns {Promise<void>}
//  */
// async function transferETH(fromAccount, toAddr, amount = "100") {
//     if (hre.hardhatArguments.verbose) {
//         console.log(`[${fromAccount.address}] has [${hre.ethers.utils.formatEther(
//             await hre.ethers.provider.getBalance(fromAccount.address))}] ETH`);
//         console.log(`[${toAddr}] has [${hre.ethers.utils.formatEther(
//             await hre.ethers.provider.getBalance(toAddr))}] ETH`);
//     }
//
//     const transactionHash = await fromAccount.sendTransaction({
//         to: toAddr,
//         value: hre.ethers.utils.parseEther(amount),
//     });
//
//     if (hre.hardhatArguments.verbose) {
//         console.log(`[${fromAccount.address}] has [${hre.ethers.utils.formatEther(
//             await hre.ethers.provider.getBalance(fromAccount.address))}] ETH`);
//         console.log(`[${toAddr}] has [${hre.ethers.utils.formatEther(
//             await hre.ethers.provider.getBalance(toAddr))}] ETH`);
//     }
// }
//
// /**
//  * Upon deployment of TuffToken, the `contractOwner` account is supplied with all TUFF tokens. Thus, we use this
//  * account to transfer tokens to the desired address
//  * @param toAddr: The address to receive TUFF tokens
//  * @param amount: Amount of TUFF tokens to transfer. Defaults to 10000
//  * @returns {Promise<void>}
//  */
// async function transferTUFF(toAddr, amount = "10000") {
//     const {deployments, getNamedAccounts} = hre;
//
//     const {contractOwner} = await getNamedAccounts();
//     const TuffTokenDiamond = await deployments.get("TuffTokenDiamond");
//     const tuffTokenDiamond = await hre.ethers.getContractAt(
//         TuffTokenDiamond.abi, TuffTokenDiamond.address, contractOwner);
//
//     if (hre.hardhatArguments.verbose) {
//         console.log(`[${contractOwner}] has [${hre.ethers.utils.formatEther(
//             await tuffTokenDiamond.balanceOf(contractOwner))}] TUFF`);
//         console.log(`[${toAddr}] has [${hre.ethers.utils.formatEther(
//             await tuffTokenDiamond.balanceOf(toAddr))}] TUFF`);
//     }
//
//     await tuffTokenDiamond.transfer(toAddr, amount, {from: contractOwner});
//
//     if (hre.hardhatArguments.verbose) {
//         console.log(`[${contractOwner}] has [${hre.ethers.utils.formatEther(
//             await tuffTokenDiamond.balanceOf(contractOwner))}] TUFF`);
//         console.log(`[${toAddr}] has [${hre.ethers.utils.formatEther(
//             await tuffTokenDiamond.balanceOf(toAddr))}] TUFF`);
//     }
// }
//
// function getSqrtPriceX96(price) {
//     // sqrtRatioX96 price per uniswap v3 https://docs.uniswap.org/sdk/guides/fetching-prices#understanding-sqrtprice
//     return BigInt(Math.sqrt(price) * 2 ** 96).toString();
// }
//
// async function getUniswapPoolContract(tokenA, tokenB, poolFee) {
//     const uniswapV3Factory = await hre.ethers.getContractAt(IUniswapV3FactoryABI, consts("UNISWAP_V3_FACTORY_ADDR"));
//     const poolAddress = await uniswapV3Factory.getPool(tokenA, tokenB, poolFee);
//     return await hre.ethers.getContractAt(IUniswapV3PoolABI, poolAddress);
// }
//
// // https://docs.uniswap.org/protocol/concepts/V3-overview/oracle#tick-accumulator
// async function getUniswapPriceQuote(tokenA, tokenB, poolFee, period) {
//     const poolContract = await getUniswapPoolContract(tokenA, tokenB, poolFee);
//     const observations = await poolContract.observe([period, 0]);
//     const tick1 = observations[0][0];
//     const tick2 = observations[0][1];
//     const avgTick = (tick2 - tick1) / period;
//     return Math.pow(1.0001, avgTick);
// }
//
// const wrapTuffToGov = async (tuffToken, tuffGovToken, amount) => {
//     await tuffToken.approve(tuffGovToken.address, amount);
//     await tuffGovToken.deposit(amount);
// }
//
// const unwrapGovToTuff = async (tuffGovToken, amount) => {
//     await tuffGovToken.withdraw(amount);
// }
//
// module.exports = {
//     getDAIContract,
//     getWETH9Contract,
//     getUSDCContract,
//     getADAIContract,
//     getERC20Contract,
//     getERC721EnumerableContract,
//     transferETH,
//     transferTUFF,
//     getSqrtPriceX96,
//     getUniswapPoolContract,
//     getUniswapPriceQuote,
//     wrapTuffToGov,
//     unwrapGovToTuff
// }
