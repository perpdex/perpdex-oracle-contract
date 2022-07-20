// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity >=0.7.6;
pragma experimental ABIEncoderV2;

import { Address } from "@openzeppelin/contracts/utils/Address.sol";
import { SafeMath } from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import { IERC20 } from "@uniswap/v2-core/contracts/interfaces/IERC20.sol";
import { IUniswapV2Pair } from "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import { PRBMath } from "prb-math/contracts/PRBMath.sol";
import { IPerpdexPriceFeed } from "./interface/IPerpdexPriceFeed.sol";

contract UniswapV2PriceFeed is IPerpdexPriceFeed {
    using Address for address;
    using SafeMath for uint256;

    address public immutable pair;
    uint8 public constant override decimals = 18;
    uint256 public immutable priceScale;
    bool public immutable inverse;

    constructor(address pairArg, bool inverseArg) {
        require(address(pairArg).isContract(), "UV2PF_C: pool is not contract");

        pair = pairArg;
        inverse = inverseArg;
        priceScale = _getPriceScale(pairArg, inverseArg);
    }

    function getPrice() external view override returns (uint256) {
        (uint256 reserve0, uint256 reserve1, ) = IUniswapV2Pair(pair).getReserves();
        if (inverse) {
            return PRBMath.mulDiv(reserve1, priceScale, reserve0);
        } else {
            return PRBMath.mulDiv(reserve0, priceScale, reserve1);
        }
    }

    function _getPriceScale(address pairArg, bool inverseArg) private view returns (uint256) {
        address token0 = IUniswapV2Pair(pairArg).token0();
        address token1 = IUniswapV2Pair(pairArg).token1();
        uint256 decimals0 = IERC20(token0).decimals();
        uint256 decimals1 = IERC20(token1).decimals();

        uint256 price_scale_decimals;
        if (inverseArg) {
            price_scale_decimals = decimals1.add(decimals).sub(decimals0);
        } else {
            price_scale_decimals = decimals0.add(decimals).sub(decimals1);
        }
        require(price_scale_decimals <= 36, "UV2PF_GPS: too large decimals");
        return 10**price_scale_decimals;
    }
}
