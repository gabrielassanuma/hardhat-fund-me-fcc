// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

error FundMe__NotOwner();

contract FundMe {
    using PriceConverter for uint256;

    mapping(address => uint256) private s_addressToAmountFunded;
    address[] private s_funders;

    address private immutable i_owner;
    uint256 public constant MINIMUM_USD = 50 * 10**18;

    // modifier onlyOwner allow smart contract creator to call functions inside smart contract
    // set up AggregatorV3Interface as a Global variable to be used on this Smart contract and PriceConverter.sol
    AggregatorV3Interface private s_priceFeed;
    modifier onlyOwner() {
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    // s_priceFeedAddress should be passed to pick network of choice to work with properly API key and get value converted
    constructor(address s_priceFeedAddress) {
        i_owner = msg.sender;
        // s_priceFeed refactored to work with differentes networks and differents API keys
        s_priceFeed = AggregatorV3Interface(s_priceFeedAddress);
    }

    // fund function converts tokens value into USD, check if donation is under the minimum limit, transfer fund and push funder to s_funders array
    function fund() public payable {
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "You need to spend more ETH!"
        );
        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
    }

    // withdraw function will iterate over s_funders array send balances to creator smart contract address
    function withdraw() public onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }

    function cheaperWithdraw() public payable onlyOwner {
        // to make contract better gas efficient we store funders array into memory
        address[] memory funders = s_funders;
        // for loop on funders array saved in memory
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex]; // get funder address
            s_addressToAmountFunded[funder] = 0; // set value to 0
        }
        // reset s_funders array
        s_funders = new address[](0);
        // withdraw funds from funders array
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success);
    }

    // get functions to make smart contract more gas efficient
    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAdressToAmountFunded(address funder)
        public
        view
        returns (uint256)
    {
        return s_addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
