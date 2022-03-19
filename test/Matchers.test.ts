import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Wallet } from "ethers";
import { deployments, ethers } from "hardhat";
import { IERC20, TrySolidity1 } from "../typechain";
import {
  getERC20Balance,
  getIERC20,
  impersonateSigner,
  tokens,
  toUnit,
  whales,
} from "../utils";

describe("Matchers", () => {
  let weth: IERC20;
  let wethWhale: SignerWithAddress;

  let dai: IERC20;
  let daiWhale: SignerWithAddress;

  let signers: Record<string, SignerWithAddress>;

  beforeEach(async () => {
    await deployments.fixture(["TrySolidity"]);

    weth = await getIERC20(tokens.WETH);
    wethWhale = await impersonateSigner(whales.WETH_WHALE);

    dai = await getIERC20(tokens.DAI);
    daiWhale = await impersonateSigner(whales.DAI_WHALE);

    signers = await ethers.getNamedSigners();
  });

  describe("Emtting events", () => {
    it("emits Transfer event", async () => {
      const amount = toUnit(10, 8);
      await expect(dai.connect(daiWhale).transfer(signers.user.address, amount))
        .to.emit(dai, "Transfer")
        .withArgs(daiWhale.address, signers.user.address, amount);
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
      const balance = await getERC20Balance(
        weth,
        wethWhale.address,
        "WETH",
        18
      );

      console.log("%s: %s", wethWhale.address, balance);

      await expect(
        weth.connect(wethWhale).transfer(signers.user.address, toUnit(1, 18))
      ).not.to.be.reverted;

      await expect(
        weth
          .connect(wethWhale)
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
        weth.connect(wethWhale).transfer(signers.user.address, 200)
      ).to.changeTokenBalance(weth, signers.user, 200);

      await expect(() =>
        weth
          .connect(wethWhale)
          .transferFrom(wethWhale.address, signers.user.address, 200)
      ).to.changeTokenBalance(weth, signers.user, 200);
    });
  });
});
