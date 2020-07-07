const reducer = (_state) => {
  if (_state === null) {
    return {
      account: null,
      depositTokenBalance: null,
      depositToken: null,
      miniMeTokenBalance: 0,
      miniMeToken: null,
      isSyncing: true,
      lockTime: 0,
    }
  }
  return _state
}

export default reducer
