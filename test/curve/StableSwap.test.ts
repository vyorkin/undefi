import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";
import { ethers, deployments } from "hardhat";
import { IERC20 } from "../../typechain";
import {
  getERC20Balance,
  getIERC20,
  impersonateSigner,
  tokens,
  toUnit,
  whales,
} from "../../utils";

describe.skip("Curve.fi", () => {
  let dai: IERC20;
  let usdc: IERC20;
  let usdt: IERC20;

  let daiWhale: SignerWithAddress;
  let usdcWhale: SignerWithAddress;
  let usdtWhale: SignerWithAddress;

  let curve: Contract;

  beforeEach(async () => {
    await deployments.fixture("TryCurveVy");

    dai = await getIERC20(tokens.DAI);
    usdc = await getIERC20(tokens.USDC);
    usdt = await getIERC20(tokens.USDT);

    daiWhale = await impersonateSigner(whales.DAI_WHALE);
    usdcWhale = await impersonateSigner(whales.USDC_WHALE);
    usdtWhale = await impersonateSigner(whales.USDT_WHALE);

    curve = await ethers.getContract("TryCurveVy");
  });

  describe("3Pool StableSwap", async () => {
    it("works", async () => {
      const before = await getERC20Balance(usdc, curve.address, "USDC", 18);
      console.log("before", before);

      await dai.transfer(curve.address, toUnit(10));
      await curve.swap(0, 1);

      const after = await getERC20Balance(usdc, curve.address, "USDC", 18);
      console.log("after", after);
    });
  });
});
