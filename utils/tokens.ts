import { Contract } from "ethers";
import { deployments, ethers } from "hardhat";
import { CERC20, IERC20 } from "../typechain";

export const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
export const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
export const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
export const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
export const WETH_10 = "0xf4BB2e28688e89fCcE3c0580D37d36A7672E8A9F";
export const WBTC = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";

// Compound
export const CDAI = "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643";
export const CUSDC = "0x39AA39c021dfbaE8faC545936693aC917d5E7563";
export const CUSDT = "0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9";
export const CWBTC = "0xccF4429DB6322D5C611ee964527D42E5d685DD6a";
export const CETH = "0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5";

export const getIERC20 = async (address: string) =>
  getContractAt<IERC20>(address, "IERC20");

export const getCERC20 = async (address: string) =>
  getContractAt<CERC20>(address, "CERC20");

export const getContractAt = async <T extends Contract>(
  address: string,
  name: string
) => {
  const artifact = await deployments.getArtifact(name);
  return await ethers.getContractAt<T>(artifact.abi, address);
};

export interface ITokens {
  dai: IERC20;
  usdc: IERC20;
  usdt: IERC20;
  weth: IERC20;
  weth10: IERC20;
  wbtc: IERC20;

  cdai: CERC20;
  cusdc: CERC20;
  cusdt: CERC20;
  cwbtc: CERC20;
  ceth: CERC20;
}

export const getTokens = async (): Promise<ITokens> => ({
  dai: await getIERC20(DAI),
  usdc: await getIERC20(USDC),
  usdt: await getIERC20(USDT),
  weth: await getIERC20(WETH),
  weth10: await getIERC20(WETH_10),
  wbtc: await getIERC20(WBTC),
  cdai: await getCERC20(CDAI),
  cusdc: await getCERC20(CUSDC),
  cusdt: await getCERC20(CUSDT),
  cwbtc: await getCERC20(CWBTC),
  ceth: await getCERC20(CETH),
});
