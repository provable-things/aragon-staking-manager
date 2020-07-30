import { useMemo } from 'react'
import { useAppState } from '@aragon/api-react'
import { toBN } from 'web3-utils'
import { strip } from '../utils/amount-utils'

const useVotingPowerDetails = () => {
  const { vaultBalance, miniMeTokenBalance, account } = useAppState()

  return useMemo(() => {
    const votingPower =
      vaultBalance && vaultBalance.cmp(toBN(0)) !== 0
        ? parseInt(miniMeTokenBalance.div(vaultBalance))
        : 0

    return [
      {
        votingPower,
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
