import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import { CERC20, IERC20, TryCompound } from "../../../typechain";

export interface IExampleCtx {
  contract: TryCompound;
  token: IERC20;
  tokenName: string;
  tokenDecimals: number;
  cToken: CERC20;
  cTokenDecimals: number;
}

export interface ISupplyRedeemCtx extends IExampleCtx {}

export interface IBorrowRepayCtx extends IExampleCtx {
  tokenToBorrow: IERC20;
  tokenToBorrowName: string;
  tokenToBorrowDecimals: number;
  cTokenToBorrow: CERC20;
  whale: SignerWithAddress;
  collateral: BigNumber;
}

export interface ISupplyRedeemState {
  balance: BigNumber;
  cBalance: BigNumber;
  underlying: BigNumber;
  underlyingEst: BigNumber;
  exchangeRate: BigNumber;
  supplyRate: BigNumber;
}

export interface IBorrowRepayState {
  whaleBalance: BigNumber;
  liquidity: BigNumber;
  collateralFactor: number;
  supplied: number;
  price: number;
  maxBorrow: BigNumber;
  borrowedBalance: number;
  borrowedBalanceERC20: number;
  borrowRate: BigNumber;
}
