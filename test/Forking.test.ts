import { expect } from "chai";
import { ethers } from "hardhat";
import { TryUniswap } from "../typechain";

const VITALIK_ADDR = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
const TRY_UNISWAP_ADDRESS = "0x986aaa537b8cc170761FDAC6aC4fc7F9d8a20A8";

const getBalance = ethers.provider.getBalance;

describe("Forking", () => {
    let tryUniswap: TryUniswap;

    beforeEach(async () => {
        tryUniswap = await ethers.getContractAt("TryUniswap", TRY_UNISWAP_ADDRESS)
    });

    it("Iteracts with the forked mainnet", async () => {
        console.log("TryUniswap address: ", tryUniswap.address);
    })
})