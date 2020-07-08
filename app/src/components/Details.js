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

  return (
    <Box heading={'DETAILS'}>
      <Row>
        <Col xs={6}>{`${depositToken.symbol} Balance`}</Col>
        <Col xs={6} className="text-right">
          {depositTokenBalance}
        </Col>
      </Row>
      <Row className="mt-3">
        <Col xs={6}>{`${miniMeToken.symbol} Balance`}</Col>
        <Col xs={6} className="text-right">
          {miniMeTokenBalance}
        </Col>
      </Row>
    </Box>
  )
}

Details.propTypes = {
  depositToken: PropTypes.object,
  depositTokenBalance: PropTypes.number,
  miniMeToken: PropTypes.object,
  miniMeTokenBalance: PropTypes.number,
}

export default Details
