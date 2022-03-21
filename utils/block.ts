import { network } from "hardhat";

export const mine = async (num: number) => {
  let count = num;
  while (count > 0) {
    count--;
    await network.provider.request({
      method: "evm_mine",
      params: [],
    });
  }
};
