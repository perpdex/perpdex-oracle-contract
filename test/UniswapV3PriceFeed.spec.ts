import { FakeContract, smock } from "@defi-wonderland/smock"
import bn from "bignumber.js"
import { expect } from "chai"
import { BigNumber, BigNumberish } from "ethers"
import { parseEther } from "ethers/lib/utils"
import { ethers, waffle } from "hardhat"
import { UniswapV3Pool, UniswapV3PriceFeed } from "../typechain"

interface UniswapV3PriceFeedFixture {
    UniswapV3PriceFeed: UniswapV3PriceFeed
    uniswapV3Pool: FakeContract<UniswapV3Pool>
}

async function UniswapV3PriceFeedFixture(): Promise<UniswapV3PriceFeedFixture> {
    const uniswapV3Pool = await smock.fake<UniswapV3Pool>("UniswapV3Pool")

    const UniswapV3PriceFeedFactory = await ethers.getContractFactory("UniswapV3PriceFeed")
    const UniswapV3PriceFeed = (await UniswapV3PriceFeedFactory.deploy(uniswapV3Pool.address)) as UniswapV3PriceFeed

    return { UniswapV3PriceFeed, uniswapV3Pool }
}

describe("UniswapV3PriceFeed Spec", () => {
    const [admin] = waffle.provider.getWallets()
    const loadFixture: ReturnType<typeof waffle.createFixtureLoader> = waffle.createFixtureLoader([admin])
    let UniswapV3PriceFeed: UniswapV3PriceFeed
    let uniswapV3Pool: FakeContract<UniswapV3Pool>

    beforeEach(async () => {
        const _fixture = await loadFixture(UniswapV3PriceFeedFixture)
        UniswapV3PriceFeed = _fixture.UniswapV3PriceFeed
        uniswapV3Pool = _fixture.uniswapV3Pool
    })

    describe("decimals", () => {
        it("return 18", async () => {
            expect(await UniswapV3PriceFeed.decimals()).to.be.eq(18)
        })
    })

    describe("getPrice", () => {
        it("return current market price", async () => {
            const marketPrice = 100
            uniswapV3Pool.slot0.returns([encodePriceSqrtX96(marketPrice, 1), 0, 0, 0, 0, 0, false])

            const indexPrice = await UniswapV3PriceFeed.getPrice()
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
