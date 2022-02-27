import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "./tasks/index";

dotenv.config();

export const DAOAddr = process.env.DAO_ADDRESS !== undefined ? process.env.DAO_ADDRESS : "";
export const tokenAddr = process.env.TOKEN_ADDRESS !== undefined ? process.env.TOKEN_ADDRESS : "";

const config: HardhatUserConfig = {
  solidity: "0.8.0",
  networks: {
    rinkeby: {
      url: process.env.RINKEBY_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_KEY,
  },
};

export default config;
