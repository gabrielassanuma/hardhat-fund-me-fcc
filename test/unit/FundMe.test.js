const { assert, expect } = require("chai")
const { deployments, ethers, network, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

// check if on deployment chain
!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
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
                  const response = await fundMe.getPriceFeed()
                  assert.equal(response, mockV3Aggregator.address)
              })
          })
          // test constructor smart contract, in this case check if getPriceFeed is working with V3Aggregator

          describe("fund", async function () {
              it("Fails if amount of ETH is under 50USD", async function () {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  )
              })
              // check if amount send by donator is more than 50usd
              it("updated amount funded", async function () {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer
                  )
                  assert.equal(response.toString(), sendValue.toString())
              })
              // check if value can be sent by donator to smart contract
              it("address fund to array getFunder", async function () {
                  await fundMe.fund({ value: sendValue })
                  const funder = await fundMe.getFunder(0)
                  assert.equal(funder, deployer)
              })
              // check if donator is pushed to getFunder array
          })

          describe("withdraw", async function () {
              // before the withdraw test sending value to smart contract funds
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue })
              })
              // test for a single funder withdraw
              it("withdraw ETH single funder", async function () {
                  // get smart contract balance
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  // get deployer  balance
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
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
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  assert.equal(endingFundMeBalance, 0) // check if all fund were withdraw

                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(), // bignumber
                      endingDeployerBalance.add(gasCost).toString() // add gas cost to ending balance
                  )
              })

              // test for withdraw with multiples getFunder
              it("withdraw with multiple getFunder", async function () {
                  const accounts = await ethers.getSigners()
                  // created multiples getFunder and sent value from this getFunder
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }
                  // get smart contract balance
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  // get deployer  balance
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  // repeated consts from single funder
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)
                  // repeated asserts from single funder
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  //repeated assert from single funder
                  assert.equal(endingFundMeBalance, 0) // check if all fund were withdraw

                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(), // bignumber
                      endingDeployerBalance.add(gasCost).toString() // add gas cost to ending balance
                  )
                  // check if getFunder array are reset properly
                  await expect(fundMe.getFunder(0)).to.be.reverted // check if array is empty, if not throw error
                  // check if withdraw all accounts - accounts should be zero
                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })
              it("only allows the owner to withdraw", async function () {
                  // get all signers from ethers
                  const accounts = ethers.getSigners()
                  // set account to don't match deployer address
                  const attacker = accounts[1]
                  // connect wallet on fundMe contract
                  const attackerConnectedContract = await fundMe.connect(
                      attacker
                  )
                  // if wallet is not deployer's wallet get reverted - error
                  await expect(attackerConnectedContract.withdraw()).to.be
                      .reverted
              })

              it("cheaper withdraw testing", async function () {
                  const accounts = await ethers.getSigners()
                  // created multiples getFunder and sent value from this getFunder
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }
                  // get smart contract balance
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  // get deployer  balance
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  // repeated consts from single funder
                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)
                  // repeated asserts from single funder
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  //repeated assert from single funder
                  assert.equal(endingFundMeBalance, 0) // check if all fund were withdraw

                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(), // bignumber
                      endingDeployerBalance.add(gasCost).toString() // add gas cost to ending balance
                  )
                  // check if getFunder array are reset properly
                  await expect(fundMe.getFunder(0)).to.be.reverted // check if array is empty, if not throw error
                  // check if withdraw all accounts - accounts should be zero
                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })
          })
      })
