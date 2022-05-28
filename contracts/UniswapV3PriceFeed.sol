// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.7.6;
pragma experimental ABIEncoderV2;

import { Address } from "@openzeppelin/contracts/utils/Address.sol";
import { IUniswapV3Pool } from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import { FixedPoint96 } from "@uniswap/v3-core/contracts/libraries/FixedPoint96.sol";
import { FullMath } from "@uniswap/v3-core/contracts/libraries/FullMath.sol";
import { IPerpdexPriceFeed } from "./interface/IPerpdexPriceFeed.sol";

contract UniswapV3PriceFeed is IPerpdexPriceFeed {
    using Address for address;

    //
    // STATE
    //

    address public immutable pool;

    //
    // EXTERNAL NON-VIEW
    //

    constructor(address poolArg) {
        // EPF_EANC: pool address is not contract
        require(address(poolArg).isContract(), "EPF_EANC");

        pool = poolArg;
    }

    //
    // EXTERNAL VIEW
    //

    function getPrice() external view override returns (uint256) {
        (uint160 sqrtMarkPriceX96, , , , , , ) = IUniswapV3Pool(pool).slot0();
        uint256 markPriceX96 = _formatSqrtPriceX96ToPriceX96(sqrtMarkPriceX96);
        return _formatX96ToX10_18(markPriceX96);
    }

    //
    // EXTERNAL PURE
    //

    function decimals() external pure override returns (uint8) {
        return 18;
    }

    /**
     * @dev Returns the downcasted uint32 from uint256, reverting on
     * overflow (when the input is greater than largest uint32).
     *
     * Counterpart to Solidity's `uint32` operator.
     *
     * Requirements:
     *
     * - input must fit into 32 bits
     */
    function _toUint32(uint256 value) internal pure returns (uint32 returnValue) {
        require(((returnValue = uint32(value)) == value), "SafeCast: value doesn't fit in 32 bits");
    }

    function _formatSqrtPriceX96ToPriceX96(uint160 sqrtPriceX96) internal pure returns (uint256) {
        return FullMath.mulDiv(sqrtPriceX96, sqrtPriceX96, FixedPoint96.Q96);
    }

    function _formatX96ToX10_18(uint256 valueX96) internal pure returns (uint256) {
        return FullMath.mulDiv(valueX96, 1e18, FixedPoint96.Q96);
    }
}
