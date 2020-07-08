const wrap = async (
  _depositToken,
  _lockableTokenWrapper,
  _amountToWrap,
  _lockTime,
  _appManager,
) => {
  await _depositToken.approve(_lockableTokenWrapper.address, _amountToWrap, {
    from: _appManager,
  })

  await _lockableTokenWrapper.wrap(_amountToWrap, _lockTime, {
    from: _appManager,
  })
}

const unwrap = async (_lockableTokenWrapper, _amountToWrap, _appManager) => {
  await _lockableTokenWrapper.unwrap(_amountToWrap, {
    from: _appManager,
  })
}

const getBalances = async (_depositToken, _vault, _appManager) => {
  const balanceAppManager = parseInt(await _depositToken.balanceOf(_appManager))

  const balanceVault = parseInt(await _vault.balance(_depositToken.address))

  return {
    balanceAppManager,
    balanceVault,
  }
}

module.exports = {
  wrap,
  unwrap,
  getBalances,
}
