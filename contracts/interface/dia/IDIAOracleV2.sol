// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.7.4;

interface IDIAOracleV2 {
    function setValue(string memory key, uint128 value, uint128 timestamp) public;
    function getValue(string memory key) external view returns (uint128, uint128);
    function updateOracleUpdaterAddress(address newOracleUpdaterAddress) public;
}
