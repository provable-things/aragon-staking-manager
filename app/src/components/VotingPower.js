import React from 'react'
import { Box, ProgressBar, useTheme, GU } from '@aragon/ui'
import { useAppState } from '@aragon/api-react'
import styled from 'styled-components'
import { useVotingPowerDetails } from '../hooks/voting-power'

const VotingPower = (_props) => {
  const { depositToken } = useAppState()

  const [
    { votingPower, miniMeTokenBalance, vaultBalance },
  ] = useVotingPowerDetails()

  const theme = useTheme()

  return (
    <Box
      heading={`DAO STATS`}
      css={`
        height: 100%;
      `}
    >
      <Detail>
        <DetailText>
          Total
          <TokenSymbol
            css={`
              color: ${theme.info};
            `}
          >
            {` ${depositToken.symbol}`}
          </TokenSymbol>{' '}
          staked in the DAO:{' '}
        </DetailText>
        <DetailValue>{vaultBalance}</DetailValue>
      </Detail>
      <Detail>
        <DetailText>
          Your
          <TokenSymbol
            css={`
              color: ${theme.info};
            `}
          >
            {` ${depositToken.symbol}`}
          </TokenSymbol>{' '}
          staked in the DAO:{' '}
        </DetailText>
        <DetailValue>{miniMeTokenBalance}</DetailValue>
      </Detail>
      <Detail
        css={`
          margin-top: ${3 * GU}px;
        `}
      >
        <DetailText>Your voting power: </DetailText>
        <DetailValue>
          {votingPower
            ? `${votingPower >= 100 ? 100 : (votingPower * 100).toFixed(2)}%`
            : '0%'}{' '}
        </DetailValue>
      </Detail>
      <ProgressBar value={votingPower ? votingPower : 0} />
    </Box>
  )
}

const TokenSymbol = styled.span`
  font-weight: bold;
`

const DetailText = styled.span`
  float: left;
`

const DetailValue = styled.span`
  float: right;
  font-weight: bold;
`

const Detail = styled.div`
  margin-top: ${GU}px;
  margin-bottom: ${2 * GU}px;
  display: flex;
  justify-content: space-between;
`

export default VotingPower
