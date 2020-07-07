import React from 'react'
import { Box, GU, textStyle } from '@aragon/ui'
import { Row, Col } from 'react-bootstrap'
import PropTypes from 'prop-types'

const Details = (_props) => {
  const { depositToken, miniMeToken } = _props

  return (
    <Row>
      <Col xs={12} lg={9}>
        <Box heading={'DETAILS'}>
          <Row>
            <Col xs={6}>{`${depositToken.symbol} Balance`}</Col>
            <Col xs={6} className="text-right">
              10
            </Col>
          </Row>
          <Row className="mt-3">
            <Col xs={6}>{`${miniMeToken.symbol} Balance`}</Col>
            <Col xs={6} className="text-right">
              10
            </Col>
          </Row>
        </Box>
      </Col>
      <Col xs={12} lg={3} className="mt-3 mt-lg-0">
        <Box heading={'INFO'}>
          {`Deposit your ${depositToken.symbol} and get the corresponding amount of ${miniMeToken.symbol}`}
        </Box>
      </Col>
    </Row>
  )
}

Details.propTypes = {
  depositToken: PropTypes.object,
  miniMeToken: PropTypes.object,
}

export default Details
