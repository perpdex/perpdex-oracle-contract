// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity 0.7.6;

import { IDIAOracleV2 } from "../interface/dia/IDIAOracleV2.sol";

contract TestDIAOracleV2 is IDIAOracleV2 {
    constructor() {}

    function getValue(string memory key) external view override returns (uint128, uint128) {
        return (0, 0);
    }
}
