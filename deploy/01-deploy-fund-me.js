const { networkConfig, developmentChains } = require("../helper-hardhat-config") // import network from helper-hardhat-config
const { network } = require("hardhat") // set up network coming from hardhat
const { verify } = require("../utils/verify") // imported from utils/verify.js

// anonymous function wrapped by module.exports
// getNamedAccounts and deployments are from HRE = hre.getNamedAccount / hre.deployments
module.exports = async ({ getNamedAccounts, deployments }) => {
    // pull deploy and log function out of deployments
    const { deploy, log } = deployments
    // check hardhat.config - deployer set by network
    const { deployer } = await getNamedAccounts()
    // grabs the chainId of network you choose to work with
    const chainId = network.config.chainId

    // check FundMe.sol / constructor - PriceFeedAddress paramaratized to work with differents networks
    let ethUsdPriceFeedAddress // created variable to use same code for multiple network options
    // to set up chainID - created helper-hardhat-config - using aave library
    if (chainId == 31337) {
        // chainId 31337 = local hardhat network
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        // gets the most recent deployment
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
        // gets API key on helper-hardhat-config script
    }
    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer, // gets namedAccounts
        args: args, // get PriceFeedAddress to convert value
        log: true, // will console log all data from deployment
        waitConfirmations: network.config.blockConfirmations || 1,
        //
    })
    // check if deploy is already on blockchain
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args) // verify comes from utils/verify.js
    }
    log("_________________________")
}

module.exports.tags = ["all", "FundMe"]
