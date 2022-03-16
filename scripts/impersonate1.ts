import { ethers, network } from "hardhat";

const VITALIK_ADDR = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";

const impersonateSigner = async (addr: string) => {
  await network.provider.request({
    method: 'hardhat_impersonateAccount',
    params: [addr],
  });
  return await ethers.getSigner(addr);
};

async function main() {
    const vitalik = await impersonateSigner(VITALIK_ADDR);
    const wei = await vitalik.getBalance();
    const eth = ethers.utils.formatEther(wei);
    console.log("balance: %s ETH", eth);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });