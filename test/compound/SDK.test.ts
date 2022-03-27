import { ethers, deployments, network } from "hardhat";
import Compound from "@compound-finance/compound-js";
import { TryCompound } from "../../typechain";
import { CompoundInstance } from "@compound-finance/compound-js/dist/nodejs/types";
import { getTokens, ITokens } from "../../utils/tokens";
import { getWhales, IWhales } from "../../utils/whales";

const { MAINNET_URL } = process.env;

describe.skip("Compound", () => {
  let compound: CompoundInstance;
  let tryCompoound: TryCompound;
  let tokens: ITokens;
  let whales: IWhales;

  beforeEach(async () => {
    await deployments.fixture("Compound");
    compound = Compound(MAINNET_URL!);

    tokens = await getTokens();
    whales = await getWhales();
  });

  it("whatever", async () => {});
});
