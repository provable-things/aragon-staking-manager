require('dotenv').config()
const { usePlugin } = require('@nomiclabs/buidler/config')
const hooks = require('./scripts/buidler-hooks')

usePlugin('@aragon/buidler-aragon')

const getEnvironmentVariable = _envVar =>
  process.env[_envVar]
    ? process.env[_envVar]
    : (
      console.error(
        '✘ Cannot migrate!',
        '✘ Please provide an infura api key as and an',
        '✘ account private key as environment variables:',
        '✘ MAINNET_PRIVATE_KEY',
        '✘ RINKEBY_PRIVATE_KEY',
        '✘ INFURA_KEY'
      ),
      process.exit(1)
    )

module.exports = {
  // Default Buidler configurations. Read more about it at https://buidler.dev/config/
  defaultNetwork: 'localhost',
  networks: {
    localhost: {
      url: 'http://localhost:8545',
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${getEnvironmentVariable('INFURA_KEY')}`,
      accounts: [getEnvironmentVariable('RINKEBY_PRIVATE_KEY')]
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${getEnvironmentVariable('INFURA_KEY')}`,
      accounts: [getEnvironmentVariable('MAINNET_PRIVATE_KEY')],
      gasPrice: 60e9
    }
  },
  solc: {
    version: '0.4.24',
    optimizer: {
      enabled: true,
      runs: 10000,
    },
  },
  // Etherscan plugin configuration. Learn more at https://github.com/nomiclabs/buidler/tree/master/packages/buidler-etherscan
  etherscan: {
    apiKey: '', // API Key for smart contract verification. Get yours at https://etherscan.io/apis
  },
  // Aragon plugin configuration
  aragon: {
    appServePort: 8001,
    clientServePort: 3000,
    appSrcPath: 'app/',
    appBuildOutputPath: 'dist/',
    appName: 'staking-manager',
    hooks, // Path to script hooks
  },
}
