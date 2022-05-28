import { MockContract, smock } from "@defi-wonderland/smock"
import { expect } from "chai"
import { parseEther } from "ethers/lib/utils"
import { ethers, waffle } from "hardhat"
import { DiaPriceFeed, TestDIAOracleV2, TestDIAOracleV2__factory } from "../typechain"

interface DiaPriceFeedFixture {
    diaPriceFeed: DiaPriceFeed
    diaOracleV2: MockContract<TestDIAOracleV2>
    oracleKey: string
}

async function diaPriceFeedFixture(): Promise<DiaPriceFeedFixture> {
    const testDIAOracleV2Factory = await smock.mock<TestDIAOracleV2__factory>("TestDIAOracleV2")
    const testDIAOracleV2 = await testDIAOracleV2Factory.deploy()

    const oracleKey = "ETH/USD"
    const diaPriceFeedFactory = await ethers.getContractFactory("DiaPriceFeed")
    const diaPriceFeed = (await diaPriceFeedFactory.deploy(testDIAOracleV2.address, oracleKey)) as DiaPriceFeed

    return { diaPriceFeed, diaOracleV2: testDIAOracleV2, oracleKey }
}

describe("DiaPriceFeed Spec", () => {
    const [admin] = waffle.provider.getWallets()
    const loadFixture: ReturnType<typeof waffle.createFixtureLoader> = waffle.createFixtureLoader([admin])
    let diaPriceFeed: DiaPriceFeed
    let diaOracleV2: MockContract<TestDIAOracleV2>
    let currentTime: number
    let roundData: any[]

    async function updatePrice(price: number, forward: boolean = true): Promise<void> {
        roundData.push([parseEther(price.toString()), currentTime])
        diaOracleV2.getValue.returns(() => {
            return roundData[roundData.length - 1]
        })

        if (forward) {
            currentTime += 15
            await ethers.provider.send("evm_setNextBlockTimestamp", [currentTime])
            await ethers.provider.send("evm_mine", [])
        }
    }

    async function setCurrentTimeToLatest() {
        const latestTimestamp = (await waffle.provider.getBlock("latest")).timestamp
        currentTime = latestTimestamp
    }

    beforeEach(async () => {
        const _fixture = await loadFixture(diaPriceFeedFixture)
        diaOracleV2 = _fixture.diaOracleV2
        diaPriceFeed = _fixture.diaPriceFeed
        roundData = []
    })

    describe("decimals", () => {
        it("return 8", async () => {
            expect(await diaPriceFeed.decimals()).to.be.eq(8)
        })
    })

    describe("getPrice", () => {
        describe("when price is not updated yet", () => {
            it("revert with DPF_TZ", async () => {
                await expect(diaPriceFeed.getPrice()).to.be.revertedWith("DPF_TZ")
            })
        })

        describe("when price <= 0 ", () => {
            beforeEach(async () => {
                await setCurrentTimeToLatest()
                await updatePrice(0, false)
            })
            it("revert with DPF_IP", async () => {
                await expect(diaPriceFeed.getPrice()).to.be.revertedWith("DPF_IP")
            })
        })

        describe("when price is updated", () => {
            beforeEach(async () => {
                await setCurrentTimeToLatest()
                await updatePrice(400, false)
            })
            it("return spot price", async () => {
                expect(await diaPriceFeed.getPrice()).to.eq(parseEther("400"))
            })
        })
    })
})
