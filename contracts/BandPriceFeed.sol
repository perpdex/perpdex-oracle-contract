// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity >=0.7.6;
pragma experimental ABIEncoderV2;

import { Address } from "@openzeppelin/contracts/utils/Address.sol";
import { IPerpdexPriceFeed } from "./interface/IPerpdexPriceFeed.sol";
import { IStdReference } from "./interface/bandProtocol/IStdReference.sol";

contract BandPriceFeed is IPerpdexPriceFeed {
    using Address for address;

    //
    // STATE
    //
    string public constant QUOTE_ASSET = "USD";

    string public baseAsset;
    IStdReference public immutable stdRef;

    //
    // EXTERNAL NON-VIEW
    //

    constructor(IStdReference stdRefArg, string memory baseAssetArg) {
        require(address(stdRefArg).isContract(), "BPF_C: ref address not contract");

        stdRef = stdRefArg;
        baseAsset = baseAssetArg;
    }

    //
    // EXTERNAL VIEW
    //

    function getPrice() external view override returns (uint256) {
        IStdReference.ReferenceData memory latestBandData = _getReferenceData();
        return latestBandData.rate;
    }

    //
    // EXTERNAL PURE
    //

    function decimals() external pure override returns (uint8) {
        // We assume Band Protocol always has 18 decimals
        // https://docs.bandchain.org/band-standard-dataset/using-band-dataset/using-band-dataset-evm.html
        return 18;
    }

    //
    // INTERNAL VIEW
    //

    function _getReferenceData() internal view returns (IStdReference.ReferenceData memory) {
        IStdReference.ReferenceData memory bandData = stdRef.getReferenceData(baseAsset, QUOTE_ASSET);
        require(bandData.lastUpdatedQuote > 0, "BPF_GRD: quote time is zero");
        require(bandData.lastUpdatedBase > 0, "BPF_GRD: base time is zero");
        require(bandData.rate > 0, "BPF_GRD: invalid price");

        return bandData;
    }
}
