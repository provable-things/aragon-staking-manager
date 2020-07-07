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
    initialize(address _tokenManager, address _vault, address _depositToken, _uint256 lockTime _uint256 maxLocks) fails
      ✓ Should revert when passed non-contract address as token manager (45ms)
      ✓ Should revert when passed non-contract address as vault
      ✓ Should revert when passed non-contract address as deposit token
    initialize(address _tokenManager, address _vault, address address _depositToken, _uint256 lockTime, _uint256 maxLocks)
      ✓ Should set correct variables
      ✓ Should set able to set maxLocks and lockTime (102ms)
      ✓ Should not ne able to set maxLocks because of no permission (38ms)
      ✓ Should not ne able to set lockTime because of no permission (40ms)
      wrap(uint256 _amount)
        ✓ Should create wrapped tokens in exchange for DepositToken (80ms)
        ✓ Should not be able to wrap without token approve
        ✓ Should not be able to perform more wrap than allowed (maxLocks) (1046ms)
        ✓ Should not be able to wrap more than you have approved
      unwrap(uint256 _amount)
        ✓ Should burn WrappedToken(s) in exchange for DepositToken (147ms)
        ✓ Should not be able to unwrap more than you have (74ms)
        ✓ Should not be able to unwrap because it needs to wait the correct time (77ms)
        ✓ Should be able to unwrap (partial ok 1) (186ms)
        ✓ Should not be able to unwrap because it needs to wait the correct time (partial fail 1) (129ms)
        ✓ Should be able to unwrap (partial ok 2) (534ms)
        ✓ Should not be able to unwrap more than what you have wrapped (partial fail 2) (257ms)


  18 passing (13s)
```