pragma solidity ^0.8.0;
import {TuffToken} from "./TuffToken.sol";
import {TokenMaturityLib} from "./TokenMaturityLib.sol";
import "@openzeppelin/contracts-v8/utils/math/SafeMath.sol";

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
        ss.startingEthBalance = getCurrentContractEthBalance();

        ss.isInit = true;
    }

    function isTokenMaturityInit() public view returns (bool) {
        TokenMaturityLib.StateStorage storage ss = TokenMaturityLib.getState();
        return ss.isInit;
    }

    function setContractMaturityTimestamp(uint256 timestamp) public {
        TokenMaturityLib.StateStorage storage ss = TokenMaturityLib.getState();
        ss.contractMaturityTimestamp = timestamp;
    }

    function isTokenMatured(uint256 timestamp) public view returns (bool) {
        TokenMaturityLib.StateStorage storage ss = TokenMaturityLib.getState();
        return timestamp >= ss.contractMaturityTimestamp;
    }

    function totalSupplyForRedemption() public view returns (uint256) {
        TokenMaturityLib.StateStorage storage ss = TokenMaturityLib.getState();
        return ss.totalSupplyForRedemption;
    }

    function setTotalSupplyForRedemption(uint256 totalSupplyForRedemption)
        public
    {
        TokenMaturityLib.StateStorage storage ss = TokenMaturityLib.getState();
        ss.totalSupplyForRedemption = totalSupplyForRedemption;
    }

    function getContractStartingEthBalance() public view returns (uint256) {
        TokenMaturityLib.StateStorage storage ss = TokenMaturityLib.getState();
        return ss.startingEthBalance;
    }

    function setContractStartingEthBalance(uint256 startingEthBalance) public {
        TokenMaturityLib.StateStorage storage ss = TokenMaturityLib.getState();
        ss.startingEthBalance = startingEthBalance;
    }

    function getRedemptionAmount(address account, uint256 ownerBalance)
        public
        view
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

    function getIsTreasuryLiquidated() public view returns (bool) {
        TokenMaturityLib.StateStorage storage ss = TokenMaturityLib.getState();
        return ss.isTreasuryLiquidated;
    }

    function setIsTreasuryLiquidated(bool _isTreasuryLiquidated) public {
        TokenMaturityLib.StateStorage storage ss = TokenMaturityLib.getState();
        ss.isTreasuryLiquidated = _isTreasuryLiquidated;
    }

    function redeem() public {
        require(
            isTokenMatured(block.timestamp),
            "Address can not redeem before expiration."
        );

        require(
            getIsTreasuryLiquidated(),
            "Address can not redeem before treasury has been liquidated."
        );

        address payable account = payable(msg.sender);

        (bool hasRedeemed, ) = hasRedeemed(account);

        require(!hasRedeemed, "Address can only redeem once.");

        TuffToken tuffToken = TuffToken(payable(address(this)));
        uint256 ownerBalance = tuffToken.balanceOf(account);

        require(ownerBalance > 0, "Owner balance needs to be greater than 0.");

        uint256 redemptionAmount = getRedemptionAmount(account, ownerBalance);

        account.transfer(redemptionAmount);
        //        todo: add event

        tuffToken.burn(account, ownerBalance);

        TokenMaturityLib.StateStorage storage ss = TokenMaturityLib.getState();
        ss.ownersRedeemed[account] = true;
        ss.ownersRedemptionBalances[account] = redemptionAmount;
    }

    function hasRedeemed(address account) public view returns (bool, uint256) {
        TokenMaturityLib.StateStorage storage ss = TokenMaturityLib.getState();
        return (
            ss.ownersRedeemed[account],
            ss.ownersRedemptionBalances[account]
        );
    }

    function balanceOfEth(address account) public view returns (uint256) {
        return account.balance;
    }

    function getCurrentContractEthBalance() public view returns (uint256) {
        return address(this).balance;
    }

    //    call via perform upkeep once current timestamp >= contract maturity timestamp
    function onTokenMaturity() public {
        require(
            isTokenMatured(block.timestamp),
            "Token must have reached maturity."
        );

        require(
            getIsTreasuryLiquidated(),
            "Treasury must not have been liquidated."
        );

        liquidateTreasury();

        setContractStartingEthBalance(getCurrentContractEthBalance());

        TuffToken tuffToken = TuffToken(payable(address(this)));
        setTotalSupplyForRedemption(tuffToken.totalSupply());
    }

    function liquidateTreasury() public {
        setIsTreasuryLiquidated(true);

        //    todo liquidate treasury to eth
    }
}
