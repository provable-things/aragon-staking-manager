import { useMemo } from 'react'
import { useAppState } from '@aragon/api-react'
import { strip, offChainFormat } from '../utils/amount-utils'
import { parseSeconds } from '../utils/time-utils'

const useStakeHistory = () => {
  const { stakedLocks, depositToken, miniMeToken } = useAppState()

  const now = new Date().getTime() / 1000

  return useMemo(() => {
    return {
      stakedLocks: stakedLocks.map(({ amount, lockDate, duration }) => {
        const offchainAmount = offChainFormat(amount, depositToken.decimals)
        return {
          amount: offchainAmount,
          textedAmount: `${strip(offchainAmount.toString())} ${
            depositToken.symbol
          }`,
          wrappedTokenAmount: `(${strip(offchainAmount.toString())} ${
            miniMeToken.symbol
          })`,
          lockDate,
          duration,
          isUnlocked: lockDate + duration < now,
          remainderSeconds: parseSeconds(lockDate + duration - now),
        }
      }),
    }
  }, [stakedLocks])
}

export { useStakeHistory }
