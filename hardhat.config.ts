import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomicfoundation/hardhat-ethers';

import 'dotenv/config';

const SEPOLIA_RPC_URL =
	process.env.SEPOLIA_RPC_URL ||
	'https://eth-sepolia.g.alchemy.com/v2/{api_key}';
const PRIVATE_KEY = process.env.PRIVATE_KEY || '0x0000';
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || '';
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || '';

const config: HardhatUserConfig = {
	solidity: '0.8.19',
	networks: {
		hardhat: {
			chainId: 31337,
			allowUnlimitedContractSize: true,
		},
		sepolia: {
			url: SEPOLIA_RPC_URL,
			accounts: [PRIVATE_KEY],
		},
	},
	etherscan: {
		apiKey: ETHERSCAN_API_KEY,
	},
	gasReporter: {
		enabled: true,
		currency: 'USD',
		outputFile: 'gas-report.txt',
		noColors: true,
		coinmarketcap: COINMARKETCAP_API_KEY,
	},
};

export default config;
