const correctFormat = (_amount, _decimals, _operation) =>
  _operation === '/'
    ? _amount / Math.pow(10, _decimals)
    : parseInt(_amount * Math.pow(10, _decimals))

const parseAmount = (_decimals, _amount) =>
  Math.trunc(_amount * Math.pow(10, _decimals)) /
  Math.pow(10, _decimals).toFixed(_decimals)

export { correctFormat, parseAmount }
