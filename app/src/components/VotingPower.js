import React from 'react'
import PropTypes from 'prop-types'
import { strip } from '../utils/number-utils'
import { Box, ProgressBar, GU } from '@aragon/ui'
import { correctFormat } from '../utils/number-utils'
import styled from 'styled-components'

const VotingPower = (_props) => {
  const { miniMeToken, vaultBalance, miniMeTokenBalance } = _props
  const votingPower = vaultBalance ? miniMeTokenBalance / vaultBalance : 0

  //console.log(miniMeTokenBalance, vaultBalance)

  return (
    <Box heading={`DAO STATS`}>
      <VotingPowerDetails>
        <VotingPowerText>Your voting power: </VotingPowerText>
        <VotingPowerValue>
          {votingPower ? `${votingPower * 100}%` : '-'}{' '}
        </VotingPowerValue>
      </VotingPowerDetails>
      <ProgressBar value={votingPower ? votingPower : 0} />
    </Box>
  )
}

const VotingPowerText = styled.span`
  float: left;
`

const VotingPowerValue = styled.span`
  float: right;
  font-weight: bold;
`

const VotingPowerDetails = styled.div`
  margin-top: ${GU}px;
  margin-bottom: ${2 * GU}px;
  display: flex;
  justify-content: space-between;
`

VotingPower.propTypes = {
  miniMeToken: PropTypes.object,
  miniMeTokenBalance: PropTypes.number,
  vaultBalance: PropTypes.number,
}

export default VotingPower
