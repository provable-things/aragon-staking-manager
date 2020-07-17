import { correctFormat } from './utils/amount-utils'

const reducer = (_state) => {
  if (_state === null) {
    return {
      account: null,
      depositTokenBalance: null,
      depositToken: null,
      miniMeTokenBalance: null,
      miniMeToken: null,
      isSyncing: true,
      minLockTime: 0,
      stakedLocks: [],
      settings: null,
      vaultBalance: null,
      vaultAddress: null,
    }
  }

  const { stakedLocks } = _state

  return {
    ..._state,
    stakedLocks: stakedLocks
      ? stakedLocks
          .filter(
            ({ amount, lockDate, lockTime }) =>
              amount !== 0 && lockDate !== 0 && lockTime !== 0
          )
          .map((_stakedLock) => {
            return {
              ..._stakedLock,
              amount: correctFormat(
                _stakedLock.amount,
                _state.depositToken.decimals,
                '/'
              ),
            }
          })
      : [],
  }
}

export default reducer
