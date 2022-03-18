import { deployments, ethers } from "hardhat";
import { IERC20 } from "../typechain";

export const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
export const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
export const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
export const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
export const WETH_10 = "0xf4BB2e28688e89fCcE3c0580D37d36A7672E8A9F";
export const WBTC = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";

// Compound
export const CDAI = "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643";
export const CUSDC = "0x39AA39c021dfbaE8faC545936693aC917d5E7563";
export const CWBTC = "0xccF4429DB6322D5C611ee964527D42E5d685DD6a";
export const CETH = "0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5";

export const getIERC20 = async (address: string) => {
  const artifact = await deployments.getArtifact("IERC20");
  return await ethers.getContractAt<IERC20>(artifact.abi, address);
};
