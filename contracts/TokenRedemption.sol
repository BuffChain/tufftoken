pragma solidity ^0.8.0;
import { TuffToken } from  "./TuffToken.sol";

contract TokenRedemption {

    using SafeMath for uint256;

    receive() external payable {}

    TuffToken tuffToken;
    mapping(address => bool) ownersRedeemed;
    uint256 startingEthBalance;

    constructor (address payable _tokenAddr) payable {
        tuffToken = TuffToken(_tokenAddr);
        startingEthBalance = address(this).balance;
    }

    function balanceOf(address account) public view returns (uint256) {
        return tuffToken.balanceOf(account);
    }

    function hasExpired() public view returns (bool) {
        return tuffToken.hasExpired();
    }

    function totalSupplyForRedemption() public view returns (uint256) {
        return tuffToken.totalSupplyForRedemption();
    }

    function getContractStartingEthBalance() public view returns (uint256) {
        return startingEthBalance;
    }

    function getRedemptionAmount(address account) public view returns (uint256) {
        return getContractStartingEthBalance().mul(balanceOf(account)).div(totalSupplyForRedemption());
    }

    function redeem() public returns (uint256) {

        require(hasExpired(), "Address can not redeem before expiration.");

        address payable account = payable(msg.sender);

        require(!hasRedeemed(account), "Address can only redeem once.");

        uint256 redemptionAmount = getRedemptionAmount(account);

        account.transfer(redemptionAmount);

        tuffToken.burn(account, balanceOf(account));

        ownersRedeemed[account] = true;

        return redemptionAmount;
    }

    function hasRedeemed(address account) public view returns (bool) {
        return ownersRedeemed[account];
    }

    function balanceOfEth(address account) public view returns (uint256) {
        return account.balance;
    }

    function getCurrentContractEthBalance() public view returns (uint256) {
        return address(this).balance;
    }

}
