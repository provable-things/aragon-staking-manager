import React from 'react'
import PropTypes from 'prop-types'
import { strip } from '../utils/amount-utils'
import { Box, ProgressBar, useTheme, GU } from '@aragon/ui'
import styled from 'styled-components'

const VotingPower = (_props) => {
  const { miniMeToken, vaultBalance, miniMeTokenBalance, depositToken } = _props
  const votingPower = vaultBalance ? miniMeTokenBalance / vaultBalance : 0

  const theme = useTheme()

  return (
    <Box
      heading={`DAO STATS`}
      css={`
        height: 100%;
      `}
    >
      <Info>
        <DetailText>
          <TokenSymbol
            css={`
              color: ${theme.info};
            `}
          >
            {` ${depositToken.symbol}`}
          </TokenSymbol>{' '}
          stacked in the DAO:{' '}
        </DetailText>
        <DetailValue>{strip(vaultBalance)}</DetailValue>
      </Info>
      <Info
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
      </Info>
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

const Info = styled.div`
  margin-top: ${GU}px;
  margin-bottom: ${2 * GU}px;
  display: flex;
  justify-content: space-between;
`

VotingPower.propTypes = {
  depositToken: PropTypes.object,
  miniMeToken: PropTypes.object,
  miniMeTokenBalance: PropTypes.number,
  vaultBalance: PropTypes.number,
}

export default VotingPower
