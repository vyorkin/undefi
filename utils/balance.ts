import { BigNumberish } from "ethers";
import { ethers } from "hardhat";
import { IERC20 } from "../typechain";
import { fromUnit } from "./format";

export const getERC20Balance = async (
  ierc20: IERC20,
  address: string,
  symbol: string,
  decimals: BigNumberish = 18
) => {
  const units = await ierc20.balanceOf(address);
  const value = fromUnit(units, decimals);
  return `${value} ${symbol}`;
};

export const getBalance = async (
  address: string,
  symbol: string,
  decimals: BigNumberish = 18
) => {
  const units = await ethers.provider.getBalance(address);
  const value = fromUnit(units, decimals);
  return `${value} ${symbol}`;
};
