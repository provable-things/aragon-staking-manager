import { useMemo } from 'react'
import { useAppState } from '@aragon/api-react'
import {
  getTotalAmountOfUnlockedTokens,
  getTotalAmountOfLockedTokens,
} from '../utils/locks-utils'
import { strip } from '../utils/amount-utils'

const useInfoDetails = () => {
  const { stakedLocks, account } = useAppState()

  return useMemo(() => {
    const lockedbn = getTotalAmountOfLockedTokens(stakedLocks)
    const unlockedbn = getTotalAmountOfUnlockedTokens(stakedLocks)
    const sumbn = unlockedbn.plus(lockedbn)

    return {
      locked: lockedbn && account ? strip(lockedbn.toString()) : '-',
      unlocked: unlockedbn && account ? strip(unlockedbn.toString()) : '-',
      sum: sumbn && account ? strip(sumbn.toString()) : '-',
      perLocked: !sumbn.isEqualTo(0)
        ? parseInt(lockedbn.dividedBy(sumbn).multipliedBy(100).toString())
        : 0,
      perUnlocked: !sumbn.isEqualTo(0)
        ? parseInt(unlockedbn.dividedBy(sumbn).multipliedBy(100).toString())
        : 0,
    }
  }, [stakedLocks])
}

export { useInfoDetails }
