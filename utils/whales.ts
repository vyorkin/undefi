import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { impersonateSigner } from "./account";

export interface IWhales {
  weth: SignerWithAddress;
  dai: SignerWithAddress;
  usdc: SignerWithAddress;
  usdt: SignerWithAddress;
  wbtc: SignerWithAddress;
  cwbtc: SignerWithAddress;
}

export const WETH = "0x2fEb1512183545f48f6b9C5b4EbfCaF49CfCa6F3";
export const DAI = "0x5D38B4e4783E34e2301A2a36c39a03c45798C4dD";
export const USDC = "0xCFFAd3200574698b78f32232aa9D63eABD290703";
export const USDT = "0x3DdfA8eC3052539b6C9549F12cEA2C295cfF5296";
export const WBTC = "0xB60C61DBb7456f024f9338c739B02Be68e3F545C";
export const CWBTC = "0x2C21FA2903D4F8839E8FD6b041C2ADF19dbf6540";

export const getWhales = async (): Promise<IWhales> => ({
  weth: await impersonateSigner(WETH),
  dai: await impersonateSigner(DAI),
  usdc: await impersonateSigner(USDC),
  usdt: await impersonateSigner(USDT),
  wbtc: await impersonateSigner(WBTC),
  cwbtc: await impersonateSigner(CWBTC),
});
