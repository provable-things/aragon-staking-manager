import React from 'react'
import { Box, GU, useTheme } from '@aragon/ui'
import { Row, Col } from 'react-bootstrap'
import PropTypes from 'prop-types'

const Details = (_props) => {
  const {
    depositToken,
    depositTokenBalance,
    miniMeToken,
    miniMeTokenBalance,
    lockTime,
  } = _props

  const theme = useTheme()

  return (
    <Row>
      <Col xs={12} lg={9}>
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
      </Col>
      <Col xs={12} lg={3} className="mt-3 mt-lg-0">
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
            {` ${lockTime / 86400} days`}
          </span>
        </Box>
      </Col>
    </Row>
  )
}

Details.propTypes = {
  depositToken: PropTypes.object,
  depositTokenBalance: PropTypes.number,
  miniMeToken: PropTypes.object,
  miniMeTokenBalance: PropTypes.number,
  lockTime: PropTypes.string,
}

export default Details
