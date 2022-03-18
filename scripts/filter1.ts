import { ethers } from "hardhat";

const DAI_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const SOME_ADDRESS = "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7";
const WHALE_ADDRESS = "0x5D38B4e4783E34e2301A2a36c39a03c45798C4dD";

const DAI_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",

  "function balanceOf(address) view returns (uint)",

  "event Approval(address indexed src, address indexed guy, uint wad)",
  "event Transfer(address indexed src, address indexed dst, uint wad)",
];

(async () => {
  const daiContract = await ethers.getContractAt(DAI_ABI, DAI_ADDRESS);
  console.log("name: ", await daiContract.name());
  console.log("symbol: ", await daiContract.symbol());
  const someBalance = await daiContract.balanceOf(SOME_ADDRESS);
  const someBalanceEth = ethers.utils.formatUnits(someBalance, 18);
  const whaleBalance = await daiContract.balanceOf(WHALE_ADDRESS);
  const whaleBalanceEth = ethers.utils.formatUnits(whaleBalance, 18);
  console.log("some balance: %s DAI", someBalanceEth);
  console.log("whale balance: %s DAI", whaleBalanceEth);

  // all transfers to SOME_ADDRESS
  const someFilter = daiContract.filters.Transfer(null, SOME_ADDRESS);
  console.log("some filter:");
  console.log(someFilter);
  const someEvents = await daiContract.queryFilter(someFilter, -1000);
  console.log(someEvents.map((x) => x.transactionHash));

  // all transfers from WHALE_ADDRESS
  const whaleFilter = daiContract.filters.Transfer(WHALE_ADDRESS, null);
  console.log("whale filter:");
  console.log(whaleFilter);
  const whaleEvents = await daiContract.queryFilter(
    whaleFilter,
    14397000,
    14397451
  );
  console.log(whaleEvents.map((x) => x.transactionHash));
})();
