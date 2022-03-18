import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, deployments } from "hardhat";
import { IERC20, TryUniswap } from "../../typechain";
import {
  impersonateSigner,
  getIERC20,
  tokens,
  whales,
  toUnit,
  fromUnit,
  getERC20Balance,
} from "../../utils";

describe("UniswapV2", () => {
  let tryUniswap: TryUniswap;

  let wbtc: IERC20;
  let dai: IERC20;

  let wbtcWhale: SignerWithAddress;
  let daiWhale: SignerWithAddress;

  beforeEach(async () => {
    await deployments.fixture(["Uniswap"]);

    tryUniswap = await ethers.getContract("TryUniswap");

    wbtc = await getIERC20(tokens.WBTC);
    dai = await getIERC20(tokens.DAI);

    wbtcWhale = await impersonateSigner(whales.WBTC_WHALE);
    daiWhale = await impersonateSigner(whales.DAI_WHALE);

    const deployer = await ethers.getNamedSigner("deployer");

    await wbtc.connect(wbtcWhale).approve(tryUniswap.address, toUnit(1000, 8));
    await dai.connect(daiWhale).approve(tryUniswap.address, toUnit(1000));
  });

  it("gets output amount", async () => {
    const amount = await tryUniswap
      .connect(wbtcWhale)
      .getAmountOutMin(wbtc.address, dai.address, toUnit(1, 8));

    const amountDai = fromUnit(amount, 18);
    console.log("%s WBTC ~> %s DAI", "1", amountDai);
  });

  it("transfers WBTC", async () => {
    const { deployer, user } = await ethers.getNamedSigners();
    await wbtc.connect(wbtcWhale).approve(deployer.address, toUnit(1000, 8));
    const balanceBefore = await getERC20Balance(wbtc, user.address, "WBTC", 8);
    console.log("🚀 ~ balanceBefore", balanceBefore);
    const tx = await wbtc
      .connect(deployer)
      .transferFrom(wbtcWhale.address, user.address, toUnit(1, 8));

    await tx.wait();
    const balanceAfter = await getERC20Balance(wbtc, user.address, "WBTC", 8);
    console.log("🚀 ~ balanceAfter", balanceAfter);
  });

  it("swaps WBTC for DAI", async () => {
    const user = await ethers.getNamedSigner("user");

    const balanceBefore = await getERC20Balance(dai, user.address, "DAI", 18);
    console.log("🚀 ~ balanceBefore", balanceBefore);

    const tx = await tryUniswap
      .connect(wbtcWhale)
      .swap(
        wbtc.address,
        dai.address,
        toUnit(1, 8),
        toUnit(30000, 18),
        user.address
      );

    await tx.wait();

    const balanceAfter = await getERC20Balance(dai, user.address, "DAI", 18);
    console.log("🚀 ~ balanceAfter", balanceAfter);
  });
});
