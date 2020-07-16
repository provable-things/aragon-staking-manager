import React from 'react'
import PropTypes from 'prop-types'
import { strip } from '../utils/number-utils'
import {
  getTotalAmountOUnlockedTokens,
  getTotalAmountOfLockedTokens,
} from '../utils/locks-utils'
import { Box, Distribution, useTheme, GU } from '@aragon/ui'
import { correctFormat } from '../utils/number-utils'
import styled from 'styled-components'

const Details = (_props) => {
  const { depositToken, stakedLocks } = _props

  const theme = useTheme()

  const unlocked = getTotalAmountOUnlockedTokens(stakedLocks)
  const locked = getTotalAmountOfLockedTokens(stakedLocks)

  const perUnlocked = parseFloat(
    ((unlocked / (unlocked + locked)) * 100).toFixed(2)
  )
  const perLocked = parseFloat(
    ((locked / (unlocked + locked)) * 100).toFixed(2)
  )

  return (
    <Box heading={`Your ${depositToken.symbol} at stake`}>
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
        <TokenBalance>
          {strip(correctFormat(locked, depositToken.decimals, '/'))}
        </TokenBalance>
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
        <TokenBalance>
          {strip(correctFormat(unlocked, depositToken.decimals, '/'))}
        </TokenBalance>
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
        <TokenBalance>
          {strip(correctFormat(unlocked, depositToken.decimals, '/'))}
        </TokenBalance>
      </TokenDetails>
      <ChartWrapper>
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

Details.propTypes = {
  depositToken: PropTypes.object,
  stakedLocks: PropTypes.array,
  minLockTime: PropTypes.number,
}

export default Details
