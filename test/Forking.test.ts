import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, deployments } from "hardhat";
import { IERC20, TryUniswap } from "../typechain";
import {
  impersonateSigner,
  getIERC20,
  tokens,
  whales,
  getBalance,
  toUnit,
  fromUnit,
  getERC20Balance,
} from "../utils";

describe("Forking", () => {
  let tryUniswap: TryUniswap;

  let weth: IERC20;
  let wbtc: IERC20;
  let dai: IERC20;

  let wethWhale: SignerWithAddress;
  let wbtcWhale: SignerWithAddress;
  let daiWhale: SignerWithAddress;

  beforeEach(async () => {
    await deployments.fixture(["Uniswap"]);

    tryUniswap = await ethers.getContract("TryUniswap");

    weth = await getIERC20(tokens.WETH);
    wbtc = await getIERC20(tokens.WBTC);
    dai = await getIERC20(tokens.DAI);

    wethWhale = await impersonateSigner(whales.WETH_WHALE);
    wbtcWhale = await impersonateSigner(whales.WBTC_WHALE);
    daiWhale = await impersonateSigner(whales.DAI_WHALE);

    const deployer = await ethers.getNamedSigner("deployer");

    await weth.connect(wethWhale).approve(tryUniswap.address, toUnit(4, 18));
    await wbtc.connect(wbtcWhale).approve(tryUniswap.address, toUnit(1000, 8));
    await wbtc.connect(wbtcWhale).approve(deployer.address, toUnit(10, 8));
    await dai.connect(daiWhale).approve(tryUniswap.address, toUnit(1000));
  });

  it("interacts with the forked mainnet", async () => {
    console.log("TryUniswap contract address: ", tryUniswap.address);

    const wethBalance = await getBalance(wethWhale.address, "WETH", 18);
    console.log("%s : %s", wethWhale.address, wethBalance);

    const wbtcBalance = await getBalance(wbtcWhale.address, "WBTC", 8);
    console.log("%s : %s", wbtcWhale.address, wbtcBalance);

    const daiBalance = await getBalance(daiWhale.address, "DAI", 18);
    console.log("%s : %s", daiWhale.address, daiBalance);
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
        toUnit(40000, 18),
        user.address
      );

    await tx.wait();

    const balanceAfter = await getERC20Balance(dai, user.address, "DAI", 18);
    console.log("🚀 ~ balanceAfter", balanceAfter);
  });
});
