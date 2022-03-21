import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
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
  getBalance,
  toWei,
} from "../../utils";

describe("UniswapV2", () => {
  let tryUniswap: TryUniswap;

  let wbtc: IERC20;
  let weth: IERC20;
  let dai: IERC20;

  let wbtcWhale: SignerWithAddress;
  let wethWhale: SignerWithAddress;
  let daiWhale: SignerWithAddress;

  beforeEach(async () => {
    await deployments.fixture("Uniswap");

    tryUniswap = await ethers.getContract("TryUniswap");

    wbtc = await getIERC20(tokens.WBTC);
    weth = await getIERC20(tokens.WETH);
    dai = await getIERC20(tokens.DAI);

    wbtcWhale = await impersonateSigner(whales.WBTC_WHALE);
    wethWhale = await impersonateSigner(whales.WETH_WHALE);
    daiWhale = await impersonateSigner(whales.DAI_WHALE);

    await wbtc.connect(wbtcWhale).approve(tryUniswap.address, toUnit(1000, 8));
    await weth.connect(wethWhale).approve(tryUniswap.address, toUnit(1000));
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

  describe("liquidity", () => {
    beforeEach(async () => {
      const { deployer, user } = await ethers.getNamedSigners();
      await deployer.sendTransaction({ to: user.address, value: toWei(100) });
      await weth.connect(wethWhale).transfer(user.address, toUnit(100));
      await dai.connect(daiWhale).transfer(user.address, toUnit(100));
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
      console.log("🚀 ~ ethBalance", ethBalance);
      const wethBalance = await getERC20Balance(weth, user.address, "WETH");
      console.log("🚀 ~ wethBalance", wethBalance);
      const daiBalance = await getERC20Balance(dai, user.address, "DAI");
      console.log("🚀 ~ daiBalance", daiBalance);

      await weth.connect(user).approve(tryUniswap.address, toUnit(20));
      await dai.connect(user).approve(tryUniswap.address, toUnit(20));

      await tryUniswap
        .connect(user)
        .addLiquidity(weth.address, dai.address, toUnit(10), toUnit(10));
      await printLogs();
      await tryUniswap.connect(user).removeLiquidity(weth.address, dai.address);
      await printLogs();
    });
  });
});
