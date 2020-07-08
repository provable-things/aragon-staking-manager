import React, { Fragment, useState } from 'react'
import styled from 'styled-components'
import { Button, Field, GU, Info, TextInput } from '@aragon/ui'
import PropTypes from 'prop-types'
import { parseSeconds } from '../utils/format'

const Wrapper = (_props) => {
  const { action, onClick, lockTime } = _props

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
        } tokens and transfer them to the transaction sender.`}
        <br />
        {action === 'Wrap'
          ? `Keep in mind that you cannot unwrap them before ${parseSeconds(
              lockTime
            )}.`
          : ''}
      </Info>
      <WrapperField>
        <Field
          label="Enter the amount here:"
          required
          css={`
            margin-top: ${3 * GU}px;
          `}
        >
          <TextInput
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            wide
            min={0}
            type="number"
            step="any"
            required
          />
        </Field>
      </WrapperField>
      <Button
        onClick={() => onClick({ amount, action })}
        label={action}
        disabled={amount.length === 0}
      />
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
  lockTime: PropTypes.number,
}

export default Wrapper
