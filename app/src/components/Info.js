import React from 'react'
import { useAppState } from '@aragon/api-react'
import { Box, Distribution, useTheme, GU } from '@aragon/ui'
import styled from 'styled-components'
import { useInfoDetails } from '../hooks/info-details'

const Info = (_props) => {
  const { depositToken } = useAppState()

  const { locked, unlocked, sum, perLocked, perUnlocked } = useInfoDetails()

  const theme = useTheme()

  return (
    <Box
      heading={`Your ${depositToken.symbol} at stake`}
      css={`
        height: 100%;
      `}
    >
      <TokenDetails>
        <TokenName>
          <TokenSymbol
            css={`
              color: ${theme.info};
            `}
          >
            {`LOCKED ${depositToken.symbol} `}
          </TokenSymbol>
        </TokenName>{' '}
        <TokenBalance>{locked}</TokenBalance>
      </TokenDetails>
      <TokenDetails>
        <TokenName>
          <TokenSymbol
            css={`
              color: ${theme.info};
            `}
          >
            {`UNLOCKED ${depositToken.symbol} `}
          </TokenSymbol>
        </TokenName>{' '}
        <TokenBalance>{unlocked}</TokenBalance>
      </TokenDetails>
      <div
        css={`
          width: 100%;
          padding: ${0.5 * GU}px ${1 * GU}px;
        `}
      />
      <TokenDetails>
        <TokenName>
          <TokenSymbol
            css={`
              color: ${theme.info};
            `}
          >
            {`TOTAL ${depositToken.symbol} `}
          </TokenSymbol>
        </TokenName>{' '}
        <TokenBalance>{sum}</TokenBalance>
      </TokenDetails>
      <ChartWrapper>
        {
          <Distribution
            heading="Distribution"
            items={[
              { item: 'Locked', percentage: perLocked ? perLocked : 0 },
              {
                item: 'Unlocked',
                percentage: perUnlocked ? perUnlocked : 0,
              },
            ]}
          />
        }
      </ChartWrapper>
    </Box>
  )
}

const TokenSymbol = styled.span`
  font-weight: bold;
`

const TokenName = styled.span`
  float: left;
`

const TokenBalance = styled.span`
  float: right;
  font-weight: bold;
`

const TokenDetails = styled.div`
  margin-top: ${GU}px;
  display: flex;
  justify-content: space-between;
`

const ChartWrapper = styled.div`
  margin-top: 30px;
`

export default Info
