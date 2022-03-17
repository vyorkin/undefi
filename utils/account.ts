import { network, ethers } from "hardhat";

export const impersonateSigner = async (addr: string) => {
  await network.provider.request({
    method: 'hardhat_impersonateAccount',
    params: [addr],
  });
  return await ethers.getSigner(addr);
};