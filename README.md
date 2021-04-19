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
      ✓ Should revert when passed non-contract address as token manager (49ms)
      ✓ Should revert when passed non-contract address as vault
      ✓ Should revert when passed non-contract address as deposit token
    initialize(address _tokenManager, address _vault, address address _depositToken, _uint256 _minLockTime, _uint256 maxLocks)
      ✓ Should set correct variables
      ✓ Should set able to set maxLocks and minLockTime and vault (194ms)
      ✓ Should not be able to set maxLocks because of no permission (45ms)
      ✓ Should not be able to set maxLocks because of of value too high (75ms)
      ✓ Should not be able to set minLockTime because of no permission (93ms)
      ✓ Should not be able to set a new Vault because of no permission (49ms)
      stake(uint256 _amount, uint256 _lockTime, address _receiver)
        ✓ Should create wrapped tokens in exchange for DepositToken (107ms)
        ✓ Should not be able to stake without token approve (70ms)
        ✓ Should not be able to perform more stake than allowed (maxLocks) (2367ms)
        ✓ Should not be able to stake more than you have approved (52ms)
        ✓ Should not be able to stake with a lock time less than the minimun one (52ms)
        ✓ Should return a correct value when getting number of staked locks (2338ms)
        ✓ Should return a correct value when getting number of staked locks after having staked
        ✓ Should be able to increase a lock duration (133ms)
        ✓ Should not be able to increase a lock duration because lock does not exists (1) (125ms)
        ✓ Should not be able to increase a lock duration because lock does not exists (2) (122ms)
        ✓ Should be able to increase more than 1 lock duration (1) (265ms)
        ✓ Should be able to increase more than 1 lock duration (2) (238ms)
        ✓ Should be able to increase a lock duration of an unlocked lock (137ms)
      unstake(uint256 _amount)
        ✓ Should be able to both staking and unstaking (248ms)
        ✓ Should not be able to unstake more than you have (150ms)
        ✓ Should not be able to unstake because it needs to wait the correct time (138ms)
        ✓ Should be able to unstake (partial ok 1) (345ms)
        ✓ Should not be able to unstake because it needs to wait the correct time (partial fail 1) (196ms)
        ✓ Should be able to unstake (partial ok 2) (961ms)
        ✓ Should not be able to unstake more than what you have wrapped (partial fail 2) (419ms)
        ✓ Should be able to unstake with different lock times (913ms)
        ✓ Should be able to stake for a non sender address and unstake (228ms)
        ✓ Should not be able to stake for a non sender address and unstake to msg.sender (118ms)
        ✓ Should be able to insert in an empty slot (2541ms)
        ✓ Should be able to stake MAX_LOCKS times, unstake MAX_LOCKS * 2 times(unstake with amount / 2) and wrapping other MAX_LOCKS times (8980ms)
        ✓ Should be able to stake MAX_LOCKS times and unstake in two times (2210ms)
        ✓ Should not be able to stake zero tokens (51ms)
        ✓ Should return a correct value when getting number of staked locks after havin staked and unstake (4390ms)
        ✓ Should be able to unstake correctly after an increasing af a lock duration (1) (250ms)
        ✓ Should be able to unstake correctly after an increasing af a lock duration (2) (230ms)
        ✓ Should not be able to unstake the previous stake duration if it is changed (1) (282ms)
        ✓ Should not be able to unstake the previous stake duration if it is changed (2) (144ms)
        ✓ Should not be able to update the lock duration for all locks (4718ms)
        ✓ Should be able to update the lock duration for all locks and unstake (4727ms)


  43 passing (1m)
```

&nbsp;

***

&nbsp;

## :rocket: How to publish

Create an __`.env`__ file with the following format

```
RINKEBY_PRIVATE_KEY=
MAINNET_PRIVATE_KEY=
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

&nbsp;

***

&nbsp;

## :white_check_mark: How to verify

Add the following field to __`.env`__ file

```
ETHERSCAN_API_KEY=
```

and then verify.

```
npx buidler verify-contract --contract-name StakingManager --address 'deployed contract address' "constructor arguments"
```