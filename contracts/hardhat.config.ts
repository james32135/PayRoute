import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
    solidity: {
        compilers: [
            { version: "0.8.24" },
            { version: "0.8.27" }
        ]
    },
    networks: {
        polygon: {
            url: process.env.POLYGON_RPC_URL || "https://polygon-mainnet.g.alchemy.com/v2/demo",
            chainId: 137,
            accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
            timeout: 120000, // 2 min timeout
        },
        amoy: {
            url: "https://rpc-amoy.polygon.technology",
            chainId: 80002,
            accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
        },
        katana: {
            url: process.env.KATANA_RPC_URL || "https://rpc.katana.network",
            chainId: 747474,
            accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
        },
    },
    etherscan: {
        apiKey: {
            polygon: process.env.ETHERSCAN_API_KEY || '',
            polygonMumbai: process.env.ETHERSCAN_API_KEY || '',
        },
    },
    paths: {
        sources: "./src",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts"
    },
};

export default config;
