import React, { Fragment, useState } from 'react'
import styled from 'styled-components'
import { Button, Field, GU, Info, TextInput, DropDown } from '@aragon/ui'
import PropTypes from 'prop-types'
import { parseSeconds } from '../utils/format'

const formatSeconds = {
  0: 3.154e7, // Years
  1: 2.628e6, // Months
  2: 86400, // Days
  3: 3600, // Hours
  4: 60, // Minutes
}

const LOCK_FORMAT_OPTIONS = ['Years', 'Months', 'Days', 'Hours', 'Minutes']

const Wrapper = (_props) => {
  const { action, onClick, minLockTime } = _props

  const [lockFormat, setLockFormat] = useState(0)
  const [amount, setAmount] = useState('')
  const [receiver, setReceiver] = useState('')
  const [lockTime, setLockTime] = useState('')

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
          <WrapperLockTimeSelection>
            <Field
              label="Select a lock time"
              required
              css={`
                margin-top: ${1 * GU}px;
                width: 50%;
              `}
            >
              <TextInput
                value={lockTime}
                onChange={(e) => setLockTime(e.target.value)}
                min={0}
                type="number"
                step="any"
                required
              />
            </Field>
            <DropDown
              width={'50%'}
              selected={lockFormat}
              onChange={setLockFormat}
              items={LOCK_FORMAT_OPTIONS}
            />
          </WrapperLockTimeSelection>
        </Fragment>
      ) : null}
      <Button
        onClick={() =>
          onClick({
            amount,
            action,
            receiver,
            lockTime: lockTime * formatSeconds[lockFormat],
          })
        }
        label={action}
        disabled={
          amount.length === 0 ||
          receiver.length === 0 ||
          lockTime === 0 ||
          lockTime.length === 0
        }
      />
    </Fragment>
  )
}

const WrapperField = styled.div`
  label {
    width: 100% !important;
  }
`
const WrapperLockTimeSelection = styled.div`
  display: flex;
  align-items: baseline;
`

Wrapper.propTypes = {
  action: PropTypes.string,
  onClick: PropTypes.func,
  minLockTime: PropTypes.number,
}

export default Wrapper
