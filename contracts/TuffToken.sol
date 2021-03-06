// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

/**
 * @notice Implementation of openzepplin governance https://docs.openzeppelin.com/contracts/4.x/governance
 * In order to have voting power, an account must hold TuffToken.
 * They must also delegate themselves (or another holder if they so choose) to be granted voting power.
 * Voting power is determined simply by token balance.
 */

contract TuffToken is Context, ERC20, ERC20Permit, ERC20Votes {
    string private _name;
    string private _symbol;
    uint8 private _decimals;

    /// @notice ERC20 governance token used by TuffGovernor.
    /// @param name_ The name of the token
    /// @param symbol_ The symbol of the token
    constructor(string memory name_, string memory symbol_) ERC20(name_, symbol_) ERC20Permit(name_) {
        _name = name_;
        _symbol = symbol_;
        _decimals = 9;
        uint256 _totalSupply = 1 gwei * 10**_decimals;
        _mint(_msgSender(), _totalSupply);
    }

    /// @notice returns the name of the token
    function name() public view override returns (string memory) {
        return _name;
    }

    /// @notice returns the symbol of the token
    function symbol() public view override returns (string memory) {
        return _symbol;
    }

    /// @notice returns the decimals of the token
    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    /// @inheritdoc ERC20Votes
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Votes) {
        super._afterTokenTransfer(from, to, amount);
    }

    /// @inheritdoc ERC20Votes
    function _mint(address to, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._mint(to, amount);
    }

    /// @inheritdoc ERC20Votes
    function _burn(address account, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._burn(account, amount);
    }
}
