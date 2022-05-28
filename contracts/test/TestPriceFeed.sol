// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.7.6;

import { IPriceFeed } from "../interface/IPriceFeed.sol";

contract TestPriceFeed {
    address public chainlink;
    address public bandProtocol;

    uint256 public currentPrice;

    constructor(address _chainlink, address _bandProtocol) {
        chainlink = _chainlink;
        bandProtocol = _bandProtocol;
        currentPrice = 10;
    }

    //
    // for gas usage testing
    //
    function fetchChainlinkPrice() external {
        currentPrice = IPriceFeed(chainlink).getPrice();
    }

    function fetchBandProtocolPrice() external {
        currentPrice = IPriceFeed(bandProtocol).getPrice();
    }
}
