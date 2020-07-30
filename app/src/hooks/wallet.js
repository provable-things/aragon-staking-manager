import { useMemo } from 'react'
import { useAppState } from '@aragon/api-react'
import { strip } from '../utils/amount-utils'
import { parseSeconds } from '../utils/time-utils'

const useWalletDetails = () => {
  const {
    miniMeTokenBalance,
    depositTokenBalance,
    minLockTime,
    account,
  } = useAppState()

  return useMemo(() => {
    return {
      miniMeTokenBalance:
        miniMeTokenBalance && account
          ? strip(miniMeTokenBalance.toString())
          : '-',
      depositTokenBalance:
        depositTokenBalance && account
          ? strip(depositTokenBalance.toString())
          : '-',
      minLockTime: minLockTime ? parseSeconds(minLockTime) : '-',
    }
  }, [depositTokenBalance, miniMeTokenBalance, minLockTime])
}

export { useWalletDetails }
