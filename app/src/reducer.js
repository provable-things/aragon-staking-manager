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
    miniMeToken,
    miniMeTokenBalance,
    depositToken,
    depositTokenBalance,
    vaultBalance,
  } = _state

  return {
    ..._state,
    miniMeTokenBalance: miniMeTokenBalance
      ? offChainFormat(new BigNumber(miniMeTokenBalance), miniMeToken.decimals)
      : new BigNumber(0),
    depositTokenBalance: depositTokenBalance
      ? offChainFormat(
          new BigNumber(depositTokenBalance),
          depositToken.decimals
        )
      : new BigNumber(0),
    vaultBalance: vaultBalance
      ? offChainFormat(new BigNumber(vaultBalance), depositToken.decimals)
      : new BigNumber(0),
    stakedLocks: stakedLocks
      ? stakedLocks
          .map((_stakedLock) => {
            return {
              lockDate: parseInt(_stakedLock.lockDate),
              duration: parseInt(_stakedLock.duration),
              amount: offChainFormat(
                new BigNumber(_stakedLock.amount),
                depositToken.decimals
              ),
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
