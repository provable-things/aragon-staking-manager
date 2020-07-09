const getTotalAmountOUnlockedTokens = (_locks) => {
  if (!_locks || _locks.length === 0) return 0

  let unlocked = 0
  _locks.forEach((_lock) => {
    if (isUnlocked(_lock)) {
      unlocked += _lock.amount
    }
  })

  return unlocked
}

const getTotalAmountOfLockedTokens = (_locks) => {
  if (!_locks || _locks.length === 0) return 0

  let locked = 0
  _locks.forEach((_lock) => {
    if (!isUnlocked(_lock)) {
      locked += _lock.amount
    }
  })

  return locked
}

const isUnlocked = (_lock) => {
  const now = new Date().getTime() / 1000
  return _lock.lockDate + _lock.lockTime < now
}

export { getTotalAmountOUnlockedTokens, getTotalAmountOfLockedTokens }
