// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PriceConsumer is Ownable {

    struct Pair {
        string name;
        address aggregatorAddress;
        int256 price;
        uint8 decimals;
        uint timeStamp;
    }

    string[] pairKeys;
    mapping(string => Pair) pairs;

    /**
     * Network: Kovan
     * Aggregator: ETH/USD
     * Address: 0x9326BFA02ADD2366b30bacB125260Af641031331
     */
    constructor() {

        addPair("ETH/USD", 0x9326BFA02ADD2366b30bacB125260Af641031331);

        // updatePairs();

    }

    function addPair(string memory pairKey, address aggregatorAddress) public onlyOwner {
        pairKeys.push(pairKey);
        pairs[pairKey] = Pair(pairKey, aggregatorAddress, 0, 0, 0);
    }

    function removePair(string memory pairKey) public onlyOwner {
        delete pairs[pairKey];

        uint8 pairKeyIndex = findPairIndex(pairKey);

        deleteFromPairKeys(pairKeyIndex);

    }

    function findPairIndex(string memory pairKey) private view returns (uint8) {
        uint8 pairIndex = 0;
        for (pairIndex; pairIndex < pairKeys.length; pairIndex++) {

            if (keccak256(abi.encodePacked((pairKeys[pairIndex]))) == keccak256(abi.encodePacked((pairKey)))) {
                break;
            }

        }
        return pairIndex;
    }

    function deleteFromPairKeys(uint8 pairIndex) private {
        pairKeys[pairIndex] = pairKeys[pairKeys.length - 1];
        pairKeys.pop();
    }

    function getPairKeysLength() private view returns (uint256) {
        return pairKeys.length;
    }

    /**
     * Returns the latest round data of a given pair key
     */
    function getPair(string memory pairKey) public onlyOwner view returns (
        string memory,
        address,
        int256,
        uint8,
        uint) {

        Pair memory pair = pairs[pairKey];
        return (pair.name, pair.aggregatorAddress, pair.price, pair.decimals, pair.timeStamp);

    }

    function updatePairs() public onlyOwner {
        require(block.timestamp > pairs[pairKeys[0]].timeStamp + 1 days, "Can't update pairs more than 1 time per day.");

        for (uint8 pairIndex = 0; pairIndex < pairKeys.length; pairIndex++) {

            string memory pairKey = pairKeys[pairIndex];

            AggregatorV3Interface priceFeed = AggregatorV3Interface(pairs[pairKey].aggregatorAddress);

            (,int price,,uint timeStamp,) = priceFeed.latestRoundData();

            if (timeStamp >= pairs[pairKey].timeStamp + 1 days) {

                pairs[pairKey].decimals = priceFeed.decimals();
                pairs[pairKey].timeStamp = timeStamp;
                pairs[pairKey].price = price;

            }

        }

    }

}
