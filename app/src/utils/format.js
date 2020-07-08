const correctFormat = (_amount, _decimals, _operation) =>
  _operation === '/'
    ? _amount / Math.pow(10, _decimals)
    : parseInt(_amount * Math.pow(10, _decimals))

const parseAmount = (_decimals, _amount) =>
  Math.trunc(_amount * Math.pow(10, _decimals)) /
  Math.pow(10, _decimals).toFixed(_decimals)

const parseSeconds = (_seconds) => {
  const days = Math.floor(_seconds / (60 * 60 * 24))
  if (days === 1) {
    return '1 day'
  } else if (days > 1) {
    return `${days} days`
  } else if (_seconds >= 60 * 60) {
    return `${_seconds / (60 * 60)} hours`
  } else {
    return `${_seconds / 60} minutes`
  }
}

const strip = (_number) => _number.toFixed(3)

export { correctFormat, parseAmount, parseSeconds, strip }
