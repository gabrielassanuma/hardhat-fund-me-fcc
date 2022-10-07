// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

// imported chainlink scripted to convert ethers into USD
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

// Price converter will be used into FundMe Contract to convert ethers into USD.
// library PriceConverter iteract with chain link and converts tokens value into USD.
library PriceConverter {
    function getPrice(AggregatorV3Interface priceFeed)
        internal
        view
        returns (uint256)
    {
        (, int256 answer, , , ) = priceFeed.latestRoundData();

        return uint256(answer * 10000000000);
    }

    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        // priceFeed will set up with API should be used to convert ethers into USD
        uint256 ethPrice = getPrice(priceFeed);
        // using 1e18 notation to avoid rounded problems with values
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1000000000000000000;
        // the actual ETH/USD conversion rate, after adjusting the extra 0s.
        return ethAmountInUsd;
    }
}
