const { networkConfig, developmentChain } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../utils/verify")

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
    let ethUsdPriceFeedAddress
    if (chainId == 31337) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (
        !developmentChain.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }
    log("_________________________")
}

module.exports.tags = ["all", "fundme"]
