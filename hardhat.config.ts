import "@nomiclabs/hardhat-ethers"
import "@nomiclabs/hardhat-waffle"
import "@typechain/hardhat"
import "hardhat-dependency-compiler"
import "hardhat-deploy"
import "hardhat-gas-reporter"
import { HardhatUserConfig } from "hardhat/config"
import { config as dotenvConfig } from "dotenv"
import "solidity-coverage"
import { resolve } from "path"
import "@matterlabs/hardhat-zksync-solc"

dotenvConfig({ path: resolve(__dirname, "./.env") })

const config: HardhatUserConfig = {
    solidity: {
        version: "0.7.6",
        settings: {
            optimizer: { enabled: true, runs: 200 },
            evmVersion: "berlin",
            // for smock to mock contracts
            outputSelection: {
                "*": {
                    "*": ["storageLayout"],
                },
            },
        },
    },
    zksolc: {
        version: "0.1.0",
        compilerSource: "docker",
        settings: {
            optimizer: {
                enabled: true,
            },
            experimental: {
                dockerImage: "matterlabs/zksolc",
            },
        },
    },
    namedAccounts: {
        deployer: 0,
    },
    networks: {
        hardhat: {
            allowUnlimitedContractSize: true,
        },
    },
    dependencyCompiler: {
        // We have to compile from source since UniswapV3 doesn't provide artifacts in their npm package
        // paths: [
        //     "@uniswap/v3-core/contracts/UniswapV3Factory.sol",
        //     "@uniswap/v3-core/contracts/UniswapV3Pool.sol",
        // ],
    },
    gasReporter: {
        enabled: true,
    },
}

if (process.env.TESTNET_PRIVATE_KEY) {
    if (process.env.INFURA_PROJECT_ID) {
        config.networks.rinkeby = {
            url: "https://rinkeby.infura.io/v3/" + process.env.INFURA_PROJECT_ID,
            accounts: [process.env.TESTNET_PRIVATE_KEY],
            gasMultiplier: 2,
        }
    }

    config.networks.mumbai = {
        url: "https://rpc-mumbai.maticvigil.com",
        accounts: [process.env.TESTNET_PRIVATE_KEY],
        gasMultiplier: 2,
    }

    config.networks.fuji = {
        url: "https://api.avax-test.network/ext/bc/C/rpc",
        accounts: [process.env.TESTNET_PRIVATE_KEY],
        gasMultiplier: 2,
    }

    config.networks.shibuya = {
        url: "https://evm.shibuya.astar.network",
        chainId: 81,
        accounts: [process.env.TESTNET_PRIVATE_KEY],
        gasMultiplier: 2,
        verify: {
            etherscan: {
                apiUrl: "https://blockscout.com/shibuya",
            },
        },
    }

    config.networks.zksync2_testnet = {
        url: "https://zksync2-testnet.zksync.dev",
        chainId: 280,
        accounts: [process.env.TESTNET_PRIVATE_KEY],
        gasMultiplier: 2,
        verify: {
            etherscan: {
                apiUrl: "https://zksync2-testnet.zkscan.io/",
            },
        },
        zksync: true,
    }
}

export default config
