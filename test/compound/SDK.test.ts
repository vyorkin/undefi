import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers, deployments, network } from "hardhat";
import Compound from "@compound-finance/compound-js";
import { CERC20, IERC20, TryCompound } from "../../typechain";
import { getCERC20, getIERC20, tokens } from "../../utils";
import { CompoundInstance } from "@compound-finance/compound-js/dist/nodejs/types";

const { MAINNET_URL } = process.env;

describe.skip("Compound", () => {
  let compound: CompoundInstance;
  let tryCompoound: TryCompound;

  let weth: IERC20;
  let usdc: IERC20;
  let cusdc: CERC20;

  let wethWhale: SignerWithAddress;
  let cusdcWhale: SignerWithAddress;

  beforeEach(async () => {
    await deployments.fixture("Compound");
    compound = Compound(MAINNET_URL!);

    weth = await getIERC20(tokens.WETH);
    usdc = await getIERC20(tokens.USDC);
    cusdc = await getCERC20(tokens.CUSDC);
  });

  it("whatever", async () => {});
});
