import { useMemo } from 'react'
import { useAppState } from '@aragon/api-react'
import {
  getTotalAmountOfUnlockedTokens,
  getTotalAmountOfLockedTokens,
} from '../utils/locks-utils'
import { strip, offChainFormat } from '../utils/amount-utils'

const useInfoDetails = () => {
  const { stakedLocks, account, depositToken } = useAppState()

  return useMemo(() => {
    const lockedbn = offChainFormat(
      getTotalAmountOfLockedTokens(stakedLocks),
      depositToken.decimals
    )
    const unlockedbn = offChainFormat(
      getTotalAmountOfUnlockedTokens(stakedLocks),
      depositToken.decimals
    )
    const sumbn = unlockedbn.plus(lockedbn)

    return {
      locked: lockedbn && account ? strip(lockedbn.toString()) : '-',
      unlocked: unlockedbn && account ? strip(unlockedbn.toString()) : '-',
      sum: sumbn && account ? strip(sumbn.toString()) : '-',
      perLocked: !sumbn.isEqualTo(0)
        ? parseFloat(
            parseFloat(lockedbn.dividedBy(sumbn).multipliedBy(100).toString())
              .toFixed(4)
              .toString()
          )
        : 0,
      perUnlocked: !sumbn.isEqualTo(0)
        ? parseFloat(
            parseFloat(unlockedbn.dividedBy(sumbn).multipliedBy(100).toString())
              .toFixed(4)
              .toString()
          )
        : 0,
    }
  }, [stakedLocks])
}

export { useInfoDetails }
