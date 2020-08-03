import BigNumber from 'bignumber.js'

const getTotalAmountOfUnlockedTokens = (_locks) => {
  if (!_locks || _locks.length === 0) return new BigNumber(0)

  let unlocked = new BigNumber(0)
  _locks.forEach((_lock) => {
    if (isUnlocked(_lock)) {
      unlocked = unlocked.plus(_lock.amount)
    }
  })

  return unlocked
}

const getTotalAmountOfLockedTokens = (_locks) => {
  if (!_locks || _locks.length === 0) return new BigNumber(0)

  let locked = new BigNumber(0)
  _locks.forEach((_lock) => {
    if (!isUnlocked(_lock)) {
      locked = locked.plus(_lock.amount)
    }
  })

  return locked
}

const isUnlocked = (_lock) => {
  const now = new Date().getTime() / 1000
  return _lock.lockDate + _lock.duration < now
}

export { getTotalAmountOfUnlockedTokens, getTotalAmountOfLockedTokens }
