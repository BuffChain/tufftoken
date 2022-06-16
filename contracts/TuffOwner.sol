// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "./TuffOwnerLib.sol";

/**
 * @dev inspired by https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol
 * owner() is already defined in the TuffTokenDiamond, we cannot import openzepplin's Ownable contract as it shadows
 * the existing definition and we need to allow calls coming from other facets on the diamond contract.
 */
contract TuffOwner {
    function isTuffOwnerInit() public view returns (bool) {
        TuffOwnerLib.StateStorage storage ss = TuffOwnerLib.getState();
        return ss.isInit;
    }

    function initTuffOwner(address initialOwner) public {
        require(!isTuffOwnerInit(), string(abi.encodePacked(TuffOwnerLib.NAMESPACE, ": ", "ALREADY_INITIALIZED")));
        _transferOwnership(initialOwner);
    }

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Returns the address of the current owner.
     */
    function getTuffOwner() public view virtual returns (address) {
        TuffOwnerLib.StateStorage storage ss = TuffOwnerLib.getState();
        return ss._owner;
    }

    modifier onlyOwner() {
        requireOnlyOwner(msg.sender);
        _;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    function requireOnlyOwner(address sender) public view {
        require(sender == address(this) || sender == getTuffOwner(), "Ownable: caller is not the owner");
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions anymore. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferTuffOwnership(address newOwner) public virtual onlyOwner {
        //New Owner Zero Address: Ownable - new owner is the zero address
        require(newOwner != address(0), "NOZA");
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        TuffOwnerLib.StateStorage storage ss = TuffOwnerLib.getState();
        address oldOwner = ss._owner;
        ss._owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}
