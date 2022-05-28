import { FakeContract, smock } from "@defi-wonderland/smock"
import bn from "bignumber.js"
import { expect } from "chai"
import { BigNumber, BigNumberish } from "ethers"
import { parseEther } from "ethers/lib/utils"
import { ethers, waffle } from "hardhat"
import { EmergencyPriceFeed, UniswapV3Pool } from "../typechain"

interface EmergencyPriceFeedFixture {
    emergencyPriceFeed: EmergencyPriceFeed
    uniswapV3Pool: FakeContract<UniswapV3Pool>
}

async function emergencyPriceFeedFixture(): Promise<EmergencyPriceFeedFixture> {
    const uniswapV3Pool = await smock.fake<UniswapV3Pool>("UniswapV3Pool")

    const emergencyPriceFeedFactory = await ethers.getContractFactory("EmergencyPriceFeed")
    const emergencyPriceFeed = (await emergencyPriceFeedFactory.deploy(uniswapV3Pool.address)) as EmergencyPriceFeed

    return { emergencyPriceFeed, uniswapV3Pool }
}

describe("EmergencyPriceFeed Spec", () => {
    const [admin] = waffle.provider.getWallets()
    const loadFixture: ReturnType<typeof waffle.createFixtureLoader> = waffle.createFixtureLoader([admin])
    let emergencyPriceFeed: EmergencyPriceFeed
    let uniswapV3Pool: FakeContract<UniswapV3Pool>

    beforeEach(async () => {
        const _fixture = await loadFixture(emergencyPriceFeedFixture)
        emergencyPriceFeed = _fixture.emergencyPriceFeed
        uniswapV3Pool = _fixture.uniswapV3Pool
    })

    describe("decimals", () => {
        it("return 18", async () => {
            expect(await emergencyPriceFeed.decimals()).to.be.eq(18)
        })
    })

    describe("getPrice", () => {
        it("return current market price", async () => {
            const marketPrice = 100
            uniswapV3Pool.slot0.returns([encodePriceSqrtX96(marketPrice, 1), 0, 0, 0, 0, 0, false])

            const indexPrice = await emergencyPriceFeed.getPrice()
            expect(indexPrice).to.be.eq(parseEther(marketPrice.toString()))
        })
    })
})

bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 })

export function encodePriceSqrtX96(reserve1: BigNumberish, reserve0: BigNumberish): BigNumber {
    return BigNumber.from(
        new bn(reserve1.toString())
            .div(reserve0.toString())
            .sqrt()
            .multipliedBy(new bn(2).pow(96))
            .integerValue(3)
            .toString(),
    )
}
