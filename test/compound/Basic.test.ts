import { expect } from "chai";
import { ethers, deployments } from "hardhat";
import { TryCompound } from "../../typechain";
import { fromUnit, mine, toUnit } from "../../utils";
import { getTokens, ITokens } from "../../utils/tokens";
import { getWhales, IWhales } from "../../utils/whales";
import * as utils from "./utils";
import { IBorrowRepayCtx, ISupplyRedeemCtx } from "./utils/types";

describe("Compound", () => {
  let tryCompound: TryCompound;
  let tokens: ITokens;
  let whales: IWhales;

  beforeEach(async () => {
    await deployments.fixture("Compound");

    tryCompound = await ethers.getContract("TryCompound");
    tokens = await getTokens();
    whales = await getWhales();
  });

  it("getInfo", async () => {
    const wbtci = await tryCompound.callStatic.getInfo(tokens.cwbtc.address);
    const daii = await tryCompound.callStatic.getInfo(tokens.cdai.address);

    console.log("Supply rate (cWBTC)", fromUnit(wbtci.supplyRate));
    console.log("Exchange rate (cWBTC -> WBTC)", fromUnit(wbtci.exchangeRate));
    console.log("Supply rate (cDAI)", fromUnit(daii.supplyRate));
    console.log("Exchange rate (cDAI -> DAI)", fromUnit(daii.exchangeRate));
  });

  it("estimateBalanceOfUnderlying", async () => {
    const token = tokens.cwbtc.connect(whales.cwbtc);
    await token.transfer(tryCompound.address, toUnit(100, 8));
    const underlyingBalance = await tryCompound
      .connect(whales.cwbtc)
      .callStatic.estimateBalanceOfUnderlying(tokens.cwbtc.address, 8, 8);
    expect(underlyingBalance).to.eq(0);
  });

  it("supplies and redeems", async () => {
    const ctx: ISupplyRedeemCtx = {
      contract: tryCompound,
      token: tokens.wbtc,
      tokenName: "WBTC",
      tokenDecimals: 8,
      cToken: tokens.cwbtc,
      cTokenDecimals: 8,
    };

    const log = async () =>
      utils.log.supplyRedeem(ctx, await utils.state.supplyRedeem(ctx));

    const compound = ctx.contract.connect(whales.wbtc);
    await tokens.wbtc
      .connect(whales.wbtc)
      .approve(compound.address, toUnit(10, 8));
    await compound.supply(
      tokens.wbtc.address,
      tokens.cwbtc.address,
      toUnit(1, 8)
    );

    // Exchange rate of underlying to cToken increases over time
    await log();
    await mine(1000);
    console.log("--- after 1000 blocks ---");
    await log();
    const cTokenAmount = await tokens.cwbtc.balanceOf(compound.address);
    await compound.redeem(tokens.cwbtc.address, cTokenAmount);
    console.log("--- after redeem ---");
    await log();
  });

  it("borrows and repays", async () => {
    const ctx: IBorrowRepayCtx = {
      contract: tryCompound,
      token: tokens.wbtc,
      tokenName: "WBTC",
      tokenDecimals: 8,
      cToken: tokens.cwbtc,
      cTokenDecimals: 8,
      tokenToBorrow: tokens.dai,
      tokenToBorrowName: "DAI",
      tokenToBorrowDecimals: 18,
      cTokenToBorrow: tokens.cdai,
      whale: whales.wbtc,
      collateral: toUnit(1, 8),
    };

    const log = async (init: boolean = false) =>
      utils.log.borrowRepay(ctx, await utils.state.borrowRepay(ctx), init);

    console.log("--- before supply ---");

    await log();

    // approve spending of collateral
    await ctx.token
      .connect(ctx.whale)
      .approve(ctx.contract.address, ctx.collateral);

    const allowance = await ctx.token.allowance(
      ctx.whale.address,
      ctx.contract.address
    );
    console.log(
      "allowance: %s %s",
      fromUnit(allowance, ctx.tokenDecimals),
      ctx.tokenName
    );

    // supply collateral
    await ctx.contract
      .connect(ctx.whale)
      .supply(
        ctx.token.address,
        ctx.cToken.address,
        toUnit(1, ctx.tokenDecimals)
      );

    console.log("--- after supply ---");
    await log(true);

    // borrow 50% of the maximum borrowable amount
    await ctx.contract
      .connect(ctx.whale)
      .borrow(
        ctx.cToken.address,
        ctx.cTokenToBorrow.address,
        ctx.tokenToBorrowDecimals
      );

    console.log("--- after borrow ---");
    await log();

    await mine(1000);

    console.log("--- after 1000 blocks ---");
    await log();
  });
});
