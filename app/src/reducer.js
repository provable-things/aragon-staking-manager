const reducer = (_state) => {
  if (_state === null) {
    return {
      account: null,
      depositTokenBalance: 0,
      depositToken: null,
      miniMeTokenBalance: 0,
      miniMeToken: null,
      isSyncing: true,
      lockTime: 0,
      lockedWraps: [],
    }
  }
  return _state
}

export default reducer
