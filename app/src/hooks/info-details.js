import { useMemo } from 'react'
import { useAppState } from '@aragon/api-react'
import {
  getTotalAmountOfUnlockedTokens,
  getTotalAmountOfLockedTokens,
} from '../utils/locks-utils'
import { toBN } from 'web3-utils'
import { strip } from '../utils/amount-utils'

const useInfoDetails = () => {
  const { stakedLocks } = useAppState()

  return useMemo(() => {
    const lockedbn = getTotalAmountOfLockedTokens(stakedLocks)
    const unlockedbn = getTotalAmountOfUnlockedTokens(stakedLocks)
    const sumbn = unlockedbn.add(lockedbn)

    return {
      locked: lockedbn ? strip(lockedbn.toString()) : '0',
      unlocked: unlockedbn ? strip(unlockedbn.toString()) : '0',
      sum: sumbn ? strip(sumbn.toString()) : '0',
      perLocked:
        sumbn.cmp(toBN(0)) !== 0
          ? parseInt(lockedbn.div(sumbn).mul(toBN(100)).toString())
          : 0,
      perUnlocked:
        sumbn.cmp(toBN(0)) !== 0
          ? parseInt(unlockedbn.div(sumbn).mul(toBN(100)).toString())
          : 0,
    }
  }, [stakedLocks])
}

export { useInfoDetails }
