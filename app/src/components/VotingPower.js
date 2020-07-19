import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { strip, offChainFormat } from '../utils/amount-utils'
import { Box, ProgressBar, useTheme, GU } from '@aragon/ui'
import styled from 'styled-components'
import { toBN } from 'web3-utils'

const VotingPower = (_props) => {
  const { vaultBalance, miniMeTokenBalance, depositToken, miniMeToken } = _props
  const [votingPower, setVotingPower] = useState(null)

  const [vaultBalanceFormatted, setVaultBalanceFormatted] = useState('-')
  const [miniMeTokenBalanceFormatted, setMiniMeTokenBalance] = useState('-')

  useEffect(() => {
    setVotingPower(
      vaultBalance && vaultBalance.cmp(toBN(0)) !== 0
        ? parseInt(miniMeTokenBalance.div(vaultBalance))
        : 0
    )
  }, [miniMeTokenBalance, vaultBalance])

  useEffect(() => {
    if (!miniMeTokenBalance) {
      setMiniMeTokenBalance('-')
      return
    }

    setMiniMeTokenBalance(
      strip(offChainFormat(miniMeTokenBalance, miniMeToken.decimals).toString())
    )
  }, [miniMeTokenBalance])

  useEffect(() => {
    if (!vaultBalance) {
      setVaultBalanceFormatted('-')
      return
    }

    setVaultBalanceFormatted(
      strip(offChainFormat(vaultBalance, miniMeToken.decimals).toString())
    )
  }, [vaultBalance])

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
          stacked in the DAO:{' '}
        </DetailText>
        <DetailValue>{vaultBalanceFormatted}</DetailValue>
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
          stacked in the DAO:{' '}
        </DetailText>
        <DetailValue>{miniMeTokenBalanceFormatted}</DetailValue>
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

VotingPower.propTypes = {
  miniMeToken: PropTypes.object,
  depositToken: PropTypes.object,
  miniMeTokenBalance: PropTypes.object,
  vaultBalance: PropTypes.object,
}

export default VotingPower
