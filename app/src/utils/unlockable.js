const getTotalAmountOfUnlockableTokens = (_locks, _lockTime) =>
  _locks.reduce((_value, _lock) => {
    if (_value instanceof Object) {
      return isUnlockable(_value, _lockTime) ? _value.amount : 0
    } else {
      return isUnlockable(_lock, _lockTime) ? _lock.amount : 0
    }
  })

const isUnlockable = (_lock, _lockTime) => {
  const now = new Date().getTime() / 1000
  return _lock.unlockableTime < now
}

export { getTotalAmountOfUnlockableTokens }
