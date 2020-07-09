# :crystal_ball: lockable-token-wrapper

An Aragon app for getting miniMeToken(s) in exchange for given ERC20 token(s).

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
      ✓ Should set able to set maxLocks and minLockTime and vault (146ms)
      ✓ Should not be able to set maxLocks because of no permission (40ms)
      ✓ Should not be able to set minLockTime because of no permission (40ms)
      ✓ Should not be able to set a new Vault because of no permission (39ms)
      wrap(uint256 _amount, uint256 _lockTime, address _receiver)
        ✓ Should create wrapped tokens in exchange for DepositToken (88ms)
        ✓ Should not be able to wrap without token approve
        ✓ Should not be able to perform more wrap than allowed (maxLocks) (1053ms)
        ✓ Should not be able to wrap more than you have approved
        ✓ Should not be able to wrap with a lock time less than the minimun one
      unwrap(uint256 _amount)
        ✓ Should burn WrappedToken(s) in exchange for DepositToken (136ms)
        ✓ Should not be able to unwrap more than you have (74ms)
        ✓ Should not be able to unwrap because it needs to wait the correct time (78ms)
        ✓ Should be able to unwrap (partial ok 1) (185ms)
        ✓ Should not be able to unwrap because it needs to wait the correct time (partial fail 1) (130ms)
        ✓ Should be able to unwrap (partial ok 2) (536ms)
        ✓ Should not be able to unwrap more than what you have wrapped (partial fail 2) (238ms)
        ✓ Should be able to unwrap with different lock times (557ms)
        ✓ Should be able to wrap for a non sender address and unwrap (146ms)
        ✓ Should not be able to wrap for a non sender address and unwrap to msg.sender (77ms)
        ✓ Should be able to insert in an empty slot (1371ms)
        ✓ Should be able to wrap MAX_LOCKS times, unwrap MAX_LOCKS * 2 times(unwrap with amount / 2) and wrapping other MAX_LOCKS times (4986ms)


  25 passing (24s)
```