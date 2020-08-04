import { offChainFormat } from './utils/amount-utils'
import BigNumber from 'bignumber.js'

const reducer = (_state) => {
  if (_state === null) {
    return {
      account: null,
      depositTokenBalance: new BigNumber(0),
      depositToken: null,
      miniMeTokenBalance: new BigNumber(0),
      miniMeToken: null,
      isSyncing: true,
      minLockTime: 0,
      stakedLocks: [],
      settings: null,
      vaultBalance: new BigNumber(0),
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
    miniMeTokenBalance: new BigNumber(miniMeTokenBalance),
    depositTokenBalance: new BigNumber(depositTokenBalance),
    vaultBalance: new BigNumber(vaultBalance),
    stakedLocks: stakedLocks
      ? stakedLocks
          .map((_stakedLock) => {
            return {
              lockDate: parseInt(_stakedLock.lockDate),
              duration: parseInt(_stakedLock.duration),
              amount: new BigNumber(_stakedLock.amount),
            }
          })
          .filter(
            ({ amount, lockDate, duration }) =>
              !amount.isEqualTo(0) && lockDate !== 0 && duration !== 0
          )
      : [],
  }
}

export default reducer
