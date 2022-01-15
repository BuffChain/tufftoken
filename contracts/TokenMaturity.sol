// SPDX-License-Identifier: agpl-3.0

pragma solidity ^0.8.0;
import {TuffToken} from "./TuffToken.sol";
import {TokenMaturityLib} from "./TokenMaturityLib.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract TokenMaturity {
    modifier tokenMaturityInitLock() {
        require(
            isTokenMaturityInit(),
            string(
                abi.encodePacked(
                    TokenMaturityLib.NAMESPACE,
                    ": ",
                    "UNINITIALIZED"
                )
            )
        );
        _;
    }

    using SafeMath for uint256;

    function initTokenMaturity() public {
        require(
            !isTokenMaturityInit(),
            string(
                abi.encodePacked(
                    TokenMaturityLib.NAMESPACE,
                    ": ",
                    "ALREADY_INITIALIZED"
                )
            )
        );

        TokenMaturityLib.StateStorage storage ss = TokenMaturityLib.getState();

        ss.contractMaturityTimestamp = block.timestamp + (6 * 365 days);

        ss.isTreasuryLiquidated = false;

        TuffToken tuffToken = TuffToken(payable(address(this)));
        ss.totalSupplyForRedemption = tuffToken.totalSupply();
        ss.startingEthBalance = address(this).balance;

        ss.isInit = true;
    }

    /**
     * @dev Emitted when treasury has been liquidated
     * with the contract's ETH balance and total supply of redeemable tokens
     */
    event TokenMatured(uint256 balance, uint256 totalSupply);

    /**
     * @dev Emitted when holder redeems tokens for ETH
     */
    event Redeemed(address holder, uint256 tuffBalance, uint256 ethAmount);

    function isTokenMaturityInit() public view returns (bool) {
        TokenMaturityLib.StateStorage storage ss = TokenMaturityLib.getState();
        return ss.isInit;
    }

    function setContractMaturityTimestamp(uint256 timestamp)
        public
        tokenMaturityInitLock
    {
        TokenMaturityLib.StateStorage storage ss = TokenMaturityLib.getState();
        ss.contractMaturityTimestamp = timestamp;
    }

    function isTokenMatured(uint256 timestamp)
        public
        view
        tokenMaturityInitLock
        returns (bool)
    {
        TokenMaturityLib.StateStorage storage ss = TokenMaturityLib.getState();
        return timestamp >= ss.contractMaturityTimestamp;
    }

    function totalSupplyForRedemption()
        public
        view
        tokenMaturityInitLock
        returns (uint256)
    {
        TokenMaturityLib.StateStorage storage ss = TokenMaturityLib.getState();
        return ss.totalSupplyForRedemption;
    }

    function setTotalSupplyForRedemption(uint256 _totalSupplyForRedemption)
        public
        tokenMaturityInitLock
    {
        TokenMaturityLib.StateStorage storage ss = TokenMaturityLib.getState();
        ss.totalSupplyForRedemption = _totalSupplyForRedemption;
    }

    function getContractStartingEthBalance()
        public
        view
        tokenMaturityInitLock
        returns (uint256)
    {
        TokenMaturityLib.StateStorage storage ss = TokenMaturityLib.getState();
        return ss.startingEthBalance;
    }

    function setContractStartingEthBalance(uint256 startingEthBalance)
        public
        tokenMaturityInitLock
    {
        TokenMaturityLib.StateStorage storage ss = TokenMaturityLib.getState();
        ss.startingEthBalance = startingEthBalance;
    }

    function getRedemptionAmount(uint256 ownerBalance)
        public
        view
        tokenMaturityInitLock
        returns (uint256)
    {
        if (ownerBalance == 0) {
            return 0;
        }
        return
            getContractStartingEthBalance().mul(ownerBalance).div(
                totalSupplyForRedemption()
            );
    }

    function getIsTreasuryLiquidated()
        public
        view
        tokenMaturityInitLock
        returns (bool)
    {
        TokenMaturityLib.StateStorage storage ss = TokenMaturityLib.getState();
        return ss.isTreasuryLiquidated;
    }

    function setIsTreasuryLiquidated(bool _isTreasuryLiquidated)
        public
        tokenMaturityInitLock
    {
        TokenMaturityLib.StateStorage storage ss = TokenMaturityLib.getState();
        ss.isTreasuryLiquidated = _isTreasuryLiquidated;
    }

    function redeem() public tokenMaturityInitLock {
        require(
            isTokenMatured(block.timestamp),
            "Address can not redeem before expiration."
        );

        require(
            getIsTreasuryLiquidated(),
            "Address can not redeem before treasury has been liquidated."
        );

        address payable account = payable(msg.sender);

        (bool _hasRedeemed, ) = hasRedeemed(account);

        require(!_hasRedeemed, "Address can only redeem once.");

        TuffToken tuffToken = TuffToken(payable(address(this)));
        uint256 ownerBalance = tuffToken.balanceOf(account);

        require(ownerBalance > 0, "Owner balance needs to be greater than 0.");

        uint256 redemptionAmount = getRedemptionAmount(ownerBalance);

        account.transfer(redemptionAmount);

        tuffToken.burn(account, ownerBalance);

        TokenMaturityLib.StateStorage storage ss = TokenMaturityLib.getState();
        ss.ownersRedeemed[account] = true;
        ss.ownersRedemptionBalances[account] = redemptionAmount;

        emit Redeemed(account, ownerBalance, redemptionAmount);
    }

    function hasRedeemed(address account)
        public
        view
        tokenMaturityInitLock
        returns (bool, uint256)
    {
        TokenMaturityLib.StateStorage storage ss = TokenMaturityLib.getState();
        return (
            ss.ownersRedeemed[account],
            ss.ownersRedemptionBalances[account]
        );
    }

    function balanceOfEth(address account)
        public
        view
        tokenMaturityInitLock
        returns (uint256)
    {
        return account.balance;
    }

    function getCurrentContractEthBalance()
        public
        view
        tokenMaturityInitLock
        returns (uint256)
    {
        return address(this).balance;
    }

    //    call via perform upkeep once current timestamp >= contract maturity timestamp
    function onTokenMaturity() public tokenMaturityInitLock {
        require(
            isTokenMatured(block.timestamp),
            "TUFF: Token must have reached maturity."
        );

        require(
            !getIsTreasuryLiquidated(),
            "TUFF: Treasury must not have been liquidated."
        );

        liquidateTreasury();

        uint256 ethBalance = getCurrentContractEthBalance();
        setContractStartingEthBalance(ethBalance);

        uint256 redeemableTotalSupply = TuffToken(payable(address(this)))
            .totalSupply();
        setTotalSupplyForRedemption(redeemableTotalSupply);

        emit TokenMatured(ethBalance, redeemableTotalSupply);
    }

    function liquidateTreasury() public tokenMaturityInitLock {
        setIsTreasuryLiquidated(true);

        //    todo liquidate treasury to eth
    }
}
