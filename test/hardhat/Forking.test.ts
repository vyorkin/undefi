import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, deployments } from "hardhat";
import { IERC20, TryUniswap } from "../../typechain";
import {
  impersonateSigner,
  getIERC20,
  tokens,
  whales,
  getBalance,
  toUnit,
} from "../../utils";

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
});
