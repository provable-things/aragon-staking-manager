# :crystal_ball: lockable-token-wrapper-app

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
      ✓ Should revert when passed non-contract address as token manager (47ms)
      ✓ Should revert when passed non-contract address as vault
      ✓ Should revert when passed non-contract address as deposit token
    initialize(address _tokenManager, address _vault, address address _depositToken, _uint256 _minLockTime, _uint256 maxLocks)
      ✓ Should set correct variables
      ✓ Should set able to set maxLocks and minLockTime and vault (146ms)
      ✓ Should not ne able to set maxLocks because of no permission (39ms)
      ✓ Should not ne able to set minLockTime because of no permission (38ms)
      ✓ Should not ne able to set a new Vault because of no permission (39ms)
      wrap(uint256 _amount, uint256 _lockTime, address _receiver)
        ✓ Should create wrapped tokens in exchange for DepositToken (85ms)
        ✓ Should not be able to wrap without token approve
        ✓ Should not be able to perform more wrap than allowed (maxLocks) (1046ms)
        ✓ Should not be able to wrap more than you have approved
        ✓ Should not be able to wrap with a lock time less than the minimun one
      unwrap(uint256 _amount)
        ✓ Should burn WrappedToken(s) in exchange for DepositToken (136ms)
        ✓ Should not be able to unwrap more than you have (73ms)
        ✓ Should not be able to unwrap because it needs to wait the correct time (76ms)
        ✓ Should be able to unwrap (partial ok 1) (183ms)
        ✓ Should not be able to unwrap because it needs to wait the correct time (partial fail 1) (131ms)
        ✓ Should be able to unwrap (partial ok 2) (530ms)
        ✓ Should not be able to unwrap more than what you have wrapped (partial fail 2) (266ms)
        ✓ Should be able to unwrap with different lock times (562ms)
        ✓ Should be able to wrap for a non sender address and unwrap (154ms)
        ✓ Should not be able to wrap for a non sender address and unwrap to msg.sender (93ms)


  23 passing (16s)
```