import { toBN } from 'web3-utils'

const reducer = (_state) => {
  if (_state === null) {
    return {
      account: null,
      depositTokenBalance: toBN(0),
      depositToken: null,
      miniMeTokenBalance: toBN(0),
      miniMeToken: null,
      isSyncing: true,
      minLockTime: 0,
      stakedLocks: [],
      settings: null,
      vaultBalance: toBN(0),
      vaultAddress: null,
    }
  }

  const {
    stakedLocks,
    miniMeTokenBalance,
    depositTokenBalance,
    vaultBalance,
  } = _state

  return {
    ..._state,
    miniMeTokenBalance: miniMeTokenBalance ? toBN(miniMeTokenBalance) : toBN(0),
    depositTokenBalance: depositTokenBalance
      ? toBN(depositTokenBalance)
      : toBN(0),
    vaultBalance: vaultBalance ? toBN(vaultBalance) : toBN(0),
    stakedLocks: stakedLocks
      ? stakedLocks
          .map((_stakedLock) => {
            return {
              lockDate: parseInt(_stakedLock.lockDate),
              lockTime: parseInt(_stakedLock.lockTime),
              amount: toBN(_stakedLock.amount),
            }
          })
          .filter(
            ({ amount, lockDate, lockTime }) =>
              amount.cmp(toBN(0)) !== 0 && lockDate !== 0 && lockTime !== 0
          )
      : [],
  }
}

export default reducer
