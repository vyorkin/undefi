import { ethers, deployments } from "hardhat";
import { TryUniswap } from "../../typechain";
import { getBalance } from "../../utils";
import { getTokens, ITokens } from "../../utils/tokens";
import { getWhales, IWhales } from "../../utils/whales";

describe("Forking", () => {
  let tryUniswap: TryUniswap;

  let tokens: ITokens;
  let whales: IWhales;

  beforeEach(async () => {
    await deployments.fixture(["Uniswap"]);

    tryUniswap = await ethers.getContract("TryUniswap");

    tokens = await getTokens();
    whales = await getWhales();
  });

  it("interacts with the forked mainnet", async () => {
    console.log("TryUniswap contract address: ", tryUniswap.address);

    const wethBalance = await getBalance(whales.weth.address, "WETH", 18);
    console.log("%s : %s", whales.weth.address, wethBalance);
    const wbtcBalance = await getBalance(whales.wbtc.address, "WBTC", 8);
    console.log("%s : %s", whales.wbtc.address, wbtcBalance);
    const daiBalance = await getBalance(whales.dai.address, "DAI", 18);
    console.log("%s : %s", whales.dai.address, daiBalance);
  });
});
