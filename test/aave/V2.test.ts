import { deployments, ethers } from "hardhat";
import { TryAaveV2 } from "../../typechain";
import { fromUnit, toUnit } from "../../utils";
import { getTokens, ITokens } from "../../utils/tokens";
import { getWhales, IWhales } from "../../utils/whales";

describe("AAVE V2", () => {
  let tryAave: TryAaveV2;
  let tokens: ITokens;
  let whales: IWhales;

  beforeEach(async () => {
    await deployments.fixture("AAVE");

    tryAave = await ethers.getContract("TryAaveV2");
    tokens = await getTokens();
    whales = await getWhales();
  });

  it("takes and repays a flash loan", async () => {
    const ctx = {
      tokenToBorrow: tokens.usdc,
      tokenDecimals: 6,
      whale: whales.usdc,
      fundAmount: toUnit(2000, 6),
      borrowAmount: toUnit(1000, 6),
    };

    // used to repay loan
    await ctx.tokenToBorrow
      .connect(ctx.whale)
      .transfer(tryAave.address, ctx.fundAmount);

    await tryAave.test(ctx.tokenToBorrow.address, ctx.borrowAmount);

    const logEvent = tryAave.filters.Log(null, null);
    const events = await tryAave.queryFilter(logEvent);
    for (const e of events) {
      const amount = fromUnit(e.args.amount, ctx.tokenDecimals);
      console.log(`${e.args.message}: ${amount} USDC`);
    }
  });
});
