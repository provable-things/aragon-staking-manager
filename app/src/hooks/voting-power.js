import { useMemo } from 'react'
import { useAppState } from '@aragon/api-react'
import { strip } from '../utils/amount-utils'
import { parsePercentage } from '../utils/amount-utils'

const useVotingPowerDetails = () => {
  const { vaultBalance, miniMeTokenBalance, account } = useAppState()

  return useMemo(() => {
    const votingPower =
      vaultBalance && !vaultBalance.isEqualTo(0)
        ? parseFloat(miniMeTokenBalance.dividedBy(vaultBalance))
        : 0

    return [
      {
        votingPower,
        votingPowerText: parsePercentage(votingPower),
        miniMeTokenBalance:
          miniMeTokenBalance && account
            ? strip(miniMeTokenBalance.toString())
            : '-',
        vaultBalance: vaultBalance ? strip(vaultBalance.toString()) : '-',
      },
    ]
  }, [miniMeTokenBalance, vaultBalance])
}

export { useVotingPowerDetails }
