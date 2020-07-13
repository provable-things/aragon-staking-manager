# :crystal_ball: staking-manager

An Aragon app that allows to lock for a customizable amount of time, a quantity of ERC20 tokens in exchange for organization's tokens.

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
      ✓ Should revert when passed non-contract address as token manager (48ms)
      ✓ Should revert when passed non-contract address as vault
      ✓ Should revert when passed non-contract address as deposit token
    initialize(address _tokenManager, address _vault, address address _depositToken, _uint256 _minLockTime, _uint256 maxLocks)
      ✓ Should set correct variables
      ✓ Should set able to set maxLocks and minLockTime and vault (162ms)
      ✓ Should not be able to set maxLocks because of no permission (41ms)
      ✓ Should not be able to set minLockTime because of no permission (42ms)
      ✓ Should not be able to set a new Vault because of no permission (45ms)
      stake(uint256 _amount, uint256 _lockTime, address _receiver)
        ✓ Should create wrapped tokens in exchange for DepositToken (102ms)
        ✓ Should not be able to stake without token approve
        ✓ Should not be able to perform more stake than allowed (maxLocks) (1080ms)
        ✓ Should not be able to stake more than you have approved
        ✓ Should not be able to stake with a lock time less than the minimun one
      unstake(uint256 _amount)
        ✓ Should burn WrappedToken(s) in exchange for DepositToken (142ms)
        ✓ Should not be able to unstake more than you have (80ms)
        ✓ Should not be able to unstake because it needs to wait the correct time (84ms)
        ✓ Should be able to unstake (partial ok 1) (203ms)
        ✓ Should not be able to unstake because it needs to wait the correct time (partial fail 1) (137ms)
        ✓ Should be able to unstake (partial ok 2) (624ms)
        ✓ Should not be able to unstake more than what you have wrapped (partial fail 2) (266ms)
        ✓ Should be able to unstake with different lock times (585ms)
        ✓ Should be able to stake for a non sender address and unstake (149ms)
        ✓ Should not be able to stake for a non sender address and unstake to msg.sender (81ms)
        ✓ Should be able to insert in an empty slot (1350ms)
        ✓ Should be able to stake MAX_LOCKS times, unstake MAX_LOCKS * 2 times(unstake with amount / 2) and wrapping other MAX_LOCKS times (5382ms)
        ✓ Should be able to stake MAX_LOCKS times and unstake in two times (1381ms)
        ✓ Should be able to unwrap after changing CHANGE_MAX_LOCKS_ROLE until MAX_LOCKS + 1 (1146ms)


  27 passing (28s)
```

&nbsp;

***

&nbsp;

## :rocket: How to publish

Create an __`.env`__ file with the following format

```
PRIVATE_KEY=
INFURA_KEY=
```

Run the local IPFS node:

```
aragon ipfs start
```

and then publish.

```
npx buidler publish "version or patch/minor/major" --network "rinkeby or mainnet"
```