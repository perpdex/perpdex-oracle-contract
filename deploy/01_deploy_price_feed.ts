import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { parseEther } from "ethers/lib/utils"

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, getChainId } = hre
    const { deploy, execute } = deployments
    const { deployer } = await getNamedAccounts()

    const configs = {
        "31337": [ // hardhat (ETH mainnet)
            {
                contract: 'ChainlinkPriceFeed',
                symbol: 'ETHUSD',
                args: ['0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419']
            }
        ],
        "4": [ // ETH rinkeby
            {
                contract: 'ChainlinkPriceFeed',
                symbol: 'ETHUSD',
                args: ['0x8A753747A1Fa494EC906cE90E9f37563A8AF630e']
            },
            {
                contract: 'ChainlinkPriceFeed',
                symbol: 'BTCUSD',
                args: ['0xECe365B379E1dD183B20fc5f022230C044d51404']
            },
            {
                contract: 'ChainlinkPriceFeed',
                symbol: 'MATICUSD',
                args: ['0x7794ee502922e2b723432DDD852B3C30A911F021']
            },
            {
                contract: 'ChainlinkPriceFeed',
                symbol: 'LINKUSD',
                args: ['0xd8bD0a1cB028a31AA859A21A3758685a95dE4623']
            },
        ],
        "80001": [ // ETH mumbai
            {
                contract: 'ChainlinkPriceFeed',
                symbol: 'ETHUSD',
                args: ['0x0715A7794a1dc8e42615F059dD6e406A6594651A']
            }
        ],
        "43113": [ // AVAX fuji
            {
                contract: 'ChainlinkPriceFeed',
                symbol: 'AVAXUSD',
                args: ['0x0A77230d17318075983913bC2145DB16C7366156']
            }
        ]
    }[await getChainId()]

    for (let i = 0; i < configs.length; i++) {
        const config = configs[i]
        await deploy(config.contract + config.symbol, {
            contract: config.contract,
            from: deployer,
            args: config.args,
            log: true,
            autoMine: true,
        })
    }
}

export default func
func.tags = ["price_feed"]
