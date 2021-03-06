// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity >=0.7.6;

import { Address } from "@openzeppelin/contracts/utils/Address.sol";
import { AggregatorV3Interface } from "@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol";
import { IPerpdexPriceFeed } from "./interface/IPerpdexPriceFeed.sol";

contract ChainlinkPriceFeed is IPerpdexPriceFeed {
    using Address for address;

    AggregatorV3Interface public immutable aggregator;

    constructor(AggregatorV3Interface aggregatorArg) {
        require(address(aggregatorArg).isContract(), "CPF_C: agg address not contract");

        aggregator = aggregatorArg;
    }

    function decimals() external view override returns (uint8) {
        return aggregator.decimals();
    }

    function getPrice() external view override returns (uint256) {
        (, uint256 latestPrice, ) = _getLatestRoundData();
        return latestPrice;
    }

    function _getLatestRoundData()
        private
        view
        returns (
            uint80,
            uint256 finalPrice,
            uint256
        )
    {
        (uint80 round, int256 latestPrice, , uint256 latestTimestamp, ) = aggregator.latestRoundData();
        finalPrice = uint256(latestPrice);
        if (latestPrice < 0) {
            _requireEnoughHistory(round);
            (round, finalPrice, latestTimestamp) = _getRoundData(round - 1);
        }
        return (round, finalPrice, latestTimestamp);
    }

    function _getRoundData(uint80 _round)
        private
        view
        returns (
            uint80,
            uint256,
            uint256
        )
    {
        (uint80 round, int256 latestPrice, , uint256 latestTimestamp, ) = aggregator.getRoundData(_round);
        while (latestPrice < 0) {
            _requireEnoughHistory(round);
            round = round - 1;
            (, latestPrice, , latestTimestamp, ) = aggregator.getRoundData(round);
        }
        return (round, uint256(latestPrice), latestTimestamp);
    }

    function _requireEnoughHistory(uint80 _round) private pure {
        require(_round > 0, "CPF_REH: no enough history");
    }
}
