const reducer = (_state) => {
  if (_state === null) {
    return {
      depositTokenBalance: null,
      depositToken: null,
      miniMeTokenBalance: 0,
      miniMeToken: null,
      isSyncing: true,
    }
  }
  return _state
}

export default reducer