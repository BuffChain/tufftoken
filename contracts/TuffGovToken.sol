// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Wrapper.sol";

/**
 * Implementation of openzepplin governance https://docs.openzeppelin.com/contracts/4.x/governance
 * In order to have voting power, a holder of TuffToken must deposit (wrap) their tokens to get the equal amount
 * of TuffGovToken. They must also delegate themselves (or another holder if they so choose) to be granted voting power.
 * Voting power is determined simply by token balance.
 */

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

    function deposit(uint256 amount) external {
        super.depositFor(msg.sender, amount);
    }

    function withdraw(uint256 amount) external {
        super.withdrawTo(msg.sender, amount);
    }
}
