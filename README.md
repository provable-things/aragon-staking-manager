# :crystal_ball: external-token-wrapper-app

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
    initialize(address _tokenManager, address _vault, address _depositToken) fails
      ✓ Should revert when passed non-contract address as token manager (80ms)
      ✓ Should revert when passed non-contract address as vault
      ✓ Should revert when passed non-contract address as deposit token
    initialize(address _tokenManager, address _vault, address address _depositToken)
      ✓ Should set correct variables
      wrap(uint256 _amount)
        ✓ Should create wrapped tokens in exchange for DepositToken (78ms)
        ✓ Should not be able to wrap without token approve
        ✓ Should not be able to wrap more than you have approved
      unwrap(uint256 _amount)
        ✓ Should burn WrappedToken(s) in exchange for DepositToken (144ms)
        ✓ Should not be able to unwrap more than you have (75ms)


  9 passing (7s)
```