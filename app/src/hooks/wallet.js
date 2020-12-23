import { useMemo } from 'react'
import { useAppState } from '@aragon/api-react'
import { strip, offChainFormat } from '../utils/amount-utils'
import { parseSeconds } from '../utils/time-utils'

const useWalletDetails = () => {
  const {
    miniMeTokenBalance,
    depositTokenBalance,
    minLockTime,
    account,
    miniMeToken,
    depositToken,
  } = useAppState()

  return useMemo(() => {
    return {
      miniMeTokenBalance:
        miniMeTokenBalance && account
          ? strip(
              offChainFormat(
                miniMeTokenBalance,
                miniMeToken.decimals
              ).toString()
            )
          : '-',
      depositTokenBalance:
        depositTokenBalance && account
          ? strip(
              offChainFormat(
                depositTokenBalance,
                depositToken.decimals
              ).toString()
            )
          : '-',
      minLockTime: minLockTime ? parseSeconds(minLockTime) : '-',
    }
  }, [depositTokenBalance, miniMeTokenBalance, minLockTime])
}

export { useWalletDetails }
