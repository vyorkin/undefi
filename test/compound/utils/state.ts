import { pow } from "../../../utils";
import {
  IBorrowRepayCtx,
  IBorrowRepayState,
  ISupplyRedeemCtx,
  ISupplyRedeemState,
} from "./types";

export const supplyRedeem = async (
  ctx: ISupplyRedeemCtx
): Promise<ISupplyRedeemState> => {
  const { contract, token, cToken, tokenDecimals, cTokenDecimals } = ctx;
  const { callStatic: sc } = contract;

  const balance = await token.balanceOf(contract.address);
  const cBalance = await cToken.balanceOf(contract.address);

  const { exchangeRate, supplyRate } = await sc.getInfo(cToken.address);
  const underlying = await sc.balanceOfUnderlying(cToken.address);
  const underlyingEst = await sc.estimateBalanceOfUnderlying(
    cToken.address,
    tokenDecimals,
    cTokenDecimals
  );

  return {
    balance, // token balance
    cBalance, // cToken balance
    underlying, // estimated balance of the supplied Token (including interest rate)
    underlyingEst, // same as "underlying", but custom implementation
    exchangeRate, // exchange rate from cToken to Token (underlying)
    supplyRate, // amount added to your supply balance per block
  };
};

export const borrowRepay = async (
  ctx: IBorrowRepayCtx
): Promise<IBorrowRepayState> => {
  const {
    contract,
    token,
    tokenToBorrow,
    tokenToBorrowDecimals,
    cTokenToBorrow,
    cTokenDecimals,
  } = ctx;
  const { callStatic: sc } = contract;

  const whaleBalance = await token.balanceOf(ctx.whale.address);
  const { liquidity } = await contract.getAccountLiquidity();
  const collateralFactor = await contract.getCollateralFactor(
    ctx.cToken.address
  );
  const supplied = await sc.balanceOfUnderlying(ctx.cToken.address);
  const price = await contract.getPriceFeed(ctx.cTokenToBorrow.address);
  const maxBorrow = liquidity.div(price);
  const borrowedBalance = await sc.getBorrowedBalance(cTokenToBorrow.address);
  const borrowedBalanceERC20 = await tokenToBorrow.balanceOf(contract.address);
  const borrowRate = await sc.getBorrowRatePerBlock(cTokenToBorrow.address);

  return {
    whaleBalance,
    // USD value borrowable by a user
    liquidity: liquidity.div(pow(10, 18)),
    // this value is multiplied by a supply balance to
    // determine how much value can be borrowed
    // scaled by 1e18
    collateralFactor: collateralFactor.div(pow(10, 18 - 2)).toNumber() / 100,
    // cToken that we supplied
    supplied: supplied.div(pow(10, ctx.cTokenDecimals - 2)).toNumber() / 100,
    // price of the token we want to borrow (in USD)
    // scaled by 1e18
    price: price.div(pow(10, 18 - 2)).toNumber() / 100,
    // maximum amount of tokens we can borrow
    maxBorrow,
    // current borrow balance with interest
    // in units of the underlying asset, according to compound contract
    borrowedBalance:
      borrowedBalance.div(pow(10, tokenToBorrowDecimals - 2)).toNumber() / 100,
    // actual borrowed balance, according to ERC20 token,
    // without interest rate
    borrowedBalanceERC20:
      borrowedBalanceERC20.div(pow(10, tokenToBorrowDecimals - 2)).toNumber() /
      100,
    // current borrow rate as an unsigned integer
    // scaled by 1e18
    borrowRate: borrowRate.div(pow(10, 18)),
  };
};
