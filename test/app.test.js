const { assert } = require('chai')
const { assertRevert } = require('@aragon/contract-test-helpers/assertThrow')
const { newDao, newApp } = require('./helpers/dao')
const { setPermission } = require('./helpers/permissions')
const timeTravel = require('./helpers/time-travel')
const { wrap, unwrap, getBalances } = require('./helpers/utils')

const MiniMeToken = artifacts.require('MiniMeToken')
const MiniMeTokenFactory = artifacts.require('MiniMeTokenFactory')
const MockErc20 = artifacts.require('TokenMock')
const TokenManager = artifacts.require('TokenManager')
const LockableTokenWrapper = artifacts.require('LockableTokenWrapper')
const Vault = artifacts.require('Vault')
const { hash: nameHash } = require('eth-ens-namehash')

const ETH_ADDRESS = '0x0000000000000000000000000000000000000000'
const MOCK_TOKEN_BALANCE = 100000
const ONE_DAY = 86400
const MAX_LOCKS = 20
const LOCK_TIME = ONE_DAY * 7

contract('LockableTokenWrapper', ([appManager, ...accounts]) => {
  let miniMeToken,
    lockableTokenWrapperBase,
    lockableTokenWrapper,
    tokenManager,
    tokenManagerBase,
    depositToken,
    vaultBase,
    vault
  let MINT_ROLE,
    BURN_ROLE,
    TRANSFER_ROLE,
    CHANGE_LOCK_TIME_ROLE,
    CHANGE_MAX_LOCKS_ROLE

  const NOT_CONTRACT = appManager

  before('deploy base apps', async () => {
    lockableTokenWrapperBase = await LockableTokenWrapper.new()
    CHANGE_LOCK_TIME_ROLE = await lockableTokenWrapperBase.CHANGE_LOCK_TIME_ROLE()
    CHANGE_MAX_LOCKS_ROLE = await lockableTokenWrapperBase.CHANGE_MAX_LOCKS_ROLE()

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
        lockableTokenWrapperBase.address,
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

  describe('initialize(address _tokenManager, address _vault, address _depositToken, _uint256 _minLockTime _uint256 maxLocks) fails', async () => {
    it('Should revert when passed non-contract address as token manager', async () => {
      await assertRevert(
        lockableTokenWrapper.initialize(
          NOT_CONTRACT,
          vault.address,
          ETH_ADDRESS,
          ONE_DAY * 6,
          MAX_LOCKS
        ),
        'LOCKABLE_TOKEN_WRAPPER_ADDRESS_NOT_CONTRACT'
      )
    })

    it('Should revert when passed non-contract address as vault', async () => {
      await assertRevert(
        lockableTokenWrapper.initialize(
          tokenManager.address,
          NOT_CONTRACT,
          ETH_ADDRESS,
          ONE_DAY * 6,
          MAX_LOCKS
        ),
        'LOCKABLE_TOKEN_WRAPPER_ADDRESS_NOT_CONTRACT'
      )
    })

    it('Should revert when passed non-contract address as deposit token', async () => {
      await assertRevert(
        lockableTokenWrapper.initialize(
          tokenManager.address,
          vault.address,
          NOT_CONTRACT,
          ONE_DAY * 6,
          MAX_LOCKS
        ),
        'LOCKABLE_TOKEN_WRAPPER_ADDRESS_NOT_CONTRACT'
      )
    })
  })

  describe('initialize(address _tokenManager, address _vault, address address _depositToken, _uint256 _minLockTime, _uint256 maxLocks)', () => {
    beforeEach(async () => {
      await lockableTokenWrapper.initialize(
        tokenManager.address,
        vault.address,
        depositToken.address,
        ONE_DAY * 6,
        MAX_LOCKS
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

    it('Should set able to set maxLocks and minLockTime', async () => {
      await setPermission(
        acl,
        appManager,
        lockableTokenWrapper.address,
        CHANGE_LOCK_TIME_ROLE,
        appManager
      )

      await setPermission(
        acl,
        appManager,
        lockableTokenWrapper.address,
        CHANGE_MAX_LOCKS_ROLE,
        appManager
      )

      await lockableTokenWrapper.changeMinLockTime(ONE_DAY * 7, {
        from: appManager,
      })

      await lockableTokenWrapper.changeMaxLocks(MAX_LOCKS + 1, {
        from: appManager,
      })

      const maxLocks = parseInt(await lockableTokenWrapper.maxLocks())
      const lockTime = parseInt(await lockableTokenWrapper.minLockTime())

      assert.strictEqual(maxLocks, MAX_LOCKS + 1)
      assert.strictEqual(lockTime, ONE_DAY * 7)
    })

    it('Should not ne able to set maxLocks because of no permission', async () => {
      await assertRevert(
        lockableTokenWrapper.changeMaxLocks(MAX_LOCKS + 1, {
          from: appManager,
        }),
        'APP_AUTH_FAILED'
      )
    })

    it('Should not ne able to set minLockTime because of no permission', async () => {
      await assertRevert(
        lockableTokenWrapper.changeMinLockTime(ONE_DAY * 7, {
          from: appManager,
        }),
        'APP_AUTH_FAILED'
      )
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

        const initBalances = await getBalances(depositToken, vault, appManager)
        await wrap(depositToken, lockableTokenWrapper, amountToWrap, LOCK_TIME, appManager)
        const actualBalances = await getBalances(
          depositToken,
          vault,
          appManager
        )

        assert.strictEqual(
          actualBalances.balanceAppManager,
          initBalances.balanceAppManager - amountToWrap
        )
        assert.strictEqual(
          actualBalances.balanceVault,
          initBalances.balanceVault + actualBalances.balanceVault
        )
      })

      it('Should not be able to wrap without token approve', async () => {
        await assertRevert(
          lockableTokenWrapper.wrap(100, LOCK_TIME, {
            from: appManager,
          }),
          'LOCKABLE_TOKEN_WRAPPER_WRAP_REVERTED'
        )
      })

      it('Should not be able to perform more wrap than allowed (maxLocks)', async () => {
        for (let i = 0; i < MAX_LOCKS; i++) {
          await wrap(depositToken, lockableTokenWrapper, 1, LOCK_TIME, appManager)
        }

        await assertRevert(
          wrap(depositToken, lockableTokenWrapper, 1, LOCK_TIME, appManager),
          'LOCKABLE_TOKEN_WRAPPER_MAXIMUN_LOCKS_REACHED'
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
          lockableTokenWrapper.wrap(amountToWrap, LOCK_TIME, {
            from: appManager,
          }),
          'LOCKABLE_TOKEN_WRAPPER_WRAP_REVERTED'
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

        const initBalances = await getBalances(depositToken, vault, appManager)
        await wrap(
          depositToken,
          lockableTokenWrapper,
          amountToUnwrap,
          LOCK_TIME,
          appManager
        )
        await timeTravel(new Date().getSeconds() + ONE_DAY * 6 + ONE_DAY)
        await unwrap(lockableTokenWrapper, amountToUnwrap, appManager)
        const actualBalances = await getBalances(
          depositToken,
          vault,
          appManager
        )

        assert.strictEqual(
          actualBalances.balanceVault,
          initBalances.balanceVault
        )
        assert.strictEqual(
          actualBalances.balanceAppManager,
          actualBalances.balanceAppManager
        )
      })

      it('Should not be able to unwrap more than you have', async () => {
        const amountToWrap = 100

        await wrap(depositToken, lockableTokenWrapper, amountToWrap, LOCK_TIME, appManager)
        await assertRevert(
          lockableTokenWrapper.unwrap(amountToWrap * 2, {
            from: appManager,
          }),
          'LOCKABLE_TOKEN_WRAPPER_INSUFFICENT_UNWRAP_TOKENS'
        )
      })

      it('Should not be able to unwrap because it needs to wait the correct time', async () => {
        const amountToWrap = 100

        await wrap(depositToken, lockableTokenWrapper, amountToWrap, LOCK_TIME, appManager)
        await assertRevert(
          lockableTokenWrapper.unwrap(amountToWrap, {
            from: appManager,
          }),
          'LOCKABLE_TOKEN_WRAPPER_NOT_ENOUGH_UNWRAPPABLE_TOKENS'
        )
      })

      it('Should be able to unwrap (partial ok 1)', async () => {
        const amountToWrap = 100
        const amountToUnwrap = 200

        const initBalances = await getBalances(depositToken, vault, appManager)
        await wrap(depositToken, lockableTokenWrapper, amountToWrap, LOCK_TIME, appManager)
        await timeTravel(new Date().getSeconds() + ONE_DAY * 6 + ONE_DAY)
        await wrap(depositToken, lockableTokenWrapper, amountToWrap, LOCK_TIME, appManager)
        await timeTravel(new Date().getSeconds() + ONE_DAY * 6 + ONE_DAY)
        await unwrap(lockableTokenWrapper, amountToUnwrap, appManager)
        const actualBalances = await getBalances(
          depositToken,
          vault,
          appManager
        )

        assert.strictEqual(
          actualBalances.balanceAppManager,
          initBalances.balanceAppManager
        )
        assert.strictEqual(
          actualBalances.balanceVault,
          initBalances.balanceVault
        )
      })

      it('Should not be able to unwrap because it needs to wait the correct time (partial fail 1)', async () => {
        const amountToWrap = 100
        const amountToUnwrap = 200

        await wrap(depositToken, lockableTokenWrapper, amountToWrap, LOCK_TIME, appManager)
        await timeTravel(new Date().getSeconds() + ONE_DAY * 6 + ONE_DAY)
        await wrap(depositToken, lockableTokenWrapper, amountToWrap, LOCK_TIME, appManager)

        // NOTE: trying to unwrap 200 but only 100 are unlockable so the tx must be reverted
        await assertRevert(
          lockableTokenWrapper.unwrap(amountToUnwrap, {
            from: appManager,
          }),
          'LOCKABLE_TOKEN_WRAPPER_NOT_ENOUGH_UNWRAPPABLE_TOKENS'
        )
      })

      it('Should be able to unwrap (partial ok 2)', async () => {
        const initBalances = await getBalances(depositToken, vault, appManager)
        await wrap(depositToken, lockableTokenWrapper, 20, LOCK_TIME, appManager)
        await timeTravel(new Date().getSeconds() + ONE_DAY * 6 + ONE_DAY)
        await wrap(depositToken, lockableTokenWrapper, 20, LOCK_TIME, appManager)
        // NOTE: unwrap 15 of first 20 wrapped tokens
        await unwrap(lockableTokenWrapper, 15, appManager)
        await timeTravel(new Date().getSeconds() + ONE_DAY * 6 + ONE_DAY)
        await unwrap(lockableTokenWrapper, 1, appManager)
        await unwrap(lockableTokenWrapper, 1, appManager)
        await unwrap(lockableTokenWrapper, 20, appManager)
        await unwrap(lockableTokenWrapper, 1, appManager)
        await unwrap(lockableTokenWrapper, 1, appManager)
        await unwrap(lockableTokenWrapper, 1, appManager)

        const actualBalances = await getBalances(
          depositToken,
          vault,
          appManager
        )

        assert.strictEqual(
          actualBalances.balanceAppManager,
          initBalances.balanceAppManager
        )
        assert.strictEqual(
          actualBalances.balanceVault,
          initBalances.balanceVault
        )
      })

      it('Should not be able to unwrap more than what you have wrapped (partial fail 2)', async () => {
        await wrap(depositToken, lockableTokenWrapper, 20, LOCK_TIME, appManager)
        await timeTravel(new Date().getSeconds() + ONE_DAY * 6 + ONE_DAY)
        await wrap(depositToken, lockableTokenWrapper, 20, LOCK_TIME, appManager)
        await unwrap(lockableTokenWrapper, 15, appManager)
        await timeTravel(new Date().getSeconds() + ONE_DAY * 6 + ONE_DAY)
        await unwrap(lockableTokenWrapper, 20, appManager)
        await assertRevert(
          lockableTokenWrapper.unwrap(10, {
            from: appManager,
          }),
          'LOCKABLE_TOKEN_WRAPPER_INSUFFICENT_UNWRAP_TOKENS'
        )
      })
    })
  })
})
