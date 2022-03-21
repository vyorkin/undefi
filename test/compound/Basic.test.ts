import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import { ethers, deployments } from "hardhat";
import { CERC20, IERC20, TryCompound } from "../../typechain";
import {
  fromUnit,
  getIERC20,
  impersonateSigner,
  mine,
  tokens,
  toUnit,
  whales,
} from "../../utils";

describe("Compound", () => {
  let tryCompound: TryCompound;

  let wbtc: IERC20;
  let cwbtc: CERC20;

  let wbtcWhale: SignerWithAddress;
  let cwbtcWhale: SignerWithAddress;

  beforeEach(async () => {
    await deployments.fixture("Compound");

    wbtc = await getIERC20(tokens.WBTC);
    const cwbtcArtifact = await deployments.getArtifact("CERC20");
    cwbtc = await ethers.getContractAt<CERC20>(cwbtcArtifact.abi, tokens.CWBTC);
    wbtcWhale = await impersonateSigner(whales.WBTC_WHALE);
    cwbtcWhale = await impersonateSigner(whales.CWBTC_WHALE);
    tryCompound = await ethers.getContract("TryCompound");
  });

  const printBalances = async () => {
    const wbtcBalance = await wbtc.balanceOf(tryCompound.address);
    const cwbtcBalance = await cwbtc.balanceOf(tryCompound.address);
    const estimateUnderlyingBalance =
      await tryCompound.callStatic.estimateBalanceOfUnderlying();
    const underlyingBalance =
      await tryCompound.callStatic.balanceOfUnderlying();
    const { exchangeRate, supplyRate } = await tryCompound.callStatic.getInfo();

    console.log("WBTC: ", fromUnit(wbtcBalance, 8));
    console.log("CWBTC: ", fromUnit(cwbtcBalance, 8));
    console.log("Supply rate", fromUnit(supplyRate));
    console.log("Exchange rate cWBTC -> WBTC", fromUnit(exchangeRate));
    console.log("Underlying: ", fromUnit(underlyingBalance, 8));
    console.log(
      "Estimate underlying: ",
      fromUnit(estimateUnderlyingBalance, 8)
    );
  };

  it("getInfo", async () => {
    const { exchangeRate, supplyRate } = await tryCompound.callStatic.getInfo();

    console.log("Supply rate", fromUnit(supplyRate));
    console.log("Exchange rate cWBTC -> WBTC", fromUnit(exchangeRate));
  });

  it("estimateBalanceOfUnderlying", async () => {
    const contract = cwbtc.connect(cwbtcWhale);
    const whaleBalance = await contract.balanceOf(cwbtcWhale.address);
    console.log("whale cWBTC: ", fromUnit(whaleBalance, 8));

    await contract.transfer(tryCompound.address, toUnit(100, 8));
    const underlyingBalance =
      await tryCompound.callStatic.estimateBalanceOfUnderlying();
    console.log("underlying WBTC: ", fromUnit(underlyingBalance, 8));
  });

  it("supplies and redeems", async () => {
    const compound = tryCompound.connect(wbtcWhale);
    await wbtc.connect(wbtcWhale).approve(compound.address, toUnit(10, 8));
    await compound.supply(toUnit(1, 8));

    // Exchange rate of underlying to cToken increases over time
    await printBalances();
    await mine(100);
    await printBalances();
    const cTokenAmount = await cwbtc.balanceOf(compound.address);
    await compound.redeem(cTokenAmount);
    await printBalances();
  });
});
