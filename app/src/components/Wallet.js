import React from 'react'
import PropTypes from 'prop-types'
import { strip } from '../utils/amount-utils'
import { parseSeconds } from '../utils/time-utils'
import { Box, useTheme, GU } from '@aragon/ui'
import styled from 'styled-components'

const Wallet = (_props) => {
  const {
    depositToken,
    depositTokenBalance,
    miniMeToken,
    miniMeTokenBalance,
    minLockTime,
  } = _props

  const theme = useTheme()

  return (
    <Box
      heading={'Your wallet holdings'}
      css={`
        height: 100%;
      `}
    >
      <TokenDetails>
        <TokenSymbol
          css={`
            color: ${theme.info};
          `}
        >
          {` ${depositToken.symbol} `}
        </TokenSymbol>
        <TokenBalance>
          {depositTokenBalance || depositTokenBalance === 0
            ? strip(depositTokenBalance)
            : '-'}
        </TokenBalance>
      </TokenDetails>
      <TokenDetails>
        <TokenSymbol
          css={`
            color: ${theme.info};
          `}
        >
          {` ${miniMeToken.symbol} `}
        </TokenSymbol>
        <TokenBalance>
          {miniMeTokenBalance || miniMeTokenBalance === 0
            ? strip(miniMeTokenBalance)
            : '-'}
        </TokenBalance>
      </TokenDetails>

      <LockDetails>
        Stake your
        <TokenSymbol
          css={`
            color: ${theme.info};
          `}
        >
          {` ${depositToken.symbol} `}
        </TokenSymbol>
        and get the corresponding amount of
        <TokenSymbol
          css={`
            color: ${theme.info};
          `}
        >
          {` ${miniMeToken.symbol}`}
        </TokenSymbol>
        {'. '}
        After staking, it will be possible to unstake them only after at least
        <Days
          css={`
            color: ${theme.info};
          `}
        >
          {` ${parseSeconds(minLockTime)}`}.
        </Days>
      </LockDetails>
    </Box>
  )
}

const TokenSymbol = styled.span`
  font-weight: bold;
`

const TokenDetails = styled.div`
  margin-top: ${GU}px;
  display: flex;
  justify-content: space-between;
`

const TokenBalance = styled.span`
  float: right;
  font-weight: bold;
`

const LockDetails = styled.div`
  margin-right: 5px;
  margin-bottom: 15px;
  margin-top: 75px;
`

const Days = styled.span`
  font-size: 18px;
  font-weight: bold;
`

Wallet.propTypes = {
  depositToken: PropTypes.object,
  depositTokenBalance: PropTypes.number,
  miniMeToken: PropTypes.object,
  miniMeTokenBalance: PropTypes.number,
  minLockTime: PropTypes.number,
}

export default Wallet
