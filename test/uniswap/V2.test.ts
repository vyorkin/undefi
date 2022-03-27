import { ethers, deployments } from "hardhat";
import { TryUniswap } from "../../typechain";
import {
  toUnit,
  fromUnit,
  getERC20Balance,
  getBalance,
  toWei,
} from "../../utils";
import { getTokens, ITokens } from "../../utils/tokens";
import { getWhales, IWhales } from "../../utils/whales";

describe("UniswapV2", () => {
  let tryUniswap: TryUniswap;
  let tokens: ITokens;
  let whales: IWhales;

  beforeEach(async () => {
    await deployments.fixture("Uniswap");

    tryUniswap = await ethers.getContract("TryUniswap");
    tokens = await getTokens();
    whales = await getWhales();

    await tokens.wbtc
      .connect(whales.wbtc)
      .approve(tryUniswap.address, toUnit(1000, 8));
    await tokens.weth
      .connect(whales.weth)
      .approve(tryUniswap.address, toUnit(1000));
    await tokens.dai
      .connect(whales.dai)
      .approve(tryUniswap.address, toUnit(1000));
  });

  it("gets output amount", async () => {
    const amount = await tryUniswap
      .connect(whales.wbtc)
      .getAmountOutMin(tokens.wbtc.address, tokens.dai.address, toUnit(1, 8));

    const amountDai = fromUnit(amount, 18);
    console.log("1 WBTC ~> %s DAI", amountDai);
  });

  it("transfers WBTC", async () => {
    const { deployer, user } = await ethers.getNamedSigners();

    await tokens.wbtc
      .connect(whales.wbtc)
      .approve(deployer.address, toUnit(1000, 8));

    const balanceBefore = await getERC20Balance(
      tokens.wbtc,
      user.address,
      "WBTC",
      8
    );
    console.log("balanceBefore", balanceBefore);

    const tx = await tokens.wbtc
      .connect(deployer)
      .transferFrom(whales.wbtc.address, user.address, toUnit(1, 8));

    await tx.wait();
    const balanceAfter = await getERC20Balance(
      tokens.wbtc,
      user.address,
      "WBTC",
      8
    );
    console.log("balanceAfter", balanceAfter);
  });

  it("swaps WBTC for DAI", async () => {
    const user = await ethers.getNamedSigner("user");

    const balanceBefore = await getERC20Balance(
      tokens.dai,
      user.address,
      "DAI",
      18
    );
    console.log("balanceBefore", balanceBefore);

    const tx = await tryUniswap
      .connect(whales.wbtc)
      .swap(
        tokens.wbtc.address,
        tokens.dai.address,
        toUnit(1, 8),
        toUnit(30000, 18),
        user.address
      );

    await tx.wait();

    const balanceAfter = await getERC20Balance(
      tokens.dai,
      user.address,
      "DAI",
      18
    );
    console.log("balanceAfter", balanceAfter);
  });

  describe("liquidity", () => {
    beforeEach(async () => {
      const { deployer, user } = await ethers.getNamedSigners();
      await deployer.sendTransaction({ to: user.address, value: toWei(100) });
      await tokens.weth
        .connect(whales.weth)
        .transfer(user.address, toUnit(100));
      await tokens.dai.connect(whales.dai).transfer(user.address, toUnit(100));
    });

    it("adds and removes liquidity", async () => {
      async function printLogs() {
        const logEvent = tryUniswap.filters.Log(null, null);
        const events = await tryUniswap.queryFilter(logEvent);
        for (const e of events) {
          console.log(`${e.args.message}: ${fromUnit(e.args.val)}`);
        }
      }

      const user = await ethers.getNamedSigner("user");
      const ethBalance = await getBalance(user.address, "ETH");
      console.log("ethBalance", ethBalance);
      const wethBalance = await getERC20Balance(
        tokens.weth,
        user.address,
        "WETH"
      );
      console.log("wethBalance", wethBalance);
      const daiBalance = await getERC20Balance(tokens.dai, user.address, "DAI");
      console.log("daiBalance", daiBalance);

      await tokens.weth.connect(user).approve(tryUniswap.address, toUnit(20));
      await tokens.dai.connect(user).approve(tryUniswap.address, toUnit(20));

      await tryUniswap
        .connect(user)
        .addLiquidity(
          tokens.weth.address,
          tokens.dai.address,
          toUnit(10),
          toUnit(10)
        );
      await printLogs();
      await tryUniswap
        .connect(user)
        .removeLiquidity(tokens.weth.address, tokens.dai.address);
      await printLogs();
    });
  });
});
