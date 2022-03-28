import * as dotenv from "dotenv";

import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-vyper";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-deploy";
import "hardhat-deploy-ethers";
import "hardhat-gas-reporter";
import "hardhat-tracer";
import "@tenderly/hardhat-tenderly";
import "solidity-coverage";

dotenv.config();

const {
  ROPSTEN_URL,
  RINKEBY_URL,
  MAINNET_URL,
  OPTIMISM_MAINNET_URL,
  OPTIMISM_KOVAN_URL,
  ARBITRUM_MAINNET_URL,
  ARBITRUM_RINKEBY_URL,
  POLYGON_MUMBAI_URL,
  POLYGON_MAINNET_URL,
  ACCOUNT1_ADDRESS,
  ACCOUNT1_PRIVATE_KEY,
  ETHERSCAN_API_KEY,
} = process.env;

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.10",
      },
      {
        version: "0.6.12",
      },
    ],
  },
  vyper: "0.3.1",
  networks: {
    hardhat: {
      forking: {
        url: MAINNET_URL!,
        blockNumber: 14473588,
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
    optimism_kovan: {
      url: OPTIMISM_KOVAN_URL!,
      accounts: [ACCOUNT1_PRIVATE_KEY!],
    },
    arbitrum_rinkeby: {
      url: ARBITRUM_RINKEBY_URL!,
      accounts: [ACCOUNT1_PRIVATE_KEY!],
    },
    polygon_mumbai: {
      url: POLYGON_MUMBAI_URL!,
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
  tenderly: {
    project: "Project",
    username: "vyorkin",
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
