// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.6.0;

import {Context} from "@openzeppelin/contracts-v6/utils/Context.sol";
import {LendingPool} from "@aave/protocol-v2/contracts/protocol/lendingpool/LendingPool.sol";
import {LendingPoolAddressesProvider} from "@aave/protocol-v2/contracts/protocol/configuration/LendingPoolAddressesProvider.sol";
import {AaveProtocolDataProvider} from "@aave/protocol-v2/contracts/misc/AaveProtocolDataProvider.sol";
import {IUniswapV3Factory} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import {IUniswapV3Pool} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import {IERC20} from "@openzeppelin/contracts-v6/token/ERC20/IERC20.sol";

import {AaveLPManagerLib} from "./AaveLPManagerLib.sol";

contract AaveLPManager is Context {
    modifier aaveInitLock() {
        require(
            isAaveInit(),
            string(
                abi.encodePacked(
                    AaveLPManagerLib.NAMESPACE,
                    ": ",
                    "UNINITIALIZED"
                )
            )
        );
        _;
    }

    //Basically a constructor, but the hardhat-deploy plugin does not support diamond contracts with facets that has
    // constructors. We imitate a constructor with a one-time only function. This is called immediately after deployment
    function initAaveLPManager(
        address _lendingPoolProviderAddr,
        address _protocolDataProviderAddr
    ) public {
        require(
            !isAaveInit(),
            string(
                abi.encodePacked(
                    AaveLPManagerLib.NAMESPACE,
                    ": ",
                    "ALREADY_INITIALIZED"
                )
            )
        );

        AaveLPManagerLib.StateStorage storage ss = AaveLPManagerLib.getState();

        ss.lpProviderAddr = _lendingPoolProviderAddr;
        ss.protocolDataProviderAddr = _protocolDataProviderAddr;

        ss.isInit = true;
    }

    function isAaveInit() public view returns (bool) {
        AaveLPManagerLib.StateStorage storage ss = AaveLPManagerLib.getState();
        return ss.isInit;
    }

    function getAaveLPAddr() public view aaveInitLock returns (address) {
        AaveLPManagerLib.StateStorage storage ss = AaveLPManagerLib.getState();
        return LendingPoolAddressesProvider(ss.lpProviderAddr).getLendingPool();
    }

    function getProtocolDataProviderAddr()
        public
        view
        aaveInitLock
        returns (address)
    {
        AaveLPManagerLib.StateStorage storage ss = AaveLPManagerLib.getState();
        return ss.protocolDataProviderAddr;
    }

    //TODO: Need to make sure this is locked down to only owner and approved callers (eg chainlink)
    function depositToAave(address erc20TokenAddr, uint256 amount)
        public
        aaveInitLock
    {
        (bool _isSupportedToken, ) = isAaveSupportedToken(erc20TokenAddr);
        require(
            _isSupportedToken,
            string(
                abi.encodePacked(
                    AaveLPManagerLib.NAMESPACE,
                    ": ",
                    "This token is currently not supported"
                )
            )
        );

        IERC20(erc20TokenAddr).approve(getAaveLPAddr(), amount);
        LendingPool(getAaveLPAddr()).deposit(
            erc20TokenAddr,
            amount,
            address(this),
            0
        );
    }

    function isAaveSupportedToken(address tokenAddr)
        public
        view
        aaveInitLock
        returns (bool, uint256)
    {
        AaveLPManagerLib.StateStorage storage ss = AaveLPManagerLib.getState();

        bool _isSupportedToken = false;
        uint256 _tokenIndex = ss.supportedTokens.length;
        for (uint256 i = 0; i < ss.supportedTokens.length; i++) {
            if (ss.supportedTokens[i] == tokenAddr) {
                _isSupportedToken = true;
                _tokenIndex = i;
                break;
            }
        }

        return (_isSupportedToken, _tokenIndex);
    }

    function addAaveSupportedToken(address tokenAddr, uint256 targetPercentage) public aaveInitLock {
        AaveLPManagerLib.StateStorage storage ss = AaveLPManagerLib.getState();

        (address aTokenAddr,,) = AaveProtocolDataProvider(ss.protocolDataProviderAddr).getReserveTokensAddresses(tokenAddr);
        require(aTokenAddr != address(0), "The tokenAddress provided is not supported by Aave");

        //TODO: All targetPercentages should add up to 100%

        ss.supportedTokens.push(tokenAddr);
        ss.tokenMetadata[tokenAddr].targetPercent = targetPercentage;
        ss.tokenMetadata[tokenAddr].aToken = aTokenAddr;
    }

    function removeAaveSupportedToken(address tokenAddr) public aaveInitLock {
        AaveLPManagerLib.StateStorage storage ss = AaveLPManagerLib.getState();

        (bool _isSupportedToken, uint256 _tokenIndex) = isAaveSupportedToken(
            tokenAddr
        );
        if (_isSupportedToken) {
            //Remove the token without preserving order
            ss.supportedTokens[_tokenIndex] = ss.supportedTokens[
                ss.supportedTokens.length - 1
            ];
            ss.supportedTokens.pop();
        }

        //TODO: Remove tokenMetadata as well?
    }

    function getAllAaveSupportedTokens()
        public
        view
        aaveInitLock
        returns (address[] memory)
    {
        AaveLPManagerLib.StateStorage storage ss = AaveLPManagerLib.getState();
        return ss.supportedTokens;
    }

    function setAaveTokenTargetedPercentage(
        address tokenAddr,
        uint256 targetPercentage
    ) public aaveInitLock {
        AaveLPManagerLib.StateStorage storage ss = AaveLPManagerLib.getState();
        ss.tokenMetadata[tokenAddr].targetPercent = targetPercentage;
    }

    function getAaveTokenTargetedPercentage(
        address tokenAddr
    ) public view aaveInitLock returns (uint256) {
        AaveLPManagerLib.StateStorage storage ss = AaveLPManagerLib.getState();
        return ss.tokenMetadata[tokenAddr].targetPercent;
    }

    function getAaveIncome(address tokenAddr)
        public
        view
        aaveInitLock
        returns (uint256)
    {
        return
            LendingPool(getAaveLPAddr()).getReserveNormalizedIncome(tokenAddr);
    }

    function liquidateAaveTreasury() public aaveInitLock {
        address[] memory supportedTokens = getAllAaveSupportedTokens();
        for (uint256 i = 0; i < supportedTokens.length; i++) {
            withdrawAllFromAave(supportedTokens[i]);
        }
    }

    function withdrawFromAave(address erc20TokenAddr, uint256 amount)
        public
        aaveInitLock
        returns (uint256)
    {
        (bool _isSupportedToken, ) = isAaveSupportedToken(erc20TokenAddr);
        require(
            _isSupportedToken,
            string(
                abi.encodePacked(
                    AaveLPManagerLib.NAMESPACE,
                    ": ",
                    "This token is not currently supported"
                )
            )
        );

        if (getATokenBalance(erc20TokenAddr) == 0) {
            return 0;
        }

        return
        LendingPool(getAaveLPAddr()).withdraw(
            erc20TokenAddr,
            amount,
            address(this)
        );
    }

    function withdrawAllFromAave(address asset) public aaveInitLock {
        withdrawFromAave(asset, type(uint256).max);
    }

    function getATokenBalance(address asset)
        public
        view
        aaveInitLock
        returns (uint256)
    {
        (
            uint256 currentATokenBalance,
            ,
            ,
            ,
            ,
            ,
            ,
            ,

        ) = AaveProtocolDataProvider(getProtocolDataProviderAddr())
                .getUserReserveData(asset, address(this));
        return currentATokenBalance;
    }

    //"lite-balance"
    //This will be called from a keeper when our fee holdings have reached a threshold. We will first need to calculate
    // current/actual percentages, then determine which tokens are over/under-invested, and finally swap and deposit to
    // balance the tokens based on their targetedPercentages
    function balanceAaveLendingPoolWithTuffToken(address tokenAddr)
        public
        aaveInitLock
    {
    }

    //"full-balance"
    //This will be called from a keeper when actualPercentage deviates too far from targetPercentage. We will first
    // need to calculate current/actual percentages, then determine which tokens are over/under-invested, and finally
    // swap and deposit to balance the tokens based on their targetedPercentages
    function balanceAaveLendingPool(address tokenAddr)
        public
        aaveInitLock
    {
        address[] memory supportedTokens = getAllAaveSupportedTokens();

        uint256[] memory aTokenBalances = new uint256[](supportedTokens.length);
        uint256 totalTokenBalance = 0;

        uint256[] memory tokenTargetWeights = new uint256[](supportedTokens.length);

        //TODO: Make this a class variable? Updated during each addition and removal of a supportedToken?
        uint256 totalTargetWeight = 0;


        for (uint256 i = 0; i < supportedTokens.length; i++) {
            aTokenBalances[i] = getATokenBalance(supportedTokens[i]);

            // Get the value of each token in the same terms, WETH for example
            uint256 poolFee = 3000;
            uint256 period = 60;
            address poolAddress = IUniswapV3Factory(ss.uniswapV3FactoryAddr).getPool(ss.wethAddr, supportedTokens[i], poolFee);
            (int56[] memory tickCumulatives, uint160[] memory secondsPerLiquidityCumulativeX128s) =
                IUniswapV3Pool(poolAddress).observe([period, 0]);

            int56 tick1 = observations[0][0];
            int56 tick2 = observations[0][1];
            int56 avgTick = (tick2 - tick1) / period;

            aggergatedWethBalance += aTokenBalances[i];


            tokenTargetWeights[i] = getAaveTokenTargetedPercentage(supportedTokens[i]);


            totalTargetPercentage += tokenTargetWeights[i];
        }

        for (uint256 i = 0; i < supportedTokens.length; i++) {
            aTokenBalances[i] = getATokenBalance(supportedTokens[i]);
            tokenTargetPercentages[i] = getAaveTokenTargetedPercentage(supportedTokens[i]);
            totalTargetPercentage += tokenTargetPercentages[i];
        }
    }
}
