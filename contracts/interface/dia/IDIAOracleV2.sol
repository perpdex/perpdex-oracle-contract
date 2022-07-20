// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity >=0.7.6;

interface IDIAOracleV2 {
    function getValue(string memory key) external view returns (uint128, uint128);
}
