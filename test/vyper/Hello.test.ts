import { expect } from "chai";
import { deployments, ethers } from "hardhat";

describe("Hello", () => {
  it("works ", async () => {
    await deployments.fixture("Hello");
    const deployer = await ethers.getNamedSigner("deployer");

    const hello = await ethers.getContract("Hello");
    const r = await hello.extFn(2);

    console.log("r: ", r.toString());
  });
});
