import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { strip } from '../utils/amount-utils'
import {
  getTotalAmountOUnlockedTokens,
  getTotalAmountOfLockedTokens,
} from '../utils/locks-utils'
import { Box, Distribution, useTheme, GU } from '@aragon/ui'
import styled from 'styled-components'

const Info = (_props) => {
  const { depositToken, stakedLocks } = _props

  const theme = useTheme()

  const [locked, setLocked] = useState(0)
  const [unlocked, setUnlocked] = useState(0)
  const [perLocked, setPerLocked] = useState(0)
  const [perUnlocked, setPerUnlocked] = useState(0)

  useEffect(() => {
    setUnlocked(getTotalAmountOUnlockedTokens(stakedLocks))
    setLocked(getTotalAmountOfLockedTokens(stakedLocks))
    setPerLocked(
      parseFloat(((unlocked / (unlocked + locked)) * 100).toFixed(2))
    )

    setPerUnlocked(
      parseFloat(((locked / (unlocked + locked)) * 100).toFixed(2))
    )
  }, [stakedLocks])

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
        <TokenBalance>{strip(locked)}</TokenBalance>
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
        <TokenBalance>{strip(unlocked)}</TokenBalance>
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
        <TokenBalance>{strip(unlocked + locked)}</TokenBalance>
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

Info.propTypes = {
  depositToken: PropTypes.object,
  stakedLocks: PropTypes.array,
  minLockTime: PropTypes.number,
}

export default Info
