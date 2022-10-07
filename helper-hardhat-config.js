// helper-hardhat-config will set up api-key for every network we will work with in this case Goerli

const networkConfig = {
    5: {
        name: "goerli", // set up name of network
        ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
        // set up address API key to make convertion work into our program
    },
}

const developmentChain = ["hardhat", "localhost"]
const DECIMALS = 8
const INITIAL_ANSWER = 200000000000

// exports network config to others scripts - check deploy-fundMe
module.exports = {
    networkConfig,
    developmentChain,
    DECIMALS,
    INITIAL_ANSWER,
}
