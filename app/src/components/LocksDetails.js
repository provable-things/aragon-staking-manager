import React from 'react'
import PropTypes from 'prop-types'
import { strip } from '../utils/number-utils'
import {
  getTotalAmountOUnlockedTokens,
  getTotalAmountOfLockedTokens,
} from '../utils/locks-utils'
import { Box, Distribution, useTheme } from '@aragon/ui'
import { correctFormat } from '../utils/number-utils'
import styled from 'styled-components'

const LocksDetails = (_props) => {
  const { depositToken, lockedWraps } = _props

  const theme = useTheme()

  const unlocked = getTotalAmountOUnlockedTokens(lockedWraps)
  const locked = getTotalAmountOfLockedTokens(lockedWraps)

  const perUnlocked = parseFloat(
    ((unlocked / (unlocked + locked)) * 100).toFixed(2)
  )
  const perLocked = parseFloat(
    ((locked / (unlocked + locked)) * 100).toFixed(2)
  )

  return (
    <Box heading={'Locks Details'}>
      <TokenUnlockableDetails>
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
      </TokenUnlockableDetails>
      <TokenUnlockableDetails>
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
      </TokenUnlockableDetails>
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

const TokenUnlockableDetails = styled.div`
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
`

const ChartWrapper = styled.div`
  margin-top: 30px;
`

LocksDetails.propTypes = {
  depositToken: PropTypes.object,
  lockedWraps: PropTypes.array,
  minLockTime: PropTypes.number,
}

export default LocksDetails
