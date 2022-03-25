import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers, deployments } from "hardhat";
import {
  CERC20,
  IERC20,
  TryCompound,
  TryCompound__factory,
} from "../../typechain";
import {
  fromUnit,
  getCERC20,
  getIERC20,
  impersonateSigner,
  mine,
  pow,
  tokens,
  toUnit,
  whales,
} from "../../utils";

describe("Compound", () => {
  let tryCompound: TryCompound;

  let wbtc: IERC20;
  let cwbtc: CERC20;

  let dai: IERC20;
  let cdai: CERC20;

  let wbtcWhale: SignerWithAddress;
  let cwbtcWhale: SignerWithAddress;
  let daiWhale: SignerWithAddress;

  beforeEach(async () => {
    await deployments.fixture("Compound");

    wbtc = await getIERC20(tokens.WBTC);
    cwbtc = await getCERC20(tokens.CWBTC);
    dai = await getIERC20(tokens.DAI);
    cdai = await getCERC20(tokens.CDAI);

    wbtcWhale = await impersonateSigner(whales.WBTC_WHALE);
    cwbtcWhale = await impersonateSigner(whales.CWBTC_WHALE);
    daiWhale = await impersonateSigner(whales.DAI_WHALE);

    tryCompound = await ethers.getContract("TryCompound");
  });

  it("getInfo", async () => {
    const wbtci = await tryCompound.callStatic.getInfo(cwbtc.address);
    const daii = await tryCompound.callStatic.getInfo(cdai.address);

    console.log("Supply rate (cWBTC)", fromUnit(wbtci.supplyRate));
    console.log("Exchange rate (cWBTC -> WBTC)", fromUnit(wbtci.exchangeRate));
    console.log("Supply rate (cDAI)", fromUnit(daii.supplyRate));
    console.log("Exchange rate (cDAI -> DAI)", fromUnit(daii.exchangeRate));
  });

  it("estimateBalanceOfUnderlying", async () => {
    const contract = cwbtc.connect(cwbtcWhale);
    await contract.transfer(tryCompound.address, toUnit(100, 8));
    const underlyingBalance = await tryCompound
      .connect(cwbtcWhale)
      .callStatic.estimateBalanceOfUnderlying(cwbtc.address);
    expect(underlyingBalance).to.eq(0);
  });

  it("supplies and redeems", async () => {
    const logSupply = async () => {
      const wbtcBalance = await wbtc.balanceOf(tryCompound.address);
      const cwbtcBalance = await cwbtc.balanceOf(tryCompound.address);
      const estimateUnderlyingBalance =
        await tryCompound.callStatic.estimateBalanceOfUnderlying(cwbtc.address);
      const underlyingBalance =
        await tryCompound.callStatic.balanceOfUnderlying(cwbtc.address);
      const { exchangeRate, supplyRate } = await tryCompound.callStatic.getInfo(
        cwbtc.address
      );

      console.log("WBTC:", fromUnit(wbtcBalance, 8));
      console.log("CWBTC:", fromUnit(cwbtcBalance, 8));
      console.log("Supply rate:", fromUnit(supplyRate));
      console.log("Exchange rate cWBTC -> WBTC:", fromUnit(exchangeRate));
      console.log("Underlying:", fromUnit(underlyingBalance, 8));
      console.log(
        "Estimate underlying:",
        fromUnit(estimateUnderlyingBalance, 8)
      );
    };

    const compound = tryCompound.connect(wbtcWhale);
    await wbtc.connect(wbtcWhale).approve(compound.address, toUnit(10, 8));
    await compound.supply(wbtc.address, cwbtc.address, toUnit(1, 8));

    // Exchange rate of underlying to cToken increases over time
    await logSupply();
    await mine(100);
    await logSupply();
    const cTokenAmount = await cwbtc.balanceOf(compound.address);
    await compound.redeem(cwbtc.address, cTokenAmount);
    await logSupply();
  });

  it("borrows and repays", async () => {
    const snapshot = async (
      token: IERC20,
      cToken: CERC20,
      tokenDecimals: number,
      cTokenDecimals: number
    ) => {
      const { liquidity } = await tryCompound.getAccountLiquidity();
      const collateralFactor = await tryCompound.getCollateralFactor(
        cToken.address
      );
      const supply = await tryCompound.callStatic.balanceOfUnderlying(
        cToken.address
      );
      const price = await tryCompound.getPriceFeed(cToken.address);
      const maxBorrow = liquidity.div(price);
      const borrowedBalance = await tryCompound.callStatic.getBorrowedBalance(
        cToken.address
      );
      const borrowedBalanceErc20 = await dai.balanceOf(tryCompound.address);
      const borrowRate = await tryCompound.callStatic.getBorrowRatePerBlock(
        cToken.address
      );
      return {
        collateralFactor: collateralFactor.div(pow(10, 18)),
        supply: supply.div(pow(10, tokenDecimals - 2)).toNumber() / 100.0,
        price: price.div(pow(10, 18)),
        liquidity: liquidity.div(pow(10, 18)),
        maxBorrow,
        borrowedBalance:
          borrowedBalance.div(pow(10, cTokenDecimals - 2)).toNumber() / 100.0,
        borrowedBalanceErc20:
          borrowedBalanceErc20.div(pow(10, cTokenDecimals - 2)).toNumber() /
          100.0,
        borrowRate: borrowRate.div(pow(10, 18 - 2)).toNumber() / 100.0,
      };
    };

    const logBorrow = async (
      token: IERC20,
      cToken: CERC20,
      tokenDecimals: number,
      cTokenDecimals: number,
      init: boolean = false
    ) => {
      const data = await snapshot(token, cToken, tokenDecimals, cTokenDecimals);
      if (init) {
        console.log("collateral factor:", data.collateralFactor.toString());
        console.log("supply:", data.supply.toString());
        console.log(`price: $${data.price.toString()}`);
        console.log("borrow rate:", data.borrowRate.toString());
      }
      console.log("liquidity:", data.liquidity.toString());
      console.log("max borrow:", data.maxBorrow.toString());
      console.log(
        "borrowed balance (compound):",
        data.borrowedBalance.toString()
      );
      console.log(
        "borrowed balance (erc20):",
        data.borrowedBalanceErc20.toString()
      );
    };

    const go = async (
      token: IERC20,
      whale: SignerWithAddress,
      cToken: CERC20,
      tokenDecimals: number,
      cTokenDecimals: number,
      amount: number
    ) => {
      const log = async (init: boolean = false) =>
        logBorrow(token, cToken, tokenDecimals, cTokenDecimals, init);

      const compound = tryCompound.connect(whale);
      await token
        .connect(whale)
        .approve(compound.address, toUnit(amount, tokenDecimals));

      await compound.supply(
        token.address,
        cToken.address,
        toUnit(amount, tokenDecimals)
      );
      await log(true);
      await compound.borrow(cToken.address, cTokenDecimals);
      await log();
      await mine(100);
      await log();
      await token
        .connect(whale)
        .transfer(compound.address, toUnit(amount, tokenDecimals));

      const fullAmount = pow(2, 256).sub(1);
      await compound.repay(token.address, cToken.address, fullAmount);
      await log();
    };

    await go(wbtc, wbtcWhale, cdai, 8, 18, 10);
  });
});
