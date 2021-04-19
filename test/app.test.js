const { assert } = require('chai')
const { assertRevert } = require('@aragon/test-helpers/assertThrow')
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
    wrappedTokenManager,
    tokenManagerBase,
    depositToken,
    vaultBase,
    vault
  let MINT_ROLE, BURN_ROLE, TRANSFER_ROLE, CHANGE_LOCK_TIME_ROLE, CHANGE_MAX_LOCKS_ROLE, CHANGE_VAULT_ROLE

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
    miniMeToken = await MiniMeToken.new(miniMeTokenFactory.address, ETH_ADDRESS, 0, 'DaoToken', 18, 'DPT', true)

    stakingManager = await StakingManager.at(
      await newApp(dao, nameHash('staking-manager.aragonpm.test'), stakingManagerBase.address, appManager)
    )

    wrappedTokenManager = await TokenManager.at(
      await newApp(dao, nameHash('token-manager.aragonpm.test'), tokenManagerBase.address, appManager)
    )
    await miniMeToken.changeController(wrappedTokenManager.address)

    vault = await Vault.at(await newApp(dao, nameHash('vault.aragonpm.test'), vaultBase.address, appManager))
    await vault.initialize()
    await wrappedTokenManager.initialize(miniMeToken.address, false, 0)

    depositToken = await MockErc20.new(appManager, MOCK_TOKEN_BALANCE)
  })

  describe('initialize(address _tokenManager, address _vault, address _depositToken, _uint256 _minLockTime _uint256 maxLocks) fails', async () => {
    it('Should revert when passed non-contract address as token manager', async () => {
      await assertRevert(
        stakingManager.initialize(NOT_CONTRACT, vault.address, ETH_ADDRESS, ONE_DAY * 6, MAX_LOCKS),
        'STAKING_MANAGER_ADDRESS_NOT_CONTRACT'
      )
    })

    it('Should revert when passed non-contract address as vault', async () => {
      await assertRevert(
        stakingManager.initialize(wrappedTokenManager.address, NOT_CONTRACT, ETH_ADDRESS, ONE_DAY * 6, MAX_LOCKS),
        'STAKING_MANAGER_ADDRESS_NOT_CONTRACT'
      )
    })

    it('Should revert when passed non-contract address as deposit token', async () => {
      await assertRevert(
        stakingManager.initialize(wrappedTokenManager.address, vault.address, NOT_CONTRACT, ONE_DAY * 6, MAX_LOCKS),
        'STAKING_MANAGER_ADDRESS_NOT_CONTRACT'
      )
    })
  })

  describe('initialize(address _tokenManager, address _vault, address address _depositToken, _uint256 _minLockTime, _uint256 maxLocks)', () => {
    beforeEach(async () => {
      await stakingManager.initialize(
        wrappedTokenManager.address,
        vault.address,
        depositToken.address,
        ONE_DAY * 6,
        MAX_LOCKS
      )
    })

    it('Should set correct variables', async () => {
      const actualTokenManager = await stakingManager.wrappedTokenManager()
      const actualVault = await stakingManager.vault()
      const actualDepositToken = await stakingManager.depositToken()
      assert.strictEqual(actualTokenManager, wrappedTokenManager.address)
      assert.strictEqual(actualVault, vault.address)
      assert.strictEqual(actualDepositToken, depositToken.address)
    })

    it('Should set able to set maxLocks and minLockTime and vault', async () => {
      await setPermission(acl, appManager, stakingManager.address, CHANGE_LOCK_TIME_ROLE, appManager)
      await setPermission(acl, appManager, stakingManager.address, CHANGE_MAX_LOCKS_ROLE, appManager)
      await setPermission(acl, appManager, stakingManager.address, CHANGE_VAULT_ROLE, appManager)
      await stakingManager.changeMinLockTime(ONE_DAY * 7, {
        from: appManager,
      })
      await stakingManager.changeMaxAllowedStakeLocks(MAX_LOCKS - 1, {
        from: appManager,
      })
      await stakingManager.changeVaultContractAddress(vault.address, {
        from: appManager,
      })

      const maxLocks = parseInt(await stakingManager.maxLocks())
      const lockTime = parseInt(await stakingManager.minLockTime())
      assert.strictEqual(maxLocks, MAX_LOCKS - 1)
      assert.strictEqual(lockTime, ONE_DAY * 7)
    })

    it('Should not be able to set maxLocks because of no permission', async () => {
      await assertRevert(
        stakingManager.changeMaxAllowedStakeLocks(MAX_LOCKS + 1, {
          from: appManager,
        }),
        'APP_AUTH_FAILED'
      )
    })

    it('Should not be able to set maxLocks because of of value too high', async () => {
      await setPermission(acl, appManager, stakingManager.address, CHANGE_MAX_LOCKS_ROLE, appManager)

      await assertRevert(
        stakingManager.changeMaxAllowedStakeLocks(MAX_LOCKS + 1, {
          from: appManager,
        }),
        'STAKING_MANAGER_MAX_LOCKS_TOO_HIGH'
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
        stakingManager.changeVaultContractAddress(vault.address, {
          from: appManager,
        }),
        'APP_AUTH_FAILED'
      )
    })

    describe('stake(uint256 _amount, uint256 _lockTime, address _receiver)', async () => {
      beforeEach(async () => {
        // NOTE nedeed MINT_ROLE assigned to token manager in order to call .mint within .stake
        await setPermission(acl, stakingManager.address, wrappedTokenManager.address, MINT_ROLE, appManager)
      })

      it('Should create wrapped tokens in exchange for DepositToken', async () => {
        const amountToStake = 100
        const initBalances = await getBalances(depositToken, vault, appManager)
        await stake(depositToken, stakingManager, amountToStake, LOCK_TIME, appManager, appManager)
        const actualBalances = await getBalances(depositToken, vault, appManager)
        assert.strictEqual(actualBalances.balanceReceiver, initBalances.balanceReceiver - amountToStake)
        assert.strictEqual(actualBalances.balanceVault, initBalances.balanceVault + actualBalances.balanceVault)
      })

      it('Should not be able to stake without token approve', async () => {
        await assertRevert(
          stakingManager.stake(100, LOCK_TIME, appManager, {
            from: appManager,
          }),
          'STAKING_MANAGER_TOKENS_NOT_APPROVED'
        )
      })

      it('Should not be able to perform more stake than allowed (maxLocks)', async () => {
        for (let i = 0; i < MAX_LOCKS; i++) {
          await stake(depositToken, stakingManager, 1, LOCK_TIME, appManager, appManager)
        }

        await assertRevert(
          stake(depositToken, stakingManager, 1, LOCK_TIME, appManager, appManager),
          'STAKING_MANAGER_IMPOSSIBLE_TO_INSERT'
        )
      })

      it('Should not be able to stake more than you have approved', async () => {
        const amountToStake = 100
        await depositToken.approve(stakingManager.address, amountToStake / 2, {
          from: appManager,
        })

        await assertRevert(
          stakingManager.stake(amountToStake, LOCK_TIME, appManager, {
            from: appManager,
          }),
          'STAKING_MANAGER_TOKENS_NOT_APPROVED'
        )
      })

      it('Should not be able to stake with a lock time less than the minimun one', async () => {
        await assertRevert(
          stake(depositToken, stakingManager, 20, LOCK_TIME / 2, appManager, appManager),
          'STAKING_MANAGER_LOCK_TIME_TOO_LOW'
        )
      })

      it('Should return a correct value when getting number of staked locks', async () => {
        for (let i = 0; i < MAX_LOCKS; i++) {
          await stake(depositToken, stakingManager, 200 / MAX_LOCKS, LOCK_TIME, appManager, appManager)
        }
        const numberOfLocks = await stakingManager.getNumberOfStakedLocks(appManager)
        assert.strictEqual(parseInt(numberOfLocks), MAX_LOCKS)
      })

      it('Should return a correct value when getting number of staked locks after having staked', async () => {
        const numberOfLocks = await stakingManager.getNumberOfStakedLocks(appManager)
        assert.strictEqual(parseInt(numberOfLocks), 0)
      })

      it('Should be able to increase a lock duration', async () => {
        await stake(depositToken, stakingManager, 100, LOCK_TIME, appManager, appManager)
        await stakingManager.increaseLockDuration(0, LOCK_TIME, { from: appManager })
        const locks = await stakingManager.getStakedLocks(appManager)
        assert.strictEqual(locks[0].duration.toString(), (LOCK_TIME * 2).toString())
      })

      it('Should not be able to increase a lock duration because lock does not exists (1)', async () => {
        await stake(depositToken, stakingManager, 100, LOCK_TIME, appManager, appManager)
        await assertRevert(
          stakingManager.increaseLockDuration(1, LOCK_TIME, { from: appManager }),
          'STAKING_MANAGER_LOCK_NOT_EXIST'
        )
      })

      it('Should not be able to increase a lock duration because lock does not exists (2)', async () => {
        await stake(depositToken, stakingManager, 100, LOCK_TIME, appManager, appManager)
        await assertRevert(
          stakingManager.increaseLockDuration(0, LOCK_TIME, { from: ACCOUNTS_1 }),
          'STAKING_MANAGER_LOCK_NOT_EXIST'
        )
      })

      it('Should be able to increase more than 1 lock duration (1)', async () => {
        await stake(depositToken, stakingManager, 100, LOCK_TIME, appManager, appManager)
        await stake(depositToken, stakingManager, 100, LOCK_TIME, appManager, appManager)
        await stakingManager.increaseLockDuration(0, 1, { from: appManager })
        await stakingManager.increaseLockDuration(1, 2, { from: appManager })
        const locks = await stakingManager.getStakedLocks(appManager)
        assert.strictEqual(locks[0].duration.toString(), (LOCK_TIME + 1).toString())
        assert.strictEqual(locks[1].duration.toString(), (LOCK_TIME + 2).toString())
      })

      it('Should be able to increase more than 1 lock duration (2)', async () => {
        await stake(depositToken, stakingManager, 100, LOCK_TIME, appManager, appManager)
        await stakingManager.increaseLockDuration(0, 1, { from: appManager })
        await stake(depositToken, stakingManager, 100, LOCK_TIME, appManager, appManager)
        await stakingManager.increaseLockDuration(1, 2, { from: appManager })
        const locks = await stakingManager.getStakedLocks(appManager)
        assert.strictEqual(locks[0].duration.toString(), (LOCK_TIME + 1).toString())
        assert.strictEqual(locks[1].duration.toString(), (LOCK_TIME + 2).toString())
      })

      it('Should be able to increase a lock duration of an unlocked lock', async () => {
        await stake(depositToken, stakingManager, 100, LOCK_TIME, appManager, appManager)
        await timeTravel(LOCK_TIME)
        await stakingManager.increaseLockDuration(0, LOCK_TIME + 1, { from: appManager })
        const locks = await stakingManager.getStakedLocks(appManager)
        assert.strictEqual(locks[0].duration.toString(), (LOCK_TIME + 1).toString())
      })
    })

    describe('unstake(uint256 _amount)', async () => {
      beforeEach(async () => {
        await setPermission(acl, stakingManager.address, wrappedTokenManager.address, MINT_ROLE, appManager)
        await setPermission(acl, stakingManager.address, wrappedTokenManager.address, BURN_ROLE, appManager)
        await setPermission(acl, stakingManager.address, vault.address, TRANSFER_ROLE, appManager)
      })

      it('Should be able to both staking and unstaking', async () => {
        const amountToUnstake = 100

        const initBalances = await getBalances(depositToken, vault, appManager)
        await stake(depositToken, stakingManager, amountToUnstake, LOCK_TIME, appManager, appManager)
        await timeTravel(ONE_DAY * 6 + ONE_DAY)
        await unstake(stakingManager, amountToUnstake, appManager)

        const actualBalances = await getBalances(depositToken, vault, appManager)
        assert.strictEqual(actualBalances.balanceVault, initBalances.balanceVault)
        assert.strictEqual(actualBalances.balanceReceiver, actualBalances.balanceReceiver)
      })

      it('Should not be able to unstake more than you have', async () => {
        const amountToStake = 100
        await stake(depositToken, stakingManager, amountToStake, LOCK_TIME, appManager, appManager)
        await timeTravel(LOCK_TIME)
        await assertRevert(
          unstake(stakingManager, amountToStake * 2, appManager),
          'STAKING_MANAGER_NOT_ENOUGH_UNWRAPPABLE_TOKENS'
        )
      })

      it('Should not be able to unstake because it needs to wait the correct time', async () => {
        const amountToStake = 100
        await stake(depositToken, stakingManager, amountToStake, LOCK_TIME, appManager, appManager)
        await assertRevert(
          unstake(stakingManager, amountToStake, appManager),
          'STAKING_MANAGER_NOT_ENOUGH_UNWRAPPABLE_TOKENS'
        )
      })

      it('Should be able to unstake (partial ok 1)', async () => {
        const amountToStake = 100
        const amountToUnstake = 200

        const initBalances = await getBalances(depositToken, vault, appManager)
        await stake(depositToken, stakingManager, amountToStake, LOCK_TIME, appManager, appManager)
        await timeTravel(ONE_DAY * 6 + ONE_DAY)
        await stake(depositToken, stakingManager, amountToStake, LOCK_TIME, appManager, appManager)
        await timeTravel(ONE_DAY * 6 + ONE_DAY)
        await unstake(stakingManager, amountToUnstake, appManager)

        const actualBalances = await getBalances(depositToken, vault, appManager)
        assert.strictEqual(actualBalances.balanceReceiver, initBalances.balanceReceiver)
        assert.strictEqual(actualBalances.balanceVault, initBalances.balanceVault)
      })

      it('Should not be able to unstake because it needs to wait the correct time (partial fail 1)', async () => {
        const amountToStake = 100
        const amountToUnstake = 200

        await stake(depositToken, stakingManager, amountToStake, LOCK_TIME, appManager, appManager)
        await timeTravel(ONE_DAY * 6 + ONE_DAY)
        await stake(depositToken, stakingManager, amountToStake, LOCK_TIME, appManager, appManager)

        // NOTE: trying to unstake 200 but only 100 are unlockable so the tx must be reverted
        await assertRevert(
          unstake(stakingManager, amountToUnstake, appManager),
          'STAKING_MANAGER_NOT_ENOUGH_UNWRAPPABLE_TOKENS'
        )
      })

      it('Should be able to unstake (partial ok 2)', async () => {
        const initBalances = await getBalances(depositToken, vault, appManager)
        await stake(depositToken, stakingManager, 20, LOCK_TIME, appManager, appManager)
        await timeTravel(ONE_DAY * 6 + ONE_DAY)
        await stake(depositToken, stakingManager, 20, LOCK_TIME, appManager, appManager)
        // NOTE: unstake 15 of first 20 wrapped tokens
        await unstake(stakingManager, 15, appManager)
        await timeTravel(ONE_DAY * 6 + ONE_DAY)
        await unstake(stakingManager, 1, appManager)
        await unstake(stakingManager, 1, appManager)
        await unstake(stakingManager, 20, appManager)
        await unstake(stakingManager, 1, appManager)
        await unstake(stakingManager, 1, appManager)
        await unstake(stakingManager, 1, appManager)

        const actualBalances = await getBalances(depositToken, vault, appManager)
        assert.strictEqual(actualBalances.balanceReceiver, initBalances.balanceReceiver)
        assert.strictEqual(actualBalances.balanceVault, initBalances.balanceVault)
      })

      it('Should not be able to unstake more than what you have wrapped (partial fail 2)', async () => {
        await stake(depositToken, stakingManager, 20, LOCK_TIME, appManager, appManager)
        await timeTravel(ONE_DAY * 6 + ONE_DAY)
        await stake(depositToken, stakingManager, 20, LOCK_TIME, appManager, appManager)
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
        await stake(depositToken, stakingManager, 20, LOCK_TIME, appManager, appManager)
        await timeTravel(LOCK_TIME * 2)
        await stake(depositToken, stakingManager, 20, LOCK_TIME * 3, appManager, appManager)
        await unstake(stakingManager, 15, appManager)
        await timeTravel(LOCK_TIME * 5)
        await unstake(stakingManager, 1, appManager)
        await unstake(stakingManager, 1, appManager)
        await unstake(stakingManager, 20, appManager)
        await unstake(stakingManager, 1, appManager)
        await unstake(stakingManager, 1, appManager)
        await unstake(stakingManager, 1, appManager)

        const actualBalances = await getBalances(depositToken, vault, appManager)
        assert.strictEqual(actualBalances.balanceReceiver, initBalances.balanceReceiver)
        assert.strictEqual(actualBalances.balanceVault, initBalances.balanceVault)
      })

      it('Should be able to stake for a non sender address and unstake', async () => {
        const amountToUnstake = 100
        const initBalances = await getBalances(depositToken, vault, ACCOUNTS_1)
        await stake(depositToken, stakingManager, amountToUnstake, LOCK_TIME, ACCOUNTS_1, appManager)
        await timeTravel(LOCK_TIME * 2)
        await unstake(stakingManager, amountToUnstake, ACCOUNTS_1)
        const actualBalances = await getBalances(depositToken, vault, ACCOUNTS_1)
        assert.strictEqual(actualBalances.balanceReceiver, initBalances.balanceReceiver + amountToUnstake)
        assert.strictEqual(actualBalances.balanceVault, initBalances.balanceVault)
      })

      it('Should not be able to stake for a non sender address and unstake to msg.sender', async () => {
        await stake(depositToken, stakingManager, 100, LOCK_TIME, ACCOUNTS_1, appManager)
        await assertRevert(unstake(stakingManager, 100, appManager), 'STAKING_MANAGER_NOT_ENOUGH_UNWRAPPABLE_TOKENS')
      })

      it('Should be able to insert in an empty slot', async () => {
        const expectedLock = undefined
        for (let i = 0; i < MAX_LOCKS; i++) {
          await stake(depositToken, stakingManager, 10, LOCK_TIME, appManager, appManager)
        }

        await timeTravel(LOCK_TIME)
        await unstake(stakingManager, 12, appManager)
        await stake(depositToken, stakingManager, 10, LOCK_TIME, appManager, appManager)
        await unstake(stakingManager, 12, appManager)
        await unstake(stakingManager, 12, appManager)
        await stake(depositToken, stakingManager, 10, LOCK_TIME, appManager, appManager)
        await stake(depositToken, stakingManager, 10, LOCK_TIME, appManager, appManager)

        const locks = await stakingManager.getStakedLocks(appManager)
        const lock = locks.find(
          ({ lockDate, lockTime, amount }) => lockDate === '0' && lockTime === '0' && amount === '0'
        )

        assert.strictEqual(lock, expectedLock)
      })

      it('Should be able to stake MAX_LOCKS times, unstake MAX_LOCKS * 2 times(unstake with amount / 2) and wrapping other MAX_LOCKS times', async () => {
        const expectedBalance = 200
        const expectedLock = undefined

        const initBalances = await getBalances(depositToken, vault, appManager)
        for (let i = 0; i < MAX_LOCKS; i++) {
          await stake(depositToken, stakingManager, expectedBalance / MAX_LOCKS, LOCK_TIME, appManager, appManager)
        }

        await timeTravel(LOCK_TIME * 2)

        for (let i = 0; i < MAX_LOCKS * 2; i++) {
          await unstake(stakingManager, expectedBalance / MAX_LOCKS / 2, appManager)
        }

        let locks = await stakingManager.getStakedLocks(appManager)
        let filtered = locks.filter(
          ({ lockDate, duration, amount }) => lockDate === '0' && duration === '0' && amount === '0'
        )

        assert.strictEqual(locks.length, filtered.length)

        for (let i = 0; i < MAX_LOCKS; i++) {
          await stake(depositToken, stakingManager, expectedBalance / MAX_LOCKS, LOCK_TIME, appManager, appManager)
        }

        locks = await stakingManager.getStakedLocks(appManager)
        const lock = locks.find(
          ({ lockDate, lockTime, amount }) => lockDate === '0' && lockTime === '0' && amount === '0'
        )

        const actualBalances = await getBalances(depositToken, vault, appManager)
        assert.strictEqual(lock, expectedLock)
        assert.strictEqual(actualBalances.balanceReceiver, initBalances.balanceReceiver - expectedBalance)
      })

      it('Should be able to stake MAX_LOCKS times and unstake in two times', async () => {
        const expectedBalance = 200
        const initBalances = await getBalances(depositToken, vault, appManager)
        for (let i = 0; i < MAX_LOCKS; i++) {
          await stake(depositToken, stakingManager, expectedBalance / MAX_LOCKS, LOCK_TIME, appManager, appManager)
        }

        await timeTravel(LOCK_TIME * 2)
        await unstake(stakingManager, expectedBalance - 3, appManager)
        await unstake(stakingManager, 3, appManager)

        const actualBalances = await getBalances(depositToken, vault, appManager)
        assert.strictEqual(actualBalances.balanceReceiver, initBalances.balanceReceiver)
        assert.strictEqual(actualBalances.balanceVault, initBalances.balanceVault)
      })

      it('Should not be able to stake zero tokens', async () => {
        await assertRevert(
          stake(depositToken, stakingManager, 0, LOCK_TIME, appManager, appManager),
          'STAKING_MANAGER_AMOUNT_TOO_LOW'
        )
      })

      it('Should return a correct value when getting number of staked locks after havin staked and unstake', async () => {
        for (let i = 0; i < MAX_LOCKS; i++) {
          await stake(depositToken, stakingManager, 200, LOCK_TIME, appManager, appManager)
        }
        await timeTravel(LOCK_TIME)
        for (let i = 0; i < MAX_LOCKS; i++) {
          await unstake(stakingManager, 200, appManager)
        }
        const numberOfLocks = await stakingManager.getNumberOfStakedLocks(appManager)
        // NOTE: will contain only empty locks
        assert.strictEqual(parseInt(numberOfLocks), MAX_LOCKS)
      })

      it('Should be able to unstake correctly after an increasing af a lock duration (1)', async () => {
        const initBalances = await getBalances(depositToken, vault, appManager)
        await stake(depositToken, stakingManager, 100, LOCK_TIME, appManager, appManager)
        await stakingManager.increaseLockDuration(0, ONE_DAY * 2, { from: appManager })
        await timeTravel(LOCK_TIME + ONE_DAY * 2)
        await unstake(stakingManager, 100, appManager)
        const actualBalances = await getBalances(depositToken, vault, appManager)
        assert.strictEqual(actualBalances.balanceReceiver, initBalances.balanceReceiver)
      })

      it('Should be able to unstake correctly after an increasing af a lock duration (2)', async () => {
        const initBalances = await getBalances(depositToken, vault, appManager)
        await stake(depositToken, stakingManager, 100, LOCK_TIME, appManager, appManager)
        await timeTravel(LOCK_TIME + 10)
        await stakingManager.increaseLockDuration(0, ONE_DAY * 7, { from: appManager })
        await timeTravel(ONE_DAY * 7)
        await unstake(stakingManager, 100, appManager)
        const actualBalances = await getBalances(depositToken, vault, appManager)
        assert.strictEqual(actualBalances.balanceReceiver, initBalances.balanceReceiver)
      })

      it('Should not be able to unstake the previous stake duration if it is changed (1)', async () => {
        const initBalances = await getBalances(depositToken, vault, appManager)
        await stake(depositToken, stakingManager, 100, LOCK_TIME, appManager, appManager)
        await timeTravel(LOCK_TIME)
        await stakingManager.increaseLockDuration(0, ONE_DAY, { from: appManager })
        await assertRevert(unstake(stakingManager, 100, appManager), 'STAKING_MANAGER_NOT_ENOUGH_UNWRAPPABLE_TOKENS')
        await timeTravel(ONE_DAY)
        await unstake(stakingManager, 100, appManager)
        const actualBalances = await getBalances(depositToken, vault, appManager)
        assert.strictEqual(actualBalances.balanceReceiver, initBalances.balanceReceiver)
      })

      it('Should not be able to unstake the previous stake duration if it is changed (2)', async () => {
        await stake(depositToken, stakingManager, 100, ONE_DAY * 365, appManager, appManager)
        await timeTravel(ONE_DAY * 400)
        await stakingManager.increaseLockDuration(0, ONE_DAY * 7, { from: appManager })
        await timeTravel(ONE_DAY * 4)
        await assertRevert(unstake(stakingManager, 100, appManager), 'STAKING_MANAGER_NOT_ENOUGH_UNWRAPPABLE_TOKENS')
      })

      it('Should not be able to update the lock duration for all locks', async () => {
        // prettier-ignore
        for (let i = 0; i < MAX_LOCKS; i++) await stake(depositToken, stakingManager, 100, LOCK_TIME, appManager, appManager)
        await timeTravel(LOCK_TIME + ONE_DAY * MAX_LOCKS)
        for (let i = 0; i < MAX_LOCKS; i++) await unstake(stakingManager, 100, appManager)
        for (let i = 0; i < MAX_LOCKS; i++) {
          await assertRevert(
            stakingManager.increaseLockDuration(i, LOCK_TIME + 1, { from: appManager }),
            'STAKING_MANAGER_LOCK_IS_EMPTY'
          )
        }
      })

      it('Should be able to update the lock duration for all locks and unstake', async () => {
        const initBalances = await getBalances(depositToken, vault, appManager)
        // prettier-ignore
        for (let i = 0; i < MAX_LOCKS; i++) await stake(depositToken, stakingManager, 100, LOCK_TIME, appManager, appManager)
        await timeTravel(LOCK_TIME + ONE_DAY * MAX_LOCKS)
        for (let i = 0; i < MAX_LOCKS; i++) await stakingManager.increaseLockDuration(i, i, { from: appManager })
        const locks = await stakingManager.getStakedLocks(appManager)
        for (let i = 0; i < MAX_LOCKS; i++) assert.strictEqual(locks[i].duration.toString(), i.toString())
        await timeTravel(MAX_LOCKS)
        for (let i = 0; i < MAX_LOCKS; i++) await unstake(stakingManager, 100, appManager)
        const actualBalances = await getBalances(depositToken, vault, appManager)
        assert.strictEqual(actualBalances.balanceReceiver, initBalances.balanceReceiver)
      })
    })
  })
})
