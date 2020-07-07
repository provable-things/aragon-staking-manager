import React, { Fragment, useState } from 'react'
import styled from 'styled-components'
import { Box, Button, Field, GU, Info, TextInput, textStyle } from '@aragon/ui'
import PropTypes from 'prop-types'

const Wrapper = (_props) => {
  const { action, onClick } = _props

  const [amount, setAmount] = useState('')

  return (
    <Fragment>
      <Info
        title="ACTION"
        css={`
          width: 100%;
          margin-top: ${2 * GU}px;
        `}
      >
        {`This action will ${
          action === 'Wrap' ? 'create' : 'burn'
        } tokens and transfer them to the transaction sender`}
      </Info>
      <WrapperField>
        <Field
          label="Enter the amount here:"
          required
          css={`
            margin-top: ${3 * GU}px;
          `}
        >
          <TextInput.Number
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            wide
            min={0}
            step="any"
            required
          />
        </Field>
      </WrapperField>
      <Button onClick={() => onClick()}>{action}</Button>
    </Fragment>
  )
}

const WrapperField = styled.div`
  label {
    width: 100% !important;
  }
`

Wrapper.propTypes = {
  action: PropTypes.string,
  onClick: PropTypes.func,
}

export default Wrapper
