import { ethers } from "hardhat"
import IUniswapV2Pair from "@uniswap/v2-core/build/IUniswapV2Pair.json"
import IUniswapV2Factory from "@uniswap/v2-core/build/IUniswapV2Factory.json"
import IUniswapV2Router02 from "@uniswap/v2-periphery/build/IUniswapV2Router02.json"

async function main() {
    // zksync testnet
    const routerAddress = "0x82Ec84c7368bb9089E1077c6e1703675c35A4237"
    const usdcAddress = "0x54a14D7559BAF2C8e8Fa504E019d32479739018c"
    const wethAddress = "0xB4fbFB7807C31268Dc1ac8c26fA4ef41115d0ece"

    const [signer] = await ethers.getSigners()
    const router = new ethers.Contract(routerAddress, IUniswapV2Router02.abi, signer)
    const factoryAddress = await router.factory()
    console.log("factory address: " + factoryAddress)

    const factory = new ethers.Contract(factoryAddress, IUniswapV2Factory.abi, signer)
    const pairAddress = await factory.getPair(wethAddress, usdcAddress)
    console.log("pair address: " + pairAddress)

    const pair = new ethers.Contract(pairAddress, IUniswapV2Pair.abi, signer)
    console.log("token0 address: " + (await pair.token0()))
    console.log("token1 address: " + (await pair.token1()))
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })
