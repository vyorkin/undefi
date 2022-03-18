import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { IERC20 } from "../typechain";
import {
  getERC20Balance,
  getIERC20,
  impersonateSigner,
  tokens,
  toUnit,
  whales,
} from "../utils";

describe("Matchers", () => {
  let dai: IERC20;
  let daiWhale: SignerWithAddress;

  let user: SignerWithAddress;

  beforeEach(async () => {
    dai = await getIERC20(tokens.DAI);
    daiWhale = await impersonateSigner(whales.DAI_WHALE);
    user = await ethers.getNamedSigner("user");
  });

  describe("Emtting events", () => {
    it("emits Transfer event", async () => {
      const amount = toUnit(10, 8);
      await expect(dai.connect(daiWhale).transfer(user.address, amount))
        .to.emit(dai, "Transfer")
        .withArgs(daiWhale.address, user.address, amount);
    });
  });

  // Waffle's calledOnContract is not supported by Hardhat
  describe.skip("Called on contract", () => {
    it("works", async () => {
      await getERC20Balance(dai, daiWhale.address, "DAI");
      expect("balanceOf").to.be.calledOnContract(dai);
    });
  });

  describe("Revert", () => {
    it("works", async () => {
      const amount = toUnit(20000, 18);
      await expect(dai.connect(daiWhale).transfer(user.address, amount)).to.be
        .reverted;
    });
  });

  describe("Change ether balance", () => {
    it("works", async () => {});
  });
});
