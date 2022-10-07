// deploy mocks is created to simulate the behavior of AgreggatorV3 (conversion of ethers into USD) in a local network in this case hardhat network
// as deploy-mocks will be used locally - created a smart contract for test purpose - MockV3Aggregator.sol
const { network } = require("hardhat") // network used will be locally from hardhat
const {
    developmentChain,
    DECIMALS,
    INITIAL_ANSWER,
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    if (developmentChain.includes(network.name)) {
        log("Local network detected! Deploying mocks...")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER], // variables set in mockV3 constructor
        })
        log("Mocks deployed")
        log("__________________________________________")
    }
}

module.exports.tags = ["all", "mocks"]
// it will create a tag on hardhat deploy allowing you to pick deploy in all networks or just locally
