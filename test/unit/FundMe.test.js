const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")

describe("FundMe", async function () {
    // variables to be used inside tests functions
    let fundMe
    let deployer
    let mockV3Aggregator
    const sendValue = ethers.utils.parseEther("1") // equals to 1000000000000000000

    beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        fundMe = await ethers.getContract("FundMe")
        mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        )
    })
    // start of test on deployment of smart contract

    describe("constructor", async function () {
        it("sets the aggregator address correctly", async function () {
            const response = await fundMe.priceFeed()
            assert.equal(response, mockV3Aggregator.address)
        })
    })
    // test constructor smart contract, in this case check if priceFeed is working with V3Aggregator

    describe("fund", async function () {
        it("Fails if amount of ETH is under 50USD", async function () {
            await expect(fundMe.fund()).to.be.revertedWith(
                "You need to spend more ETH!"
            )
        })
        // check if amount send by donator is more than 50usd
        it("updated amount funded", async function () {
            await fundMe.fund({ value: sendValue })
            const response = await fundMe.addressToAmountFunded(deployer)
            assert.equal(response.toString(), sendValue.toString())
        })
        // check if value can be sent by donator to smart contract
        it("address fund to array funders", async function () {
            await fundMe.fund({ value: sendValue })
            const funder = await fundMe.funders(0)
            assert.equal(funder, deployer)
        })
        // check if donator is pushed to funders array
    })

    describe("withdraw", async function () {
        // before the withdraw test sending value to smart contract funds
        beforeEach(async function () {
            await fundMe.fund({ value: sendValue })
        })

        it("withdraw ETH single funder", async function () {
            // get smart contract balance
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            // get deployer  balance
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )
            // action - withdraw balance
            const transactionResponse = await fundMe.withdraw()
            // action - get receipt of transaction as soon 1 block confirmed transaction
            const transactionReceipt = await transactionResponse.wait(1)
            // to check gasUSed and effectiveGasPrice you can access those using vs code
            // debug tool, check transacatio receipt and pull out those variables
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice) // mull is used to sum variables as they are BigNumbers
            // get smart contract balance after withdraw
            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            // get deployer balance after withdraw
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            assert.equal(endingFundMeBalance, 0) // check if all fund were withdraw

            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(), // bignumber
                endingDeployerBalance.add(gasCost).toString() // add gas cost to ending balance
            )
        })
    })
})
