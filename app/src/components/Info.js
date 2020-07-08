import React from 'react'
import PropTypes from 'prop-types'
import { parseSeconds, strip } from '../utils/format'
import { Box, useTheme } from '@aragon/ui'
import styled from 'styled-components'

const Info = (_props) => {
  const {
    depositToken,
    depositTokenBalance,
    miniMeToken,
    miniMeTokenBalance,
    lockTime,
  } = _props

  const theme = useTheme()

  return (
    <Box heading={'INFO'}>
      <TokenDetails>
        <TokenName>
          <TokenSymbol
            css={`
              color: ${theme.info};
            `}
          >
            {` ${depositToken.symbol} `}
          </TokenSymbol>
        </TokenName>{' '}
        <TokenBalance>
          {depositTokenBalance || depositTokenBalance === 0
            ? strip(depositTokenBalance)
            : '-'}
        </TokenBalance>
      </TokenDetails>
      <TokenDetails>
        <TokenName>
          <TokenSymbol
            css={`
              color: ${theme.info};
            `}
          >
            {` ${miniMeToken.symbol} `}
          </TokenSymbol>
        </TokenName>{' '}
        <TokenBalance>
          {miniMeTokenBalance || miniMeTokenBalance === 0
            ? strip(miniMeTokenBalance)
            : '-'}
        </TokenBalance>
      </TokenDetails>

      <LockDetails>
        Deposit your
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
          {` ${miniMeToken.symbol}`}.
        </TokenSymbol>{' '}
        After depositing, it will be possible to withdraw them only after
        <Days
          css={`
            color: ${theme.info};
          `}
        >
          {` ${parseSeconds(lockTime)}`}.
        </Days>
      </LockDetails>
    </Box>
  )
}

const TokenSymbol = styled.span`
  font-weight: bold;
`

const TokenDetails = styled.div`
  margin-top: 5px;
  display: flex;
  justify-content: space-between;
`

const TokenName = styled.span`
  float: left;
`

const TokenBalance = styled.span`
  float: right;
  font-weight: bold;
`

const LockDetails = styled.div`
  margin-top: 20px;
`

const Days = styled.span`
  font-size: 18px;
  font-weight: bold;
`

Info.propTypes = {
  depositToken: PropTypes.object,
  depositTokenBalance: PropTypes.number,
  miniMeToken: PropTypes.object,
  miniMeTokenBalance: PropTypes.number,
  lockTime: PropTypes.number,
}

export default Info
