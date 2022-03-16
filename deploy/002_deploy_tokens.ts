import { ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {
    deployments: { deploy },
    getNamedAccounts,
  } = hre;
  const { deployer } = await getNamedAccounts();

  const token = (name: string, desc: string) => ({
    contract: "Token",
    from: deployer,
    args: [name, desc, ethers.utils.parseUnits("1000", 18)],
    log: true,
  });

  await deploy("AAAToken", token("AAA", "AAA Token"));
  await deploy("BBBToken", token("BBB", "BBB Token"));
  await deploy("CCCToken", token("CCC", "CCC Token"));
};

export default func;
func.tags = ["Token"];
