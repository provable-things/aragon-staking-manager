import BigNumber from 'bignumber.js'

const onChainFormat = (_amount, _decimals) =>
  _amount.multipliedBy(new BigNumber(Math.pow(10, _decimals)))

const offChainFormat = (_amount, _decimals) =>
  _amount.dividedBy(new BigNumber(Math.pow(10, _decimals)))

const parseAmount = (_decimals, _amount) => {
  const num = new BigNumber(Math.trunc(_amount * Math.pow(10, _decimals)))
  const den = new BigNumber(Math.pow(10, _decimals).toFixed(_decimals))

  return num.dividedBy(den)
}

const strip = (_number) =>
  parseFloat(_number)
    .toFixed(3)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')

export { onChainFormat, offChainFormat, parseAmount, strip }
