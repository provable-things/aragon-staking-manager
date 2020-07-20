import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { strip } from '../utils/amount-utils'
import {
  getTotalAmountOfUnlockedTokens,
  getTotalAmountOfLockedTokens,
} from '../utils/locks-utils'
import { Box, Distribution, useTheme, GU } from '@aragon/ui'
import styled from 'styled-components'
import { toBN } from 'web3-utils'

const Info = (_props) => {
  const { depositToken, stakedLocks } = _props

  const theme = useTheme()

  const [locked, setLocked] = useState('0')
  const [unlocked, setUnlocked] = useState('0')
  const [sum, setSum] = useState('0')
  const [perLocked, setPerLocked] = useState(0)
  const [perUnlocked, setPerUnlocked] = useState(0)

  useEffect(() => {
    const lockedbn = getTotalAmountOfLockedTokens(stakedLocks)
    const unlockedbn = getTotalAmountOfUnlockedTokens(stakedLocks)
    const sumbn = unlockedbn.add(lockedbn)

    setLocked(strip(lockedbn.toString()))
    setUnlocked(strip(unlockedbn.toString()))
    setSum(strip(sumbn.toString()))

    if (sumbn.cmp(toBN(0)) === 0) return

    setPerLocked(parseInt(lockedbn.div(sumbn).mul(toBN(100)).toString()))
    setPerUnlocked(parseInt(unlockedbn.div(sumbn).mul(toBN(100)).toString()))
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

Info.propTypes = {
  depositToken: PropTypes.object,
  stakedLocks: PropTypes.array,
  minLockTime: PropTypes.number,
}

export default Info
