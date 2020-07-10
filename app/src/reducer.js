const reducer = (_state) => {
  if (_state === null) {
    return {
      account: null,
      depositTokenBalance: 0,
      depositToken: null,
      miniMeTokenBalance: 0,
      miniMeToken: null,
      isSyncing: true,
      minLockTime: 0,
      stakedLocks: [],
    }
  }

  const { stakedLocks } = _state

  return {
    ..._state,
    stakedLocks: stakedLocks
      ? stakedLocks.filter(
          ({ amount, lockDate, lockTime }) =>
            amount !== 0 && lockDate !== 0 && lockTime !== 0
        )
      : [],
  }
}

export default reducer
