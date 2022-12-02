// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Token is broken, we should figure out

contract FundMeToken is ERC20 {
    constructor(uint256 totalSupply) ERC20("FundMeToken", "FMT") {
        _mint(msg.sender, totalSupply);
    }
}
