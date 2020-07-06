import React, { useState } from 'React'
import { Box, Button, Field, GU, textStyle } from '@aragon/ui'
import { Row, Col } from 'react-bootstrap'
import { useAragonApi } from '@aragon/api-react'

const Wrapper = (_props) => {
  const { amount, onChangeAmount, onClick } = _props

  return (
    <Row>
      <Col xs={12} lg={8}>
        <Box
          css={`
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            height: ${50 * GU}px;
            ${textStyle('title3')};
          `}
        >
          <Field label="Enter the amount here:">
            <input
              type="number"
              value={amount}
              onChange={(e) => onChangeAmount(e.target.value)}
            />
          </Field>
          <Button onClick={() => onClick()}>ciaoi</Button>
        </Box>
      </Col>
      <Col xs={12} lg={4} className="mt-3 mt-lg-0">
        <Box
          css={`
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            height: ${50 * GU}px;
            ${textStyle('title3')};
          `}
        >
          txs
        </Box>
      </Col>
    </Row>
  )
}

export default Wrapper
