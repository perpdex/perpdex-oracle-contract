// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.7.6;
pragma experimental ABIEncoderV2;

import { Address } from "@openzeppelin/contracts/utils/Address.sol";
import { IPerpdexPriceFeed } from "./interface/IPerpdexPriceFeed.sol";
import { IDIAOracleV2 } from "./interface/dia/IDIAOracleV2.sol";

contract DiaPriceFeed is IPerpdexPriceFeed {
    using Address for address;

    //
    // STATE
    //
    string public constant QUOTE_ASSET = "USD";

    IDIAOracleV2 public immutable oracle;
    string public oracleKey;

    //
    // EXTERNAL NON-VIEW
    //

    constructor(IDIAOracleV2 oracleArg, string memory oracleKeyArg) {
        require(address(oracleArg).isContract(), "DPF_C: ref address not contract");

        oracle = oracleArg;
        oracleKey = oracleKeyArg;
    }

    //
    // EXTERNAL VIEW
    //

    function getPrice() external view override returns (uint256) {
        (uint128 value, ) = _getOracleData();
        return value;
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
        require(timestamp > 0, "DPF_GOD: time is zero");
        require(value > 0, "DPF_GOD: invalid price");

        return (value, timestamp);
    }
}
