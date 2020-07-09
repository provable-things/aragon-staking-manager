const correctFormat = (_amount, _decimals, _operation) =>
  _operation === '/'
    ? _amount / Math.pow(10, _decimals)
    : (_amount * Math.pow(10, _decimals)).toLocaleString('fullwide', {
        useGrouping: false,
      })

const parseAmount = (_decimals, _amount) =>
  Math.trunc(_amount * Math.pow(10, _decimals)) /
  Math.pow(10, _decimals).toFixed(_decimals)

const strip = (_number) => _number.toFixed(3)

export { correctFormat, parseAmount, strip }
