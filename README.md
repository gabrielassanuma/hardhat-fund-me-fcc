# FundMe

FundMe helps users raise funding for Projects using ETH Blockchain.


## Network
This project was designed to work on ETH blockchain, using MetaMask Wallets.
It's on test net, using Goerli Tokens.

## Version
Version 1.0.0

## Scripts

```bash
  "scripts": {
    "test": "yarn hardhat test",
    "test-staging": "yarn hardhat test --network goerli",
    "lint": "yarn solhint contracts/*.sol",
    "lint:fix": "yarn solhitn contracts/*.sol --fix",
    "formatter": "yarn prettier --write",
    "coverage": "yarn hardhat coverage"
  },
```

## Tests
```bash
  FundMe
    constructor
      ✓ sets the aggregator address correctly
    fund
      ✓ Fails if amount of ETH is under 50USD
      ✓ updated amount funded
      ✓ address fund to array getFunder
    withdraw
      ✓ withdraw ETH single funder
      ✓ withdraw with multiple getFunder
      ✓ only allows the owner to withdraw
      ✓ cheaper withdraw testing
```

## Usage

The contract has been deployed on Goerli Testnet(ETH): https://goerli.etherscan.io/address/0xaac35864D0C9e4baFD840A75307Af12F4a5DcA81

## License
[MIT](https://choosealicense.com/licenses/mit/)
