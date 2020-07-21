const { assert } = require('chai')
const { assertRevert } = require('@aragon/contract-test-helpers/assertThrow')
const { newDao, newApp } = require('./helpers/dao')
const { setPermission } = require('./helpers/permissions')
const { timeTravel } = require('./helpers/time-travel')
const { stake, unstake, getBalances } = require('./helpers/utils')

const MiniMeToken = artifacts.require('MiniMeToken')
const MiniMeTokenFactory = artifacts.require('MiniMeTokenFactory')
const MockErc20 = artifacts.require('TokenMock')
const TokenManager = artifacts.require('TokenManager')
const StakingManager = artifacts.require('StakingManager')
const Vault = artifacts.require('Vault')
const { hash: nameHash } = require('eth-ens-namehash')

const ETH_ADDRESS = '0x0000000000000000000000000000000000000000'
const MOCK_TOKEN_BALANCE = 100000
const ONE_DAY = 86400
const MAX_LOCKS = 20
const LOCK_TIME = ONE_DAY * 7

contract('StakingManager', ([appManager, ACCOUNTS_1, ...accounts]) => {
  let miniMeToken,
    stakingManagerBase,
    stakingManager,
    tokenManager,
    tokenManagerBase,
    depositToken,
    vaultBase,
    vault
  let MINT_ROLE,
    BURN_ROLE,
    TRANSFER_ROLE,
    CHANGE_LOCK_TIME_ROLE,
    CHANGE_MAX_LOCKS_ROLE,
    CHANGE_VAULT_ROLE

  const NOT_CONTRACT = appManager

  before('deploy base apps', async () => {
    stakingManagerBase = await StakingManager.new()
    CHANGE_LOCK_TIME_ROLE = await stakingManagerBase.CHANGE_LOCK_TIME_ROLE()
    CHANGE_MAX_LOCKS_ROLE = await stakingManagerBase.CHANGE_MAX_LOCKS_ROLE()
    CHANGE_VAULT_ROLE = await stakingManagerBase.CHANGE_VAULT_ROLE()

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

    stakingManager = await StakingManager.at(
      await newApp(
        dao,
        nameHash('token-deposit.aragonpm.test'),
        stakingManagerBase.address,
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
        stakingManager.initialize(
          NOT_CONTRACT,
          vault.address,
          ETH_ADDRESS,
          ONE_DAY * 6,
          MAX_LOCKS
        ),
        'STAKING_MANAGER_ADDRESS_NOT_CONTRACT'
      )
    })

    it('Should revert when passed non-contract address as vault', async () => {
      await assertRevert(
        stakingManager.initialize(
          tokenManager.address,
          NOT_CONTRACT,
          ETH_ADDRESS,
          ONE_DAY * 6,
          MAX_LOCKS
        ),
        'STAKING_MANAGER_ADDRESS_NOT_CONTRACT'
      )
    })

    it('Should revert when passed non-contract address as deposit token', async () => {
      await assertRevert(
        stakingManager.initialize(
          tokenManager.address,
          vault.address,
          NOT_CONTRACT,
          ONE_DAY * 6,
          MAX_LOCKS
        ),
        'STAKING_MANAGER_ADDRESS_NOT_CONTRACT'
      )
    })
  })

  describe('initialize(address _tokenManager, address _vault, address address _depositToken, _uint256 _minLockTime, _uint256 maxLocks)', () => {
    beforeEach(async () => {
      await stakingManager.initialize(
        tokenManager.address,
        vault.address,
        depositToken.address,
        ONE_DAY * 6,
        MAX_LOCKS
      )
    })

    it('Should set correct variables', async () => {
      const actualTokenManager = await stakingManager.tokenManager()
      const actualVault = await stakingManager.vault()
      const actualDepositToken = await stakingManager.depositToken()

      assert.strictEqual(actualTokenManager, tokenManager.address)
      assert.strictEqual(actualVault, vault.address)
      assert.strictEqual(actualDepositToken, depositToken.address)
    })

    it('Should set able to set maxLocks and minLockTime and vault', async () => {
      await setPermission(
        acl,
        appManager,
        stakingManager.address,
        CHANGE_LOCK_TIME_ROLE,
        appManager
      )

      await setPermission(
        acl,
        appManager,
        stakingManager.address,
        CHANGE_MAX_LOCKS_ROLE,
        appManager
      )

      await setPermission(
        acl,
        appManager,
        stakingManager.address,
        CHANGE_VAULT_ROLE,
        appManager
      )

      await stakingManager.changeMinLockTime(ONE_DAY * 7, {
        from: appManager,
      })

      await stakingManager.changeMaxLocks(MAX_LOCKS + 1, {
        from: appManager,
      })

      await stakingManager.changeVault(vault.address, {
        from: appManager,
      })

      const maxLocks = parseInt(await stakingManager.maxLocks())
      const lockTime = parseInt(await stakingManager.minLockTime())

      assert.strictEqual(maxLocks, MAX_LOCKS + 1)
      assert.strictEqual(lockTime, ONE_DAY * 7)
    })

    it('Should not be able to set maxLocks because of no permission', async () => {
      await assertRevert(
        stakingManager.changeMaxLocks(MAX_LOCKS + 1, {
          from: appManager,
        }),
        'APP_AUTH_FAILED'
      )
    })

    it('Should not be able to set minLockTime because of no permission', async () => {
      await assertRevert(
        stakingManager.changeMinLockTime(ONE_DAY * 7, {
          from: appManager,
        }),
        'APP_AUTH_FAILED'
      )
    })

    it('Should not be able to set a new Vault because of no permission', async () => {
      await assertRevert(
        stakingManager.changeVault(vault.address, {
          from: appManager,
        }),
        'APP_AUTH_FAILED'
      )
    })

    describe('stake(uint256 _amount, uint256 _lockTime, address _receiver)', async () => {
      beforeEach(async () => {
        // NOTE nedeed MINT_ROLE assigned to token manager in order to call .mint within .stake
        await setPermission(
          acl,
          stakingManager.address,
          tokenManager.address,
          MINT_ROLE,
          appManager
        )
      })

      it('Should create wrapped tokens in exchange for DepositToken', async () => {
        const amountToWrap = 100

        const initBalances = await getBalances(depositToken, vault, appManager)
        await stake(
          depositToken,
          stakingManager,
          amountToWrap,
          LOCK_TIME,
          appManager,
          appManager
        )
        const actualBalances = await getBalances(
          depositToken,
          vault,
          appManager
        )

        assert.strictEqual(
          actualBalances.balanceReceiver,
          initBalances.balanceReceiver - amountToWrap
        )
        assert.strictEqual(
          actualBalances.balanceVault,
          initBalances.balanceVault + actualBalances.balanceVault
        )
      })

      it('Should not be able to stake without token approve', async () => {
        await assertRevert(
          stakingManager.stake(100, LOCK_TIME, appManager, {
            from: appManager,
          }),
          'STAKING_MANAGER_WRAP_REVERTED'
        )
      })

      it('Should not be able to perform more stake than allowed (maxLocks)', async () => {
        for (let i = 0; i < MAX_LOCKS; i++) {
          await stake(
            depositToken,
            stakingManager,
            1,
            LOCK_TIME,
            appManager,
            appManager
          )
        }

        await assertRevert(
          stake(
            depositToken,
            stakingManager,
            1,
            LOCK_TIME,
            appManager,
            appManager
          ),
          'STAKING_MANAGER_MAXIMUN_LOCKS_REACHED'
        )
      })

      it('Should not be able to stake more than you have approved', async () => {
        const amountToWrap = 100
        await depositToken.approve(stakingManager.address, amountToWrap / 2, {
          from: appManager,
        })

        await assertRevert(
          stakingManager.stake(amountToWrap, LOCK_TIME, appManager, {
            from: appManager,
          }),
          'STAKING_MANAGER_WRAP_REVERTED'
        )
      })

      it('Should not be able to stake with a lock time less than the minimun one', async () => {
        await assertRevert(
          stake(
            depositToken,
            stakingManager,
            20,
            LOCK_TIME / 2,
            appManager,
            appManager
          ),
          'STAKING_MANAGER_LOCK_TIME_TOO_LOW'
        )
      })
    })

    describe('unstake(uint256 _amount)', async () => {
      beforeEach(async () => {
        await setPermission(
          acl,
          stakingManager.address,
          tokenManager.address,
          MINT_ROLE,
          appManager
        )

        await setPermission(
          acl,
          stakingManager.address,
          tokenManager.address,
          BURN_ROLE,
          appManager
        )

        await setPermission(
          acl,
          stakingManager.address,
          vault.address,
          TRANSFER_ROLE,
          appManager
        )
      })

      it('Should be able to both staking and unstaking', async () => {
        const amountToUnwrap = 100

        const initBalances = await getBalances(depositToken, vault, appManager)
        await stake(
          depositToken,
          stakingManager,
          amountToUnwrap,
          LOCK_TIME,
          appManager,
          appManager
        )
        await timeTravel(ONE_DAY * 6 + ONE_DAY)
        await unstake(stakingManager, amountToUnwrap, appManager)
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
          actualBalances.balanceReceiver,
          actualBalances.balanceReceiver
        )
      })

      it('Should not be able to unstake more than you have', async () => {
        const amountToWrap = 100

        await stake(
          depositToken,
          stakingManager,
          amountToWrap,
          LOCK_TIME,
          appManager,
          appManager
        )
        await assertRevert(
          stakingManager.unstake(amountToWrap * 2, {
            from: appManager,
          }),
          'STAKING_MANAGER_NOT_ENOUGH_UNWRAPPABLE_TOKENS'
        )
      })

      it('Should not be able to unstake because it needs to wait the correct time', async () => {
        const amountToWrap = 100

        await stake(
          depositToken,
          stakingManager,
          amountToWrap,
          LOCK_TIME,
          appManager,
          appManager
        )
        await assertRevert(
          stakingManager.unstake(amountToWrap, {
            from: appManager,
          }),
          'STAKING_MANAGER_NOT_ENOUGH_UNWRAPPABLE_TOKENS'
        )
      })

      it('Should be able to unstake (partial ok 1)', async () => {
        const amountToWrap = 100
        const amountToUnwrap = 200

        const initBalances = await getBalances(depositToken, vault, appManager)
        await stake(
          depositToken,
          stakingManager,
          amountToWrap,
          LOCK_TIME,
          appManager,
          appManager
        )
        await timeTravel(ONE_DAY * 6 + ONE_DAY)
        await stake(
          depositToken,
          stakingManager,
          amountToWrap,
          LOCK_TIME,
          appManager,
          appManager
        )
        await timeTravel(ONE_DAY * 6 + ONE_DAY)
        await unstake(stakingManager, amountToUnwrap, appManager)
        const actualBalances = await getBalances(
          depositToken,
          vault,
          appManager
        )

        assert.strictEqual(
          actualBalances.balanceReceiver,
          initBalances.balanceReceiver
        )
        assert.strictEqual(
          actualBalances.balanceVault,
          initBalances.balanceVault
        )
      })

      it('Should not be able to unstake because it needs to wait the correct time (partial fail 1)', async () => {
        const amountToWrap = 100
        const amountToUnwrap = 200

        await stake(
          depositToken,
          stakingManager,
          amountToWrap,
          LOCK_TIME,
          appManager,
          appManager
        )
        await timeTravel(ONE_DAY * 6 + ONE_DAY)
        await stake(
          depositToken,
          stakingManager,
          amountToWrap,
          LOCK_TIME,
          appManager,
          appManager
        )

        // NOTE: trying to unstake 200 but only 100 are unlockable so the tx must be reverted
        await assertRevert(
          stakingManager.unstake(amountToUnwrap, {
            from: appManager,
          }),
          'STAKING_MANAGER_NOT_ENOUGH_UNWRAPPABLE_TOKENS'
        )
      })

      it('Should be able to unstake (partial ok 2)', async () => {
        const initBalances = await getBalances(depositToken, vault, appManager)
        await stake(
          depositToken,
          stakingManager,
          20,
          LOCK_TIME,
          appManager,
          appManager
        )
        await timeTravel(ONE_DAY * 6 + ONE_DAY)
        await stake(
          depositToken,
          stakingManager,
          20,
          LOCK_TIME,
          appManager,
          appManager
        )
        // NOTE: unstake 15 of first 20 wrapped tokens
        await unstake(stakingManager, 15, appManager)
        await timeTravel(ONE_DAY * 6 + ONE_DAY)
        await unstake(stakingManager, 1, appManager)
        await unstake(stakingManager, 1, appManager)
        await unstake(stakingManager, 20, appManager)
        await unstake(stakingManager, 1, appManager)
        await unstake(stakingManager, 1, appManager)
        await unstake(stakingManager, 1, appManager)

        const actualBalances = await getBalances(
          depositToken,
          vault,
          appManager
        )

        assert.strictEqual(
          actualBalances.balanceReceiver,
          initBalances.balanceReceiver
        )
        assert.strictEqual(
          actualBalances.balanceVault,
          initBalances.balanceVault
        )
      })

      it('Should not be able to unstake more than what you have wrapped (partial fail 2)', async () => {
        await stake(
          depositToken,
          stakingManager,
          20,
          LOCK_TIME,
          appManager,
          appManager
        )
        await timeTravel(ONE_DAY * 6 + ONE_DAY)
        await stake(
          depositToken,
          stakingManager,
          20,
          LOCK_TIME,
          appManager,
          appManager
        )
        await unstake(stakingManager, 15, appManager)
        await timeTravel(ONE_DAY * 6 + ONE_DAY)
        await unstake(stakingManager, 20, appManager)
        await assertRevert(
          stakingManager.unstake(10, {
            from: appManager,
          }),
          'STAKING_MANAGER_NOT_ENOUGH_UNWRAPPABLE_TOKENS'
        )
      })

      it('Should be able to unstake with different lock times', async () => {
        const initBalances = await getBalances(depositToken, vault, appManager)
        await stake(
          depositToken,
          stakingManager,
          20,
          LOCK_TIME,
          appManager,
          appManager
        )
        await timeTravel(LOCK_TIME * 2)
        await stake(
          depositToken,
          stakingManager,
          20,
          LOCK_TIME * 3,
          appManager,
          appManager
        )
        await unstake(stakingManager, 15, appManager)
        await timeTravel(LOCK_TIME * 5)
        await unstake(stakingManager, 1, appManager)
        await unstake(stakingManager, 1, appManager)
        await unstake(stakingManager, 20, appManager)
        await unstake(stakingManager, 1, appManager)
        await unstake(stakingManager, 1, appManager)
        await unstake(stakingManager, 1, appManager)

        const actualBalances = await getBalances(
          depositToken,
          vault,
          appManager
        )

        assert.strictEqual(
          actualBalances.balanceReceiver,
          initBalances.balanceReceiver
        )
        assert.strictEqual(
          actualBalances.balanceVault,
          initBalances.balanceVault
        )
      })

      it('Should be able to stake for a non sender address and unstake', async () => {
        const amountToUnwrap = 100
        const initBalances = await getBalances(depositToken, vault, ACCOUNTS_1)
        await stake(
          depositToken,
          stakingManager,
          amountToUnwrap,
          LOCK_TIME,
          ACCOUNTS_1,
          appManager
        )
        await timeTravel(LOCK_TIME * 2)
        await unstake(stakingManager, amountToUnwrap, ACCOUNTS_1)
        const actualBalances = await getBalances(
          depositToken,
          vault,
          ACCOUNTS_1
        )

        assert.strictEqual(
          actualBalances.balanceReceiver,
          initBalances.balanceReceiver + amountToUnwrap
        )
        assert.strictEqual(
          actualBalances.balanceVault,
          initBalances.balanceVault
        )
      })

      it('Should not be able to stake for a non sender address and unstake to msg.sender', async () => {
        await stake(
          depositToken,
          stakingManager,
          100,
          LOCK_TIME,
          ACCOUNTS_1,
          appManager
        )
        await assertRevert(
          unstake(stakingManager, 100, appManager),
          'STAKING_MANAGER_NOT_ENOUGH_UNWRAPPABLE_TOKENS'
        )
      })

      it('Should be able to insert in an empty slot', async () => {
        const expectedLock = undefined
        for (let i = 0; i < MAX_LOCKS; i++) {
          await stake(
            depositToken,
            stakingManager,
            10,
            LOCK_TIME,
            appManager,
            appManager
          )
        }

        await timeTravel(LOCK_TIME)

        await unstake(stakingManager, 12, appManager)
        await stake(
          depositToken,
          stakingManager,
          10,
          LOCK_TIME,
          appManager,
          appManager
        )
        await unstake(stakingManager, 12, appManager)
        await unstake(stakingManager, 12, appManager)
        await stake(
          depositToken,
          stakingManager,
          10,
          LOCK_TIME,
          appManager,
          appManager
        )
        await stake(
          depositToken,
          stakingManager,
          10,
          LOCK_TIME,
          appManager,
          appManager
        )

        const locks = await stakingManager.getStakedLocks(appManager)
        const lock = locks.find(
          ({ lockDate, lockTime, amount }) =>
            lockDate === '0' && lockTime === '0' && amount === '0'
        )

        assert.strictEqual(lock, expectedLock)
      })

      it('Should be able to stake MAX_LOCKS times, unstake MAX_LOCKS * 2 times(unstake with amount / 2) and wrapping other MAX_LOCKS times', async () => {
        const expectedBalance = 200
        const expectedLock = undefined

        const initBalances = await getBalances(depositToken, vault, appManager)
        for (let i = 0; i < MAX_LOCKS; i++) {
          await stake(
            depositToken,
            stakingManager,
            expectedBalance / MAX_LOCKS,
            LOCK_TIME,
            appManager,
            appManager
          )
        }

        await timeTravel(LOCK_TIME * 2)

        for (let i = 0; i < MAX_LOCKS * 2; i++) {
          await unstake(
            stakingManager,
            expectedBalance / MAX_LOCKS / 2,
            appManager
          )
        }

        let locks = await stakingManager.getStakedLocks(appManager)
        let filtered = locks.filter(
          ({ lockDate, duration, amount }) =>
            lockDate === '0' && duration === '0' && amount === '0'
        )

        assert.strictEqual(locks.length, filtered.length)

        for (let i = 0; i < MAX_LOCKS; i++) {
          await stake(
            depositToken,
            stakingManager,
            expectedBalance / MAX_LOCKS,
            LOCK_TIME,
            appManager,
            appManager
          )
        }

        locks = await stakingManager.getStakedLocks(appManager)
        const lock = locks.find(
          ({ lockDate, lockTime, amount }) =>
            lockDate === '0' && lockTime === '0' && amount === '0'
        )

        const actualBalances = await getBalances(
          depositToken,
          vault,
          appManager
        )

        assert.strictEqual(lock, expectedLock)

        assert.strictEqual(
          actualBalances.balanceReceiver,
          initBalances.balanceReceiver - expectedBalance
        )
      })

      it('Should be able to stake MAX_LOCKS times and unstake in two times', async () => {
        const expectedBalance = 200

        const initBalances = await getBalances(depositToken, vault, appManager)
        for (let i = 0; i < MAX_LOCKS; i++) {
          await stake(
            depositToken,
            stakingManager,
            expectedBalance / MAX_LOCKS,
            LOCK_TIME,
            appManager,
            appManager
          )
        }

        await timeTravel(LOCK_TIME * 2)

        await unstake(stakingManager, expectedBalance - 3, appManager)
        await unstake(stakingManager, 3, appManager)

        const actualBalances = await getBalances(
          depositToken,
          vault,
          appManager
        )

        assert.strictEqual(
          actualBalances.balanceReceiver,
          initBalances.balanceReceiver
        )
        assert.strictEqual(
          actualBalances.balanceVault,
          initBalances.balanceVault
        )
      })

      it('Should be able to unwrap after changing CHANGE_MAX_LOCKS_ROLE until MAX_LOCKS + 1', async () => {
        await setPermission(
          acl,
          appManager,
          stakingManager.address,
          CHANGE_MAX_LOCKS_ROLE,
          appManager
        )

        await stakingManager.changeMaxLocks(MAX_LOCKS + 1, {
          from: appManager,
        })

        for (let i = 0; i < MAX_LOCKS + 1; i++) {
          await stake(
            depositToken,
            stakingManager,
            10,
            LOCK_TIME,
            appManager,
            appManager
          )
        }

        await assertRevert(
          stakingManager.stake(10, LOCK_TIME, appManager, {
            from: appManager,
          }),
          'STAKING_MANAGER_MAXIMUN_LOCKS_REACHED'
        )
      })
    })
  })
})
