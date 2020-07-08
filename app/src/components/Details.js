import React from 'react'
import { Row, Col } from 'react-bootstrap'
import { Box } from '@aragon/ui'
import PropTypes from 'prop-types'

const Details = (_props) => {
  const {
    depositToken,
    depositTokenBalance,
    miniMeToken,
    miniMeTokenBalance,
  } = _props

  return <Box heading={'DETAILS'}></Box>
}

Details.propTypes = {
  depositToken: PropTypes.object,
  depositTokenBalance: PropTypes.number,
  miniMeToken: PropTypes.object,
  miniMeTokenBalance: PropTypes.number,
}

export default Details
