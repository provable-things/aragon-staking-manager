import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { strip } from '../utils/format'
import {
  getTotalAmountOfUnlockableTokens,
  getTotalAmountOfLockableTokens,
} from '../utils/unlockable'
import { Box, Distribution, useTheme } from '@aragon/ui'
import { correctFormat } from '../utils/format'
import styled from 'styled-components'

const LocksDetails = (_props) => {
  const { depositToken, lockedWraps } = _props

  const theme = useTheme()

  const unlockables = getTotalAmountOfUnlockableTokens(lockedWraps)
  const locked = getTotalAmountOfLockableTokens(lockedWraps)

  const perUnlockable = parseFloat(
    ((unlockables / (unlockables + locked)) * 100).toFixed(2)
  )
  const perLockable = parseFloat(
    ((locked / (unlockables + locked)) * 100).toFixed(2)
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
          {strip(correctFormat(unlockables, depositToken.decimals, '/'))}
        </TokenBalance>
      </TokenUnlockableDetails>
      <ChartWrapper>
        <Distribution
          heading="Distribution"
          items={[
            { item: 'Lockable', percentage: perLockable ? perLockable : 0 },
            {
              item: 'Unlockable',
              percentage: perUnlockable ? perUnlockable : 0,
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
