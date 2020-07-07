const { assert } = require('chai')
const { assertRevert } = require('@aragon/contract-test-helpers/assertThrow')
const { newDao, newApp } = require('./helpers/dao')
const { setOpenPermission, setPermission } = require('./helpers/permissions')

const MiniMeToken = artifacts.require('MiniMeToken')
const MiniMeTokenFactory = artifacts.require('MiniMeTokenFactory')
const MockErc20 = artifacts.require('TokenMock')
const TokenManager = artifacts.require('TokenManager')
const LockableTokenWrapper = artifacts.require('LockableTokenWrapper')
const Vault = artifacts.require('Vault')
const { hash: nameHash } = require('eth-ens-namehash')

const ETH_ADDRESS = '0x0000000000000000000000000000000000000000'
const MOCK_TOKEN_BALANCE = 100000

contract('LockableTokenWrapper', ([appManager, ...accounts]) => {
  let miniMeToken,
    externalTokenWrapperBase,
    lockableTokenWrapper,
    tokenManager,
    tokenManagerBase,
    depositToken,
    vaultBase,
    vault
  let MINT_ROLE, BURN_ROLE, TRANSFER_ROLE

  const NOT_CONTRACT = appManager

  before('deploy base apps', async () => {
    externalTokenWrapperBase = await LockableTokenWrapper.new()

    tokenManagerBase = await TokenManager.new()
    MINT_ROLE = await tokenManagerBase.MINT_ROLE()
    BURN_ROLE = await tokenManagerBase.BURN_ROLE()

    vaultBase = await Vault.new()
    TRANSFER_ROLE = await vaultBase.TRANSFER_ROLE()
  })

  beforeEach('deploy dao and token deposit', async () => {
    const daoDeployment = await newDao(appManager)
    dao = daoDeployment.dao
    acl = daoDeployment.acl

    const miniMeTokenFactory = await MiniMeTokenFactory.new()
    miniMeToken = await MiniMeToken.new(
      miniMeTokenFactory.address,
      ETH_ADDRESS,
      0,
      'DaoToken',
      18,
      'DPT',
      true
    )

    lockableTokenWrapper = await LockableTokenWrapper.at(
      await newApp(
        dao,
        nameHash('token-deposit.aragonpm.test'),
        externalTokenWrapperBase.address,
        appManager
      )
    )

    tokenManager = await TokenManager.at(
      await newApp(
        dao,
        nameHash('token-manager.aragonpm.test'),
        tokenManagerBase.address,
        appManager
      )
    )
    await miniMeToken.changeController(tokenManager.address)

    vault = await Vault.at(
      await newApp(
        dao,
        nameHash('vault.aragonpm.test'),
        vaultBase.address,
        appManager
      )
    )

    await vault.initialize()
    await tokenManager.initialize(miniMeToken.address, false, 0)

    depositToken = await MockErc20.new(appManager, MOCK_TOKEN_BALANCE)
  })

  describe('initialize(address _tokenManager, address _vault, address _depositToken) fails', async () => {
    it('Should revert when passed non-contract address as token manager', async () => {
      await assertRevert(
        lockableTokenWrapper.initialize(
          NOT_CONTRACT,
          vault.address,
          ETH_ADDRESS
        ),
        'EXTERNAL_TOKEN_WRAPPER_ADDRESS_NOT_CONTRACT'
      )
    })

    it('Should revert when passed non-contract address as vault', async () => {
      await assertRevert(
        lockableTokenWrapper.initialize(
          tokenManager.address,
          NOT_CONTRACT,
          ETH_ADDRESS
        ),
        'EXTERNAL_TOKEN_WRAPPER_ADDRESS_NOT_CONTRACT'
      )
    })

    it('Should revert when passed non-contract address as deposit token', async () => {
      await assertRevert(
        lockableTokenWrapper.initialize(
          tokenManager.address,
          vault.address,
          NOT_CONTRACT
        ),
        'EXTERNAL_TOKEN_WRAPPER_ADDRESS_NOT_CONTRACT'
      )
    })
  })

  describe('initialize(address _tokenManager, address _vault, address address _depositToken)', () => {
    beforeEach(async () => {
      await lockableTokenWrapper.initialize(
        tokenManager.address,
        vault.address,
        depositToken.address
      )
    })

    it('Should set correct variables', async () => {
      const actualTokenManager = await lockableTokenWrapper.tokenManager()
      const actualVault = await lockableTokenWrapper.vault()
      const actualDepositToken = await lockableTokenWrapper.depositToken()

      assert.strictEqual(actualTokenManager, tokenManager.address)
      assert.strictEqual(actualVault, vault.address)
      assert.strictEqual(actualDepositToken, depositToken.address)
    })

    describe('wrap(uint256 _amount)', async () => {
      beforeEach(async () => {
        // NOTE nedeed MINT_ROLE assigned to token manager in order to call .mint within .wrap
        await setPermission(
          acl,
          lockableTokenWrapper.address,
          tokenManager.address,
          MINT_ROLE,
          appManager
        )
      })

      it('Should create wrapped tokens in exchange for DepositToken', async () => {
        const amountToWrap = 100

        const initialBalanceAppManager = parseInt(
          await depositToken.balanceOf(appManager)
        )

        const initialBalanceVault = parseInt(
          await vault.balance(depositToken.address)
        )

        await depositToken.approve(lockableTokenWrapper.address, amountToWrap, {
          from: appManager,
        })

        await lockableTokenWrapper.wrap(amountToWrap, {
          from: appManager,
        })

        const actualBalanceAppManager = parseInt(
          await depositToken.balanceOf(appManager)
        )

        const actualBalanceVault = parseInt(
          await vault.balance(depositToken.address)
        )

        assert.strictEqual(
          actualBalanceAppManager,
          initialBalanceAppManager - amountToWrap
        )
        assert.strictEqual(
          actualBalanceVault,
          initialBalanceVault + actualBalanceVault
        )
      })

      it('Should not be able to wrap without token approve', async () => {
        await assertRevert(
          lockableTokenWrapper.wrap(100, {
            from: appManager,
          }),
          'EXTERNAL_TOKEN_WRAPPER_WRAP_REVERTED'
        )
      })

      it('Should not be able to wrap more than you have approved', async () => {
        const amountToWrap = 100
        await depositToken.approve(
          lockableTokenWrapper.address,
          amountToWrap / 2,
          {
            from: appManager,
          }
        )

        await assertRevert(
          lockableTokenWrapper.wrap(amountToWrap, {
            from: appManager,
          }),
          'EXTERNAL_TOKEN_WRAPPER_WRAP_REVERTED'
        )
      })
    })

    describe('unwrap(uint256 _amount)', async () => {
      beforeEach(async () => {
        await setPermission(
          acl,
          lockableTokenWrapper.address,
          tokenManager.address,
          MINT_ROLE,
          appManager
        )

        await setPermission(
          acl,
          lockableTokenWrapper.address,
          tokenManager.address,
          BURN_ROLE,
          appManager
        )

        await setPermission(
          acl,
          lockableTokenWrapper.address,
          vault.address,
          TRANSFER_ROLE,
          appManager
        )
      })

      it('Should burn WrappedToken(s) in exchange for DepositToken', async () => {
        const amountToUnwrap = 100

        const initialBalanceAppManager = parseInt(
          await depositToken.balanceOf(appManager)
        )

        const initialBalanceVault = parseInt(
          await vault.balance(depositToken.address)
        )

        await depositToken.approve(
          lockableTokenWrapper.address,
          amountToUnwrap,
          {
            from: appManager,
          }
        )

        await lockableTokenWrapper.wrap(amountToUnwrap, {
          from: appManager,
        })

        await lockableTokenWrapper.unwrap(amountToUnwrap, {
          from: appManager,
        })

        const actualBalanceAppManager = parseInt(
          await depositToken.balanceOf(appManager)
        )

        const actualBalanceVault = parseInt(
          await vault.balance(depositToken.address)
        )

        assert.strictEqual(actualBalanceAppManager, initialBalanceAppManager)
        assert.strictEqual(actualBalanceVault, initialBalanceVault)
      })

      it('Should not be able to unwrap more than you have', async () => {
        const amountToWrap = 100

        await depositToken.approve(lockableTokenWrapper.address, amountToWrap, {
          from: appManager,
        })

        await lockableTokenWrapper.wrap(amountToWrap, {
          from: appManager,
        })

        await assertRevert(
          lockableTokenWrapper.unwrap(amountToWrap * 2, {
            from: appManager,
          }),
          'EXTERNAL_TOKEN_WRAPPER_INSUFFICENT_UNWRAP_TOKENS'
        )
      })
    })
  })
})
