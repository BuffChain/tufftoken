// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.5.0;

interface IPriceConsumer {

    function getPrice()
    external
    view
    returns (
        uint256
    );

}
