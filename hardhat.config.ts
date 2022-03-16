import * as dotenv from "dotenv";

import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-deploy";
import "hardhat-deploy-ethers";
import "hardhat-gas-reporter";
import "solidity-coverage";

dotenv.config();

const {
  ROPSTEN_URL,
  RINKEBY_URL,
  MAINNET_URL,
  ACCOUNT1_ADDRESS,
  ACCOUNT1_PRIVATE_KEY,
  ETHERSCAN_API_KEY,
} = process.env;

const config: HardhatUserConfig = {
  solidity: "0.8.4",
  networks: {
    hardhat: {
      forking: {
        url: MAINNET_URL!,
      },
    },
    ropsten: {
      url: ROPSTEN_URL!,
      accounts: [ACCOUNT1_PRIVATE_KEY!],
    },
    rinkeby: {
      url: RINKEBY_URL!,
      accounts: [ACCOUNT1_PRIVATE_KEY!],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  namedAccounts: {
    deployer: 0,
    user: ACCOUNT1_ADDRESS!,
  },
  typechain: {
    outDir: "typechain",
  },
};

export default config;
