// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.7.6;
pragma experimental ABIEncoderV2;

import { Address } from "@openzeppelin/contracts/utils/Address.sol";
import { BlockContext } from "./base/BlockContext.sol";
import { IPriceFeed } from "./interface/IPriceFeed.sol";
import { IDIAOracleV2 } from "./interface/dia/IDIAOracleV2.sol";
import { CachedTwap } from "./twap/CachedTwap.sol";

contract DiaPriceFeed is IPriceFeed, BlockContext, CachedTwap {
    using Address for address;

    //
    // STATE
    //
    string public constant QUOTE_ASSET = "USD";

    IDIAOracleV2 public oracle;
    string public oracleKey;

    //
    // EXTERNAL NON-VIEW
    //

    constructor(
        IDIAOracleV2 oracleArg,
        string memory oracleKeyArg,
        uint80 cacheTwapInterval
    ) CachedTwap(cacheTwapInterval) {
        // DPF_ANC: Reference address is not contract
        require(address(oracleArg).isContract(), "DPF_ANC");

        oracle = oracleArg;
        oracleKey = oracleKeyArg;
    }

    /// @dev anyone can help update it.
    function update() external {
        (uint128 value, uint128 timestamp) = _getOracleData();
        _update(value, timestamp);
    }

    function cacheTwap(uint256 interval) external override returns (uint256) {
        (uint128 value, uint128 timestamp) = _getOracleData();
        if (interval == 0) {
            return value;
        }
        return _cacheTwap(interval, value, timestamp);
    }

    //
    // EXTERNAL VIEW
    //

    function getPrice(uint256 interval) external view override returns (uint256) {
        (uint128 value, uint128 timestamp) = _getOracleData();
        if (interval == 0) {
            return value;
        }
        return _getCachedTwap(interval, value, timestamp);
    }

    //
    // EXTERNAL PURE
    //

    function decimals() external pure override returns (uint8) {
        // We assume DIA always has 8 decimals
        // https://github.com/diadata-org/diadata/blob/master/cmd/blockchain/ethereum/diaOracleV2Service/main.go#L148
        return 8;
    }

    //
    // INTERNAL VIEW
    //

    function _getOracleData() internal view returns (uint128, uint128) {
        (uint128 value, uint128 timestamp) = oracle.getValue(oracleKey);
        // DPF_TZ: timestamp is zero
        require(timestamp > 0, "DPF_TZ");
        // DPF_IP: invalid price
        require(value > 0, "DPF_IP");

        return (value, timestamp);
    }
}
