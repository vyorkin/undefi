import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { deployments, ethers } from "hardhat";
import { IERC20, TrySolidity1 } from "../../typechain";
import { getERC20Balance, toUnit } from "../../utils";
import { getTokens, ITokens } from "../../utils/tokens";
import { getWhales, IWhales } from "../../utils/whales";

describe("Matchers", () => {
  let tokens: ITokens;
  let whales: IWhales;

  let signers: Record<string, SignerWithAddress>;

  beforeEach(async () => {
    await deployments.fixture(["TrySolidity"]);
    tokens = await getTokens();
    whales = await getWhales();
    signers = await ethers.getNamedSigners();
  });

  describe("Emtting events", () => {
    it("emits Transfer event", async () => {
      const amount = toUnit(10, 8);
      await expect(
        tokens.dai.connect(whales.dai).transfer(signers.user.address, amount)
      )
        .to.emit(tokens.dai, "Transfer")
        .withArgs(whales.dai.address, signers.user.address, amount);
    });
  });

  // Waffle's calledOnContract is not supported by Hardhat
  describe.skip("Called on contract", () => {
    it("works", async () => {
      await getERC20Balance(tokens.dai, whales.dai.address, "DAI");
      expect("balanceOf").to.be.calledOnContract(tokens.dai);
    });
  });

  describe("Revert", () => {
    it("works", async () => {
      const balance = await getERC20Balance(
        tokens.weth,
        whales.weth.address,
        "WETH",
        18
      );

      console.log("%s: %s", whales.weth.address, balance);

      await expect(
        tokens.weth
          .connect(whales.weth)
          .transfer(signers.user.address, toUnit(1, 18))
      ).not.to.be.reverted;

      await expect(
        tokens.weth
          .connect(whales.weth)
          .transfer(signers.user.address, toUnit(15000, 18))
      ).to.be.reverted;

      const sol1: TrySolidity1 = await ethers.getContract("TrySolidity1");
      await expect(sol1.foo()).to.be.revertedWith("fucked up");
    });
  });

  describe("Change ether balance", () => {
    it("works with single", async () => {
      await expect(() =>
        signers.deployer.sendTransaction({
          to: signers.user.address,
          value: 200,
        })
      ).to.changeEtherBalance(signers.deployer, -200);
    });

    it("works with multiple", async () => {
      await expect(() =>
        signers.deployer.sendTransaction({
          to: signers.user.address,
          value: 200,
        })
      ).to.changeEtherBalances([signers.deployer, signers.user], [-200, 200]);

      const tx = await signers.deployer.sendTransaction({
        to: signers.user.address,
        value: 200,
      });
      expect(tx).to.changeEtherBalances(
        [signers.deployer, signers.user],
        [-200, 200]
      );
    });
  });

  describe("Change token balance", () => {
    it("works", async () => {
      await expect(() =>
        tokens.weth.connect(whales.weth).transfer(signers.user.address, 200)
      ).to.changeTokenBalance(tokens.weth, signers.user, 200);

      await expect(() =>
        tokens.weth
          .connect(whales.weth)
          .transferFrom(whales.weth.address, signers.user.address, 200)
      ).to.changeTokenBalance(tokens.weth, signers.user, 200);
    });
  });
});
