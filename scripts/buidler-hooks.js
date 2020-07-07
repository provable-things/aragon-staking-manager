const ETH_ADDRESS = '0x0000000000000000000000000000000000000000'
const MOCK_TOKEN_BALANCE = '1000000000000000000000000'
const MOCK_TOKEN_DECIMALS = 18
const ONE_DAY = 86400
const MAX_LOCKS = 20

let vault, tokenManager, miniMeToken

module.exports = {
  preDao: async ({ log }, { web3, artifacts }) => {},

  postDao: async (
    { dao, _experimentalAppInstaller, log },
    { web3, artifacts }
  ) => {},

  preInit: async (
    { proxy, _experimentalAppInstaller, log },
    { web3, artifacts }
  ) => {
    const MiniMeToken = artifacts.require('MiniMeToken')
    const MiniMeTokenFactory = artifacts.require('MiniMeTokenFactory')
    const ERC20 = artifacts.require('StandardToken')

    const accounts = await web3.eth.getAccounts()

    const miniMeTokenFactory = await MiniMeTokenFactory.new()
    miniMeToken = await MiniMeToken.new(
      miniMeTokenFactory.address,
      ETH_ADDRESS,
      0,
      'DaoToken',
      18,
      'DAOT',
      true
    )

    vault = await _experimentalAppInstaller('vault')
    tokenManager = await _experimentalAppInstaller('token-manager', {
      skipInitialize: true,
    })

    await miniMeToken.changeController(tokenManager.address)
    await tokenManager.initialize([miniMeToken.address, false, 0])

    token = await ERC20.new(
      'Deposit Token',
      'DPT',
      MOCK_TOKEN_DECIMALS,
      MOCK_TOKEN_BALANCE
    )

    log(`Vault: ${vault.address}`)
    log(`MiniMeToken: ${miniMeToken.address}`)
    log(`TokenManager: ${tokenManager.address}`)
    log(`ERC20: ${token.address}`)
    log(`${accounts[0]} balance: ${await token.balanceOf(accounts[0])}`)
  },

  postInit: async (
    { proxy, _experimentalAppInstaller, log },
    { web3, artifacts }
  ) => {
    await tokenManager.createPermission('MINT_ROLE', proxy.address)
    await tokenManager.createPermission('BURN_ROLE', proxy.address)
    await vault.createPermission('TRANSFER_ROLE', proxy.address)
  },

  getInitParams: async ({ log }, { web3, artifacts }) => {
    return [
      tokenManager.address,
      vault.address,
      token.address,
      ONE_DAY,
      MAX_LOCKS,
    ]
  },

  postUpdate: async ({ proxy, log }, { web3, artifacts }) => {},
}
