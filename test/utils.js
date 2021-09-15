// SPDX-License-Identifier: agpl-3.0

const {BigNumber} = require("ethers");
const hre = require("hardhat");

const { Pool } = require("@uniswap/v3-sdk");
const { Token } = require("@uniswap/sdk-core");
const ISwapRouterABI = require("@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json").abi;
const SwapRouterABI = require("@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json").abi;

// const UNISWAP_V2_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const UNISWAP_V3_ROUTER_ADDRESS = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
const WETH9_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const DAI_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

module.exports = async function setUpAccountFunds(owner, treasuryAddress) {
    // const accountBalanceInGwei = BigNumber.from(String(Math.pow(10, 9)));
    // await hre.network.provider.send("hardhat_setBalance", [
    //     address,
    //     accountBalanceInGwei.toHexString(),
    // ]);

    const transactionHash = await owner.sendTransaction({
        to: treasuryAddress,
        value: hre.ethers.utils.parseEther("100.0"),
    });

    // const tokenAddress = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"
    // const uni = await Fetcher.fetchTokenData(chainId, tokenAddress)
    // const weth = WETH[chainId]
    // const pair = await Fetcher.fetchPairData(uni, weth)
    // const route = new Route([pair], weth)
    // const trade = new Trade(route, new TokenAmount(weth, '100000000000000000'), TradeType.EXACT_INPUT)
    //
    // console.log('1 WETH for', route.midPrice.toSignificant(6), ' UNI')
    // console.log('1 UNI for', route.midPrice.invert().toSignificant(6), ' WETH')
    // console.log('Trade price 1 WETH for ', trade.executionPrice.toSignificant(6), ' UNI')
    //
    // const accounts =  await web3.eth.getAccounts()
    // const account = accounts[0]
    // const slippageTolerance = new Percent('20', '100')
    // const path = [weth.address, uni.address ]
    // const to = account
    // const uniswap = await new web3.eth.Contract(abi, "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D")

    const expiryDate = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time

    // const poolAddress = "0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8";
    // const poolContract = new ethers.Contract(
    //     poolAddress,
    //     abi,
    //     ethers.provider
    // );

    // const signer = ethers.provider.getSigner()
    // console.log(signer);
    // console.log(await signer.getAddress());

    const uniswapSwapRouterContract = await hre.ethers.getContractAt(
        SwapRouterABI,
        UNISWAP_V3_ROUTER_ADDRESS,
        owner
    );

    const params = {
        tokenIn: WETH9_ADDRESS,
        tokenOut: DAI_ADDRESS,
        fee: 3000,
        recipient: treasuryAddress,
        deadline: expiryDate,
        // amountIn: "50.0",
        amountIn: BigNumber.from(50).toHexString() ,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0,
    };
    const tx_builder = await uniswapSwapRouterContract.exactInputSingle(params);
    console.log(tx_builder)
    const encoded_tx = tx_builder.encodeABI();

    const swapTxHash = await owner.sendTransaction({
        gas: 238989, // gas fee needs updating?
        data: encoded_tx,
        from: treasuryAddress,
        to: UNISWAP_V3_ROUTER_ADDRESS
    });

    // const trace = await hre.network.provider.send("eth_sendTransaction", [
    //     "0x123...",
    //     ...txOptions
    // ]);



    // const _uniswapV2Router = IUniswapV2Router02(UNISWAP_ROUTER_ADDRESS);
    // uniswapV2Pair = IUniswapV2Factory(_uniswapV2Router.factory()).createPair(address(this), _uniswapV2Router.WETH());
}