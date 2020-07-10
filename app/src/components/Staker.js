import React, { Fragment, useState } from 'react'
import styled from 'styled-components'
import { Button, Field, GU, Info, TextInput, DropDown } from '@aragon/ui'
import PropTypes from 'prop-types'
import { parseSeconds } from '../utils/time-utils'
import Web3 from 'web3'

const web3 = new Web3()

const formatSeconds = {
  0: 3.154e7, // Years
  1: 2.628e6, // Months
  2: 86400, // Days
  3: 3600, // Hours
  4: 60, // Minutes
}

const LOCK_FORMAT_OPTIONS = ['Years', 'Months', 'Days', 'Hours', 'Minutes']

const Staker = (_props) => {
  const { action, onClick, minLockTime } = _props

  const [lockFormat, setLockFormat] = useState(0)
  const [amount, setAmount] = useState('')
  const [receiver, setReceiver] = useState('')
  const [lockTime, setLockTime] = useState('')
  const [error, setError] = useState(null)

  const handleClick = () => {
    setError(null)
    if (action === 'Stake') {
      const secondsLockTime = lockTime * formatSeconds[lockFormat]

      if (secondsLockTime < minLockTime) {
        setError(
          `Lock Time too low. Please insert a lock of at least ${parseSeconds(
            minLockTime
          )}.`
        )
        return
      }

      if (!web3.utils.isAddress(receiver)) {
        setError('Invalid Ethereum address.')
        return
      }

      onClick({
        amount,
        action,
        receiver,
        lockTime: secondsLockTime,
      })
      return
    } else {
      onClick({
        amount,
        action,
      })
    }
  }

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
          action === 'Stake' ? 'create' : 'burn'
        } tokens and transfer them to the transaction sender.`}
        <br />
        {action === 'Stake'
          ? `Keep in mind that you cannot unstake them before ${parseSeconds(
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
      {action === 'Stake' ? (
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
        onClick={handleClick}
        label={action}
        disabled={
          action === 'Stake'
            ? amount.length === 0 ||
              receiver.length === 0 ||
              lockTime === 0 ||
              lockTime.length === 0
            : amount.length === 0
        }
      />
      {action === 'Stake' && error ? (
        <Info
          css={`
            margin-top: ${2 * GU}px;
          `}
          mode="error"
          title="Error"
        >
          {error}
        </Info>
      ) : null}
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

Staker.propTypes = {
  action: PropTypes.string,
  onClick: PropTypes.func,
  minLockTime: PropTypes.number,
}

export default Staker
