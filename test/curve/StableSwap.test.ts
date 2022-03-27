import { Contract } from "ethers";
import { ethers, deployments } from "hardhat";
import { getERC20Balance, toUnit } from "../../utils";
import { getTokens, ITokens } from "../../utils/tokens";
import { getWhales, IWhales } from "../../utils/whales";

describe.skip("Curve.fi", () => {
  let tokens: ITokens;
  let whales: IWhales;

  let curve: Contract;

  beforeEach(async () => {
    await deployments.fixture("TryCurveVy");

    curve = await ethers.getContract("TryCurveVy");
    tokens = await getTokens();
    whales = await getWhales();
  });

  describe("3Pool StableSwap", async () => {
    it("works", async () => {
      const before = await getERC20Balance(
        tokens.usdc,
        curve.address,
        "USDC",
        18
      );
      console.log("before", before);

      await tokens.dai.transfer(curve.address, toUnit(10));
      await curve.swap(0, 1);

      const after = await getERC20Balance(
        tokens.usdc,
        curve.address,
        "USDC",
        18
      );
      console.log("after", after);
    });
  });
});
