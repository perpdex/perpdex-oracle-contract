import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { parseEther } from "ethers/lib/utils"

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, getChainId } = hre
    const { deploy, execute } = deployments
    const { deployer } = await getNamedAccounts()

    const chainlinkAddress = {
        "31337": "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419", // ETH(mainnet) hardhat
        "4": "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e", // ETH rinkeby
        "80001": "0x0715A7794a1dc8e42615F059dD6e406A6594651A", // ETH mumbai
        "43113": "0x0A77230d17318075983913bC2145DB16C7366156", // AVAX fuji
    }[await getChainId()]

    const chainlinkSymbol = {
        "31337": 'ETHUSD', // ETH(mainnet) hardhat
        "4": "ETHUSD", // ETH rinkeby
        "80001": 'ETHUSD', // ETH mumbai
        "43113": "AVAXUSD", // AVAX fuji
    }[await getChainId()]

    await deploy("ChainlinkPriceFeed" + chainlinkSymbol, {
        contract: 'ChainlinkPriceFeed',
        from: deployer,
        args: [chainlinkAddress],
        log: true,
        autoMine: true,
    })
}

export default func
func.tags = ["ChainlinkPriceFeed"]
