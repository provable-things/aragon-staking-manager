import React, { Fragment, useState } from 'react'
import styled from 'styled-components'
import { Button, Field, GU, Info, TextInput } from '@aragon/ui'
import PropTypes from 'prop-types'
import { parseSeconds } from '../utils/format'

const Wrapper = (_props) => {
  const { action, onClick, minLockTime } = _props

  const [amount, setAmount] = useState('')
  const [receiver, setReceiver] = useState('')
  const [days, setDays] = useState('')

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
              minLockTime
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
      {action === 'Wrap' ? (
        <Fragment>
          <WrapperField>
            <Field
              label="Enter the receiver here:"
              required
              css={`
                margin-top: ${1 * GU}px;
              `}
            >
              <TextInput
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
                wide
                type="test"
                required
              />
            </Field>
          </WrapperField>
          <WrapperField>
            <Field
              label="Enter the number of days to lock tokens here:"
              required
              css={`
                margin-top: ${1 * GU}px;
              `}
            >
              <TextInput
                value={days}
                onChange={(e) => setDays(e.target.value)}
                wide
                min={0}
                type="number"
                step="any"
                required
              />
            </Field>
          </WrapperField>
        </Fragment>
      ) : null}
      <Button
        onClick={() =>
          onClick({ amount, action, receiver, lockTime: days * 60 * 60 * 24 })
        }
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
  minLockTime: PropTypes.number,
}

export default Wrapper
