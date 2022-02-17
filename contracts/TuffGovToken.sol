// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Wrapper.sol";
import "hardhat/console.sol";


contract TuffGovToken is ERC20, ERC20Permit, ERC20Votes, ERC20Wrapper {

    IERC20 wrappedToken;

    constructor(IERC20 _wrappedToken)
        ERC20("TuffGovToken", "TUFFGOV")
        ERC20Permit("TuffGovToken")
        ERC20Wrapper(_wrappedToken)
    {
        wrappedToken = _wrappedToken;
    }

    // The functions below are overrides required by Solidity.

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Votes) {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._burn(account, amount);
    }

    function wrap(uint256 amount) external {
        _wrap(msg.sender, amount);
    }

    function unWrap(uint256 amount) external {
        _unWrap(msg.sender, amount);
    }

    function _wrap(address account, uint256 amount) internal {
        wrappedToken.approve(address(this), amount);
        super.depositFor(account, amount);
    }

    function _unWrap(address account, uint256 amount) internal {
        super.withdrawTo(account, amount);
    }
}
