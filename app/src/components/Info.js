import React from 'react'
import PropTypes from 'prop-types'
import { parseSeconds } from '../utils/format'
import { Box, useTheme } from '@aragon/ui'

const Info = (_props) => {
  const { depositToken, miniMeToken, lockTime } = _props

  const theme = useTheme()

  return (
    <Box heading={'INFO'}>
      Deposit your
      <span
        css={`
          color: ${theme.info};
          font-weight: bold;
        `}
      >
        {` ${depositToken.symbol} `}
      </span>
      and get the corresponding amount of
      <span
        css={`
          color: ${theme.info};
          font-weight: bold;
        `}
      >
        {` ${miniMeToken.symbol}`}.
      </span>
      <br />
      After depositing, it will be possible to withdraw them only after
      <span
        css={`
          color: ${theme.info};
          font-size: 18px;
          font-weight: bold;
        `}
      >
        {` ${parseSeconds(lockTime)}`}.
      </span>
    </Box>
  )
}

Info.propTypes = {
  depositToken: PropTypes.object,
  miniMeToken: PropTypes.object,
  lockTime: PropTypes.string,
}

export default Info
