import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {
    deployments: { deploy },
    getNamedAccounts,
  } = hre;
  const { deployer } = await getNamedAccounts();

  await deploy("TryUniswapV2", { from: deployer, log: true });
  await deploy("TryUniswapV3", { from: deployer, log: true });
};

export default func;
func.tags = ["Uniswap"];
