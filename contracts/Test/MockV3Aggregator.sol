// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0; // to work wih chainlink script we should use 0.6.0 solidity version
// added 0.6.0 version into hardhat.config

import "@chainlink/contracts/src/v0.6/tests/MockV3Aggregator.sol";
// import from chain link Mock Aggregator to allow convertion of tokens into USD locally
