import { useMemo } from 'react'
import { useAppState } from '@aragon/api-react'
import {
  getTotalAmountOfUnlockedTokens,
  getTotalAmountOfLockedTokens,
} from '../utils/locks-utils'
import { toBN } from 'web3-utils'
import { strip } from '../utils/amount-utils'

const useInfoDetails = () => {
  const { stakedLocks, account } = useAppState()

  return useMemo(() => {
    const lockedbn = getTotalAmountOfLockedTokens(stakedLocks)
    const unlockedbn = getTotalAmountOfUnlockedTokens(stakedLocks)
    const sumbn = unlockedbn.add(lockedbn)

    return {
      locked: lockedbn && account ? strip(lockedbn.toString()) : '-',
      unlocked: unlockedbn && account ? strip(unlockedbn.toString()) : '-',
      sum: sumbn && account ? strip(sumbn.toString()) : '-',
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
