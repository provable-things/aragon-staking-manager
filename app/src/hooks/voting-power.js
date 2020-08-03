import { useMemo } from 'react'
import { useAppState } from '@aragon/api-react'
import { strip } from '../utils/amount-utils'
import { parseVotingPower } from '../utils/voting-power'

const useVotingPowerDetails = () => {
  const { vaultBalance, miniMeTokenBalance, account } = useAppState()

  return useMemo(() => {
    const votingPower =
      vaultBalance && !vaultBalance.isEqualTo(0)
        ? parseFloat(miniMeTokenBalance.dividedBy(vaultBalance))
        : 0

    const votingPowerText =
      vaultBalance && !vaultBalance.isEqualTo(0)
        ? parseVotingPower(votingPower)
        : 0

    return [
      {
        votingPower,
        votingPowerText,
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
