const stake = async (_depositToken, _stakingManager, _amountToWrap, _lockTime, _receiver, _appManager) => {
  await _depositToken.approve(_stakingManager.address, _amountToWrap, {
    from: _appManager,
  })

  return _stakingManager.stake(_amountToWrap, _lockTime, _receiver, {
    from: _appManager,
  })
}

const unstake = (_stakingManager, _amountToWrap, _appManager) =>
  _stakingManager.unstake(_amountToWrap, {
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
