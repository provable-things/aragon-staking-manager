const correctFormat = (_amount, _decimals, _operation) =>
  _operation === '/'
    ? _amount / Math.pow(10, _decimals)
    : parseInt(_amount * Math.pow(10, _decimals))

const parseAmount = (_decimals, _amount) =>
  Math.trunc(_amount * Math.pow(10, _decimals)) /
  Math.pow(10, _decimals).toFixed(_decimals)

const parseSeconds = (_seconds) => {
  const days = Math.floor(_seconds / (60 * 60 * 24))
  if (days >= 365 && days <= 730) {
    return '1 year'
  } else if (days >= 730) {
    return `${Math.round(days / 365)} years`
  } else if (days >= 1 && days <= 30) {
    return '1 month'
  } else if (days > 60 && days < 365) {
    return `${Math.round(days / 30)} months`
  } else if (days === 1) {
    return '1 day'
  } else if (days >= 1) {
    return `${days} days`
  } else if (days > 1) {
    return `${days} days`
  } else if (_seconds >= 3600) {
    return `${Math.round(_seconds / 3600)} hours`
  } else if (_seconds >= 60) {
    return `${Math.round(_seconds / 60)} minutes`
  } else return `${Math.round(_seconds)} seconds`
}

const strip = (_number) => _number.toFixed(3)

export { correctFormat, parseAmount, parseSeconds, strip }
