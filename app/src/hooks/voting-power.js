import { useMemo } from 'react'
import { useAppState } from '@aragon/api-react'
import { strip } from '../utils/amount-utils'
import { parsePercentage, offChainFormat } from '../utils/amount-utils'

const useVotingPowerDetails = () => {
  const {
    vaultBalance,
    miniMeTokenBalance,
    account,
    miniMeToken,
    depositToken,
  } = useAppState()

  return useMemo(() => {
    const votingPower =
      vaultBalance && !vaultBalance.isEqualTo(0)
        ? parseFloat(miniMeTokenBalance.dividedBy(vaultBalance))
        : 0

    return [
      {
        votingPower,
        votingPowerText: votingPower ? parsePercentage(votingPower) : '-',
        miniMeTokenBalance:
          miniMeTokenBalance && account
            ? strip(
                offChainFormat(
                  miniMeTokenBalance,
                  miniMeToken.decimals
                ).toString()
              )
            : '-',
        vaultBalance: vaultBalance
          ? strip(
              offChainFormat(vaultBalance, depositToken.decimals).toString()
            )
          : '-',
      },
    ]
  }, [miniMeTokenBalance, vaultBalance])
}

export { useVotingPowerDetails }
