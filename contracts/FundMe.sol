// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

error FundMe__NotOwner();

contract FundMe {
    using PriceConverter for uint256;

    mapping(address => uint256) public addressToAmountFunded;
    address[] public funders;

    address public immutable i_owner;
    uint256 public constant MINIMUM_USD = 50 * 10**18;

    // modifier onlyOwner allow smart contract creator to call functions inside smart contract
    // set up AggregatorV3Interface as a Global variable to be used on this Smart contract and PriceConverter.sol
    AggregatorV3Interface public priceFeed;
    modifier onlyOwner() {
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    // priceFeedAddress should be passed to pick network of choice to work with properly API key and get value converted
    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        // priceFeed refactored to work with differentes networks and differents API keys
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    // fund function converts tokens value into USD, check if donation is over the minimum limit, transfer fund and push funder to funders array
    function fund() public payable {
        require(
            msg.value.getConversionRate(priceFeed) >= MINIMUM_USD,
            "You need to spend more ETH!"
        );
        addressToAmountFunded[msg.sender] += msg.value;
        funders.push(msg.sender);
    }

    // withdraw function will iterate over funders array send balances to creator smart contract address
    function withdraw() public onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            addressToAmountFunded[funder] = 0;
        }
        funders = new address[](0);
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }
}
