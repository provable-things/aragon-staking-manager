import { toBN } from 'web3-utils'

const getTotalAmountOfUnlockedTokens = (_locks) => {
  if (!_locks || _locks.length === 0) return toBN(0)

  let unlocked = toBN(0)
  _locks.forEach((_lock) => {
    if (isUnlocked(_lock)) {
      unlocked = unlocked.add(_lock.amount)
    }
  })

  return unlocked
}

const getTotalAmountOfLockedTokens = (_locks) => {
  if (!_locks || _locks.length === 0) return toBN(0)

  let locked = toBN(0)
  _locks.forEach((_lock) => {
    if (!isUnlocked(_lock)) {
      locked = locked.add(_lock.amount)
    }
  })

  return locked
}

const isUnlocked = (_lock) => {
  const now = new Date().getTime() / 1000
  return _lock.lockDate + _lock.lockTime < now
}

export { getTotalAmountOfUnlockedTokens, getTotalAmountOfLockedTokens }
