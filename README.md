# :crystal_ball: staking-manager

An Aragon app that allows to lock for a customizable amount of time, a quantity of ERC20 tokens in exchange for organization's tokens.

&nbsp;

***

&nbsp;

## :arrow_down: How to install

```
dao install <DAO address> staking-manager.open.aragonpm.eth --app-init-args <token manager> <vault> <erc20 token address> <min lock time> <max locks> --env aragon:rinkeby
```

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
      ✓ Should revert when passed non-contract address as token manager (57ms)
      ✓ Should revert when passed non-contract address as vault (44ms)
      ✓ Should revert when passed non-contract address as deposit token
    initialize(address _tokenManager, address _vault, address address _depositToken, _uint256 _minLockTime, _uint256 maxLocks)
      ✓ Should set correct variables
      ✓ Should set able to set maxLocks and minLockTime and vault (233ms)
      ✓ Should not be able to set maxLocks because of no permission (44ms)
      ✓ Should not be able to set minLockTime because of no permission (43ms)
      ✓ Should not be able to set a new Vault because of no permission (65ms)
      stake(uint256 _amount, uint256 _lockTime, address _receiver)
        ✓ Should create wrapped tokens in exchange for DepositToken (95ms)
        ✓ Should not be able to stake without token approve
        ✓ Should not be able to perform more stake than allowed (maxLocks) (1417ms)
        ✓ Should not be able to stake more than you have approved
        ✓ Should not be able to stake with a lock time less than the minimun one
      unstake(uint256 _amount)
        ✓ Should be able to both staking and unstaking (148ms)
        ✓ Should not be able to unstake more than you have (70ms)
        ✓ Should not be able to unstake because it needs to wait the correct time (73ms)
        ✓ Should be able to unstake (partial ok 1) (208ms)
        ✓ Should not be able to unstake because it needs to wait the correct time (partial fail 1) (217ms)
        ✓ Should be able to unstake (partial ok 2) (551ms)
        ✓ Should not be able to unstake more than what you have wrapped (partial fail 2) (252ms)
        ✓ Should be able to unstake with different lock times (570ms)
        ✓ Should be able to stake for a non sender address and unstake (151ms)
        ✓ Should not be able to stake for a non sender address and unstake to msg.sender (76ms)
        ✓ Should be able to insert in an empty slot (1648ms)
        ✓ Should be able to stake MAX_LOCKS times, unstake MAX_LOCKS * 2 times(unstake with amount / 2) and wrapping other MAX_LOCKS times (5798ms)
        ✓ Should be able to stake MAX_LOCKS times and unstake in two times (1587ms)


  26 passing (29s)
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