import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const V2_ADDRESSES_PROVIDER = "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5";

// https://docs.aave.com/developers/deployed-contracts/v3-testnet-addresses
const V3_ADDRESSES_PROVIDERS: Record<string, string> = {
  optimism_kovan: "0xD15d36975A0200D11B8a8964F4F267982D2a1cFe",
  arbitrum_rinkeby: "0xF7158D1412Bdc8EAfc6BF97DB4e2178379c9521c",
  polygon_mumbai: "0x5343b5bA672Ae99d627A1C87866b8E53F47Db2E6",
};

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {
    deployments: { deploy },
    getNamedAccounts,
  } = hre;
  const { deployer } = await getNamedAccounts();

  await deploy("TryAaveV2", {
    from: deployer,
    args: [V2_ADDRESSES_PROVIDER],
    log: true,
  });

  const v3AddressesProvider = V3_ADDRESSES_PROVIDERS[hre.network.name];
  if (v3AddressesProvider) {
    await deploy("TryAaveV3", {
      from: deployer,
      args: [v3AddressesProvider],
      log: true,
    });
  }
};

export default func;
func.tags = ["AAVE"];
