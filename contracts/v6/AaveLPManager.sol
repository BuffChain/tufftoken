// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2; //solc >=v0.8.0 support this, v0.6 does not

import "@openzeppelin/contracts-v6/math/SafeMath.sol";
import {Context} from "@openzeppelin/contracts-v6/utils/Context.sol";
import {LendingPool} from "@aave/protocol-v2/contracts/protocol/lendingpool/LendingPool.sol";
import {LendingPoolAddressesProvider} from "@aave/protocol-v2/contracts/protocol/configuration/LendingPoolAddressesProvider.sol";
import {AaveProtocolDataProvider} from "@aave/protocol-v2/contracts/misc/AaveProtocolDataProvider.sol";
import {IUniswapV3Factory} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import {IUniswapV3Pool} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import {IERC20} from "@openzeppelin/contracts-v6/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts-v6/token/ERC20/ERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts-v6/token/ERC20/SafeERC20.sol";

import {AaveLPManagerLib} from "./AaveLPManagerLib.sol";
import {IUniswapManager} from "./IUniswapManager.sol";
import {IChainLinkPriceConsumer} from "./IChainLinkPriceConsumer.sol";
import "./ITuffOwnerV6.sol";

//Within this contract is a purposeful difference between percentage and weight. Percentage is a token value out of
// 100% of the total, weight decides how much influence a token should have on the total
contract AaveLPManager is Context {
    modifier onlyOwner() {
        ITuffOwnerV6(address(this)).requireOnlyOwner(msg.sender);
        _;
    }

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

    using SafeMath for uint256;

    struct BalanceMetadata {
        address[] supportedTokens;
        uint256[] tokensValueInWeth;
        uint256[] tokensTargetWeight;
        uint256 totalTargetWeight;
        uint256 totalBalanceInWeth;
        uint24 poolFee;
        uint24 balanceBufferPercent;
        uint256 treasuryBalance;
        uint24 decimalPrecision;
    }

    //Basically a constructor, but the hardhat-deploy plugin does not support diamond contracts with facets that has
    // constructors. We imitate a constructor with a one-time only function. This is called immediately after deployment
    function initAaveLPManager(
        address _lendingPoolProviderAddr,
        address _protocolDataProviderAddr,
        address _wethAddr,
        uint24 _balanceBufferPercent
    ) public onlyOwner {
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
        ss.wethAddr = _wethAddr;
        ss.totalTargetWeight = 0;
        ss.decimalPrecision = 1e4;
        ss.balanceBufferPercent = _balanceBufferPercent * ss.decimalPrecision;

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

    function getBalanceBufferPercent()
        public
        view
        aaveInitLock
        returns (uint24)
    {
        AaveLPManagerLib.StateStorage storage ss = AaveLPManagerLib.getState();
        return ss.balanceBufferPercent;
    }

    function setBalanceBufferPercent(uint24 _balanceBufferPercent)
        public
        aaveInitLock onlyOwner
    {
        AaveLPManagerLib.StateStorage storage ss = AaveLPManagerLib.getState();
        ss.balanceBufferPercent = _balanceBufferPercent;
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

    function setAaveTokenTargetWeight(
        address tokenAddr,
        uint24 targetWeight
    ) public aaveInitLock onlyOwner {
        AaveLPManagerLib.StateStorage storage ss = AaveLPManagerLib.getState();

        ss.totalTargetWeight = SafeMath.sub(
            ss.totalTargetWeight,
            ss.tokenMetadata[tokenAddr].targetWeight
        );
        ss.totalTargetWeight = SafeMath.add(
            ss.totalTargetWeight,
            targetWeight
        );

        ss.tokenMetadata[tokenAddr].targetWeight = targetWeight;
    }

    function getAaveTokenTargetWeight(address tokenAddr)
    public
    view
    aaveInitLock
    returns (uint256)
    {
        AaveLPManagerLib.StateStorage storage ss = AaveLPManagerLib.getState();
        return ss.tokenMetadata[tokenAddr].targetWeight;
    }

    function getAaveTokenCurrentPercentage(address tokenAddr)
    public
    view
    aaveInitLock
    returns (uint256)
    {
        BalanceMetadata memory bm = getBalanceMetadata();

        for (uint256 i = 0; i < bm.supportedTokens.length; i++) {
            if (bm.supportedTokens[i] == tokenAddr) {
                uint256 tokenActualPercentage = SafeMath.div(
                    SafeMath.mul(bm.tokensValueInWeth[i], 100 * bm.decimalPrecision),
                    bm.totalBalanceInWeth);
                return tokenActualPercentage;
            }
        }

        //TODO: should be a revert
        return 0;
    }

    function getBalanceMetadata()
    private
    view
    aaveInitLock
    returns (BalanceMetadata memory)
    {
        AaveLPManagerLib.StateStorage storage ss = AaveLPManagerLib.getState();
        BalanceMetadata memory bm;

        bm.supportedTokens = getAllAaveSupportedTokens();
        bm.tokensValueInWeth = new uint256[](
            bm.supportedTokens.length
        );
        bm.tokensTargetWeight = new uint256[](
            bm.supportedTokens.length
        );
        bm.totalTargetWeight = ss.totalTargetWeight;

        bm.totalBalanceInWeth = 0;
        bm.poolFee = 3000;
        bm.balanceBufferPercent = ss.balanceBufferPercent;
        bm.decimalPrecision = ss.decimalPrecision;

        bm.treasuryBalance = IERC20(address(this)).balanceOf(
            address(this)
        );

        // First loop through all tokens to aggregate their collective value and weights
        for (uint256 i = 0; i < bm.supportedTokens.length; i++) {
            //Get and normalize aTokenBalance
            uint256 aTokenBalance = SafeMath.mul(
                getATokenBalance(bm.supportedTokens[i]),
                10 ** uint256(18 - ERC20(bm.supportedTokens[i]).decimals()));

            //Get the value of each token in the same denomination, in this case WETH
            uint256 wethQuote = IChainLinkPriceConsumer(address(this))
            .getChainLinkPrice(
                ss.tokenMetadata[bm.supportedTokens[i]].chainlinkEthTokenAggrAddr
            );

            //Track balances
            uint256 tokenValueInWeth = SafeMath.mul(aTokenBalance, wethQuote);
            bm.tokensValueInWeth[i] = tokenValueInWeth;

            bm.totalBalanceInWeth = SafeMath.add(
                bm.totalBalanceInWeth,
                tokenValueInWeth
            );
        }

        return bm;
    }

    function getAaveTotalTargetWeight()
    public
    view
    aaveInitLock
    returns (uint256)
    {
        AaveLPManagerLib.StateStorage storage ss = AaveLPManagerLib.getState();
        return ss.totalTargetWeight;
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

    //`asset` is the token address, not aToken address
    function getATokenBalance(address asset)
    public
    view
    aaveInitLock
    returns (uint256)
    {
        (
        uint256 currentATokenBalance,
        uint256 currentStableDebt,
        uint256 currentVariableDebt,
        uint256 principalStableDebt,
        uint256 scaledVariableDebt,
        uint256 stableBorrowRate,
        uint256 liquidityRate,
        uint40 stableRateLastUpdated,
        bool usageAsCollateralEnabled
        ) = AaveProtocolDataProvider(getProtocolDataProviderAddr())
        .getUserReserveData(asset, address(this));
        return currentATokenBalance;
    }

    function getATokenAddress(address asset)
    public
    view
    aaveInitLock
    returns (address)
    {
        (address aTokenAddress, , ) = AaveProtocolDataProvider(
            getProtocolDataProviderAddr()
        ).getReserveTokensAddresses(asset);
        return aTokenAddress;
    }

    function depositToAave(address erc20TokenAddr, uint256 amount)
        public
        aaveInitLock
        onlyOwner
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

        SafeERC20.safeApprove(IERC20(erc20TokenAddr), getAaveLPAddr(), amount);
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

    function addAaveSupportedToken(address tokenAddr, address chainlinkEthTokenAggrAddr, uint24 targetWeight)
        public
        aaveInitLock
        onlyOwner
    {
        AaveLPManagerLib.StateStorage storage ss = AaveLPManagerLib.getState();

        address aTokenAddr = getATokenAddress(tokenAddr);
        require(
            aTokenAddr != address(0),
            "The tokenAddress provided is not supported by Aave"
        );

        ss.supportedTokens.push(tokenAddr);
        ss.tokenMetadata[tokenAddr].chainlinkEthTokenAggrAddr = chainlinkEthTokenAggrAddr;
        setAaveTokenTargetWeight(tokenAddr, targetWeight);
        //TODO: Remove this to save gas? This cost gas to save, while reading it is a view function, so gas free
        ss.tokenMetadata[tokenAddr].aToken = aTokenAddr;
    }

    function removeAaveSupportedToken(address tokenAddr)
        public
        aaveInitLock
        onlyOwner
    {
        AaveLPManagerLib.StateStorage storage ss = AaveLPManagerLib.getState();

        (bool _isSupportedToken, uint256 _tokenIndex) = isAaveSupportedToken(
            tokenAddr
        );
        if (_isSupportedToken) {
            ss.totalTargetWeight = SafeMath.sub(
                ss.totalTargetWeight,
                ss.tokenMetadata[tokenAddr].targetWeight
            );

            //Remove the token without preserving order
            ss.supportedTokens[_tokenIndex] = ss.supportedTokens[
                ss.supportedTokens.length - 1
            ];
            ss.supportedTokens.pop();
        }
    }

    function liquidateAaveTreasury()
        public
        aaveInitLock
        onlyOwner
        returns (bool)
    {
        address[] memory supportedTokens = getAllAaveSupportedTokens();
        bool allTokensWithdrawn = true;
        for (uint256 i = 0; i < supportedTokens.length; i++) {
            withdrawAllFromAave(supportedTokens[i]);
            uint256 remainingAmount = getATokenBalance(supportedTokens[i]);
            if (remainingAmount > 0) {
                allTokensWithdrawn = false;
            }
        }
        return allTokensWithdrawn;
    }

    function withdrawFromAave(address erc20TokenAddr, uint256 amount)
        public
        aaveInitLock
        onlyOwner
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

    function withdrawAllFromAave(address asset) public aaveInitLock onlyOwner {
        withdrawFromAave(asset, type(uint256).max);
    }

    /**
     * @dev Emitted when a swap occurs to balance an under-balanced token
     */
    event AaveLPManagerBalanceSwap(address tokenSwappedFor, uint256 amountIn, uint256 amountOut);

    //We will first need to calculate current/actual percentages, then determine which tokens are under-invested, and
    // finally swap and deposit to balance the tokens based on their targetedPercentages
    //Note: Only buy tokens to balance instead of trying to balance by selling first then buying. This means
    // we do not have to sort, which helps saves on gas.
    function balanceAaveLendingPool() public aaveInitLock onlyOwner {
        BalanceMetadata memory bm = getBalanceMetadata();

        //Then, loop through again to balance tokens
        for (uint256 i = 0; i < bm.supportedTokens.length; i++) {
            //Calculate target and actual percentage. Include decimal precision in numerator and multiple by 100 to
            // convert from decimal to percent
            uint256 tokenTargetWeight = getAaveTokenTargetWeight(bm.supportedTokens[i]);
            uint256 tokenTargetPercentage = SafeMath.div(
                SafeMath.mul(tokenTargetWeight, 100 * bm.decimalPrecision), bm.totalTargetWeight);
            uint256 tokenActualPercentage = SafeMath.div(
                SafeMath.mul(bm.tokensValueInWeth[i], 100 * bm.decimalPrecision), bm.totalBalanceInWeth);

            require(tokenTargetPercentage < uint(-1), "Cannot cast tokenTargetPercentage - out of range of int max");
            require(tokenActualPercentage < uint(-1), "Cannot cast tokenActualPercentage - out of range of int max");

            //Only balance if token is under-allocated more than our buffer amount
            int256 iPercentageDiff = int(tokenTargetPercentage) - int(tokenActualPercentage);
            if (iPercentageDiff > bm.balanceBufferPercent) {

                //We don't know ahead of time how many tokens will need balancing, but because we got here at least one
                // token is under-balanced, which means at least one token is over-balanced. Thus, we can subtract one
                // to optimize how quickly our token's balance
                uint256 balanceIn = SafeMath.div(bm.treasuryBalance, bm.supportedTokens.length - 1);

                if (balanceIn > 0) {
                    SafeERC20.safeApprove(IERC20(address(this)), address(this), balanceIn);
                    uint256 amountOut = IUniswapManager(address(this)).swapExactInputMultihop(
                        address(this),
                        bm.supportedTokens[i],
                        bm.poolFee,
                        bm.poolFee,
                        balanceIn,
                        0 //TODO: fix, should be based on an orcale
                    );
                    SafeERC20.safeApprove(IERC20(address(this)), address(this), 0);

                    depositToAave(bm.supportedTokens[i], amountOut);

                    emit AaveLPManagerBalanceSwap(bm.supportedTokens[i], balanceIn, amountOut);
                }
            }
        }
    }
}
