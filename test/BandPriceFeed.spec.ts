import { MockContract, smock } from "@defi-wonderland/smock"
import { expect } from "chai"
import { parseEther } from "ethers/lib/utils"
import { ethers, waffle } from "hardhat"
import { BandPriceFeed, TestStdReference, TestStdReference__factory } from "../typechain"

interface BandPriceFeedFixture {
    bandPriceFeed: BandPriceFeed
    bandReference: MockContract<TestStdReference>
    baseAsset: string
}

async function bandPriceFeedFixture(): Promise<BandPriceFeedFixture> {
    const testStdReferenceFactory = await smock.mock<TestStdReference__factory>("TestStdReference")
    const testStdReference = await testStdReferenceFactory.deploy()

    const baseAsset = "ETH"
    const bandPriceFeedFactory = await ethers.getContractFactory("BandPriceFeed")
    const bandPriceFeed = (await bandPriceFeedFactory.deploy(testStdReference.address, baseAsset)) as BandPriceFeed

    return { bandPriceFeed, bandReference: testStdReference, baseAsset }
}

describe("BandPriceFeed/CumulativeTwap Spec", () => {
    const [admin] = waffle.provider.getWallets()
    const loadFixture: ReturnType<typeof waffle.createFixtureLoader> = waffle.createFixtureLoader([admin])
    let bandPriceFeed: BandPriceFeed
    let bandReference: MockContract<TestStdReference>
    let currentTime: number
    let roundData: any[]

    async function updatePrice(price: number, forward: boolean = true): Promise<void> {
        roundData.push([parseEther(price.toString()), currentTime, currentTime])
        bandReference.getReferenceData.returns(() => {
            return roundData[roundData.length - 1]
        })

        if (forward) {
            currentTime += 15
            await ethers.provider.send("evm_setNextBlockTimestamp", [currentTime])
            await ethers.provider.send("evm_mine", [])
        }
    }

    beforeEach(async () => {
        const _fixture = await loadFixture(bandPriceFeedFixture)
        bandReference = _fixture.bandReference
        bandPriceFeed = _fixture.bandPriceFeed
        roundData = []
    })

    describe("getPrice", () => {
        beforeEach(async () => {
            // `base` = now - _interval
            // bandReference's answer
            // timestamp(base + 0)  : 400
            // timestamp(base + 15) : 405
            // timestamp(base + 30) : 410
            // now = base + 45
            //
            //  --+------+-----+-----+-----+-----+-----+
            //          base                          now
            const latestTimestamp = (await waffle.provider.getBlock("latest")).timestamp
            currentTime = latestTimestamp

            await updatePrice(400)
            await updatePrice(405)
            await updatePrice(410)
        })

        it("return latest price", async () => {
            const price = await bandPriceFeed.getPrice()
            expect(price).to.eq(parseEther("410"))
        })
    })
})
