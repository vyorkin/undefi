import { fromUnit } from "../../../utils";
import {
  IBorrowRepayCtx,
  IBorrowRepayState,
  ISupplyRedeemCtx,
  ISupplyRedeemState,
} from "./types";

export const borrowRepay = (
  ctx: IBorrowRepayCtx,
  state: IBorrowRepayState,
  init: boolean
) => {
  if (init) {
    console.log("collateral factor:", state.collateralFactor.toString());
    console.log("suppled:", state.supplied.toString());
    console.log("price: $", state.price.toString());
    console.log("borrow rate:", state.borrowRate.toString());
  }
  console.log(
    "whale balance: %s %s",
    fromUnit(state.whaleBalance, ctx.tokenDecimals),
    ctx.tokenName
  );
  console.log("liquidity: $", state.liquidity.toString());
  console.log("max borrow:", state.maxBorrow.toString());
  console.log("borrowed (compound):", state.borrowedBalance.toString());
  console.log("borrowed (erc20):", state.borrowedBalanceERC20.toString());
};

export const supplyRedeem = (
  ctx: ISupplyRedeemCtx,
  state: ISupplyRedeemState
) => {
  const { tokenName, tokenDecimals, cTokenDecimals } = ctx;

  console.log("%s: %s", tokenName, fromUnit(state.balance, tokenDecimals));
  console.log("c%s: %s", tokenName, fromUnit(cTokenDecimals, cTokenDecimals));

  console.log("Supply rate:", fromUnit(state.supplyRate));
  console.log(
    "Exchange rate c%s -> %s: %s",
    tokenName,
    tokenName,
    fromUnit(state.exchangeRate)
  );
  console.log("Underlying:", fromUnit(state.underlying, tokenDecimals));
  console.log(
    "Estimate underlying:",
    fromUnit(state.underlyingEst, tokenDecimals)
  );
};
