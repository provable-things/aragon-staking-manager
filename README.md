# :crystal_ball: staking-manager

An Aragon app that allows to lock for a customizable amount of time, a quantity of ERC20 token(s)) in exchange for given miniMeToken(s)

&nbsp;

***

&nbsp;

## :clipboard: How to run locally

```
yarn install
```

```
yarn start
```

&nbsp;

***

&nbsp;

## :guardsman: Test

```
yarn test
```

### Result

```
    initialize(address _tokenManager, address _vault, address _depositToken, _uint256 _minLockTime _uint256 maxLocks) fails
      ✓ Should revert when passed non-contract address as token manager (46ms)
      ✓ Should revert when passed non-contract address as vault
      ✓ Should revert when passed non-contract address as deposit token
    initialize(address _tokenManager, address _vault, address address _depositToken, _uint256 _minLockTime, _uint256 maxLocks)
      ✓ Should set correct variables
      ✓ Should set able to set maxLocks and minLockTime and vault (152ms)
      ✓ Should not be able to set maxLocks because of no permission (38ms)
      ✓ Should not be able to set minLockTime because of no permission (46ms)
      ✓ Should not be able to set a new Vault because of no permission (43ms)
      stake(uint256 _amount, uint256 _lockTime, address _receiver)
        ✓ Should create wrapped tokens in exchange for DepositToken (119ms)
        ✓ Should not be able to stake without token approve
        ✓ Should not be able to perform more stake than allowed (maxLocks) (1098ms)
        ✓ Should not be able to stake more than you have approved
        ✓ Should not be able to stake with a lock time less than the minimun one
      unstake(uint256 _amount)
        ✓ Should burn WrappedToken(s) in exchange for DepositToken (146ms)
        ✓ Should not be able to unstake more than you have (83ms)
        ✓ Should not be able to unstake because it needs to wait the correct time (83ms)
        ✓ Should be able to unstake (partial ok 1) (200ms)
        ✓ Should not be able to unstake because it needs to wait the correct time (partial fail 1) (144ms)
        ✓ Should be able to unstake (partial ok 2) (582ms)
        ✓ Should not be able to unstake more than what you have wrapped (partial fail 2) (303ms)
        ✓ Should be able to unstake with different lock times (576ms)
        ✓ Should be able to stake for a non sender address and unstake (144ms)
        ✓ Should not be able to stake for a non sender address and unstake to msg.sender (79ms)
        ✓ Should be able to insert in an empty slot (1374ms)
        ✓ Should be able to stake MAX_LOCKS times, unstake MAX_LOCKS * 2 times(unstake with amount / 2) and wrapping other MAX_LOCKS times (5410ms)
        ✓ Should be able to stake MAX_LOCKS times and unstake in two times (1405ms)


  26 passing (27s)
```