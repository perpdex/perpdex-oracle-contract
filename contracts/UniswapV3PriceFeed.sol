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
        require(address(poolArg).isContract(), "UVPF_C: pool is not contract");

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

    function _formatSqrtPriceX96ToPriceX96(uint160 sqrtPriceX96) internal pure returns (uint256) {
        return FullMath.mulDiv(sqrtPriceX96, sqrtPriceX96, FixedPoint96.Q96);
    }

    function _formatX96ToX10_18(uint256 valueX96) internal pure returns (uint256) {
        return FullMath.mulDiv(valueX96, 1e18, FixedPoint96.Q96);
    }
}
