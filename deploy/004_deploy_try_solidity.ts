import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {
    deployments: { deploy },
    getNamedAccounts,
  } = hre;
  const { deployer } = await getNamedAccounts();

  await deploy("TrySolidity1", { from: deployer, log: true });
  // await deploy("TrySolidity2", { from: deployer });
  // await deploy("TrySolidity3", { from: deployer });
  // await deploy("TrySolidity4", { from: deployer });
  // await deploy("TrySolidity5", { from: deployer });
};

export default func;
func.tags = ["TrySolidity"];
