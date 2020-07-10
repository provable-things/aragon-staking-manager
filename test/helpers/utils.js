const stake = async (
  _depositToken,
  _lockableTokenWrapper,
  _amountToWrap,
  _lockTime,
  _receiver,
  _appManager
) => {
  await _depositToken.approve(_lockableTokenWrapper.address, _amountToWrap, {
    from: _appManager,
  })

  return _lockableTokenWrapper.stake(_amountToWrap, _lockTime, _receiver, {
    from: _appManager,
  })
}

const unstake = (_lockableTokenWrapper, _amountToWrap, _appManager) =>
  _lockableTokenWrapper.unstake(_amountToWrap, {
    from: _appManager,
  })

const getBalances = async (_depositToken, _vault, _receiver) => {
  const balanceReceiver = parseInt(await _depositToken.balanceOf(_receiver))

  const balanceVault = parseInt(await _vault.balance(_depositToken.address))

  return {
    balanceReceiver,
    balanceVault,
  }
}

module.exports = {
  stake,
  unstake,
  getBalances,
}
