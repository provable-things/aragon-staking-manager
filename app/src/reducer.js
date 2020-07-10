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
