import { toBN } from 'web3-utils'

const onChainFormat = (_amount, _decimals) =>
  _amount.mul(toBN(Math.pow(10, _decimals)))

const offChainFormat = (_amount, _decimals) =>
  _amount.div(toBN(Math.pow(10, _decimals)))

const parseAmount = (_decimals, _amount) => {
  const num = toBN(Math.trunc(_amount * Math.pow(10, _decimals)))
  const den = toBN(Math.pow(10, _decimals).toFixed(_decimals))

  return num.div(den)
}

const strip = (_number) => parseFloat(_number).toFixed(3)

export { onChainFormat, offChainFormat, parseAmount, strip }
