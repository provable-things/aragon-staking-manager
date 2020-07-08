const getTotalAmountOfUnlockableTokens = (_locks) => {
  if (!_locks || _locks.length === 0) return 0

  let unlockable = 0
  _locks.forEach((_lock) => {
    if (isUnlockable(_lock)) {
      unlockable += _lock.amount
    }
  })

  return unlockable
}

const getTotalAmountOfLockableTokens = (_locks) => {
  if (!_locks || _locks.length === 0) return 0

  let locked = 0
  _locks.forEach((_lock) => {
    if (!isUnlockable(_lock)) {
      locked += _lock.amount
    }
  })

  return locked
}

const isUnlockable = (_lock, _lockTime) => {
  const now = new Date().getTime() / 1000
  return _lock.lockDate + _lock._lockTime < now
}

export { getTotalAmountOfUnlockableTokens, getTotalAmountOfLockableTokens }
