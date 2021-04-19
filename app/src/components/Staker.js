import React, { Fragment, Component } from 'react'
import styled from 'styled-components'
import { Button, Field, GU, Info, TextInput, DropDown, Checkbox } from '@aragon/ui'
import PropTypes from 'prop-types'
import { parseSeconds, calculateInitialDate, formatSeconds, LOCK_FORMAT_OPTIONS } from '../utils/time-utils'
import Web3 from 'web3'
import BigNumber from 'bignumber.js'

const web3 = new Web3()

class Staker extends Component {
  constructor(_props, _context) {
    super(_props, _context)

    const { account, defaultAmount, minLockTime } = _props
    const { format, time } = calculateInitialDate(minLockTime)

    this.state = {
      lockFormat: LOCK_FORMAT_OPTIONS.indexOf(format),
      duration: time,
      amount: defaultAmount ? defaultAmount : '',
      receiver: account ? account : '',
      error: '',
      advance: false,
    }
  }

  handleAction = () => {
    this.setState({ error: null })
    if (this.props.action === 'Stake') {
      if (this.props.depositTokenBalance.isLessThan(new BigNumber(this.state.amount))) {
        this.setState({ error: 'Balance too low' })
        return
      }

      const secondsLockTime = this.state.duration * formatSeconds[this.state.lockFormat]
      if (secondsLockTime < this.props.minLockTime) {
        this.setState({
          error: `Lock Time too low. Please insert a lock of at least ${parseSeconds(this.props.minLockTime)}.`,
        })
        return
      }

      if (!web3.utils.isAddress(this.state.receiver)) {
        this.setState({ error: 'Invalid Ethereum address.' })
        return
      }

      this.props.onAction({
        amount: this.state.amount,
        action: this.props.action,
        receiver: this.state.receiver,
        duration: secondsLockTime,
      })
      return
    } else if (this.props.action === 'Unstake') {
      if (this.props.miniMeTokenBalance.isLessThan(new BigNumber(this.state.amount))) {
        this.setState({ error: 'Balance too low' })
        return
      }

      this.props.onAction({
        amount: this.state.amount,
        action: this.props.action,
      })
    } else if (this.props.action === 'Extend Timelock') {
      const secondsLockTime = this.state.duration * formatSeconds[this.state.lockFormat]
      this.props.onAction({
        duration: secondsLockTime,
        action: this.props.action,
      })
    }
  }

  render() {
    const { minLockTime, action } = this.props

    return (
      <Fragment>
        <Info
          title="ACTION"
          css={`
            width: 100%;
            margin-top: ${2 * GU}px;
          `}
        >
          {action !== 'Extend Timelock'
            ? `This action will ${
                action === 'Stake' ? 'create' : 'burn'
              } tokens and transfer them to the transaction sender.`
            : 'This action will change the duration of the selected timelock by extending it for the selected duration.'}
          <br />
          {action === 'Stake' ? `Keep in mind that you cannot unstake them before ${parseSeconds(minLockTime)}.` : ''}
        </Info>
        {action !== 'Extend Timelock' ? (
          <WrapperField>
            <Field
              label="Enter the amount here:"
              required
              css={`
                margin-top: ${3 * GU}px;
              `}
            >
              <TextInput
                value={this.state.amount}
                onChange={(e) => this.setState({ amount: e.target.value })}
                wide
                min={0}
                type="number"
                step="any"
                required
              />
            </Field>
          </WrapperField>
        ) : null}
        {action === 'Stake' ? (
          <LabelCheckBox>
            <Checkbox checked={this.state.advance} onChange={(advance) => this.setState({ advance })} />
            Advanced
          </LabelCheckBox>
        ) : null}
        {(action === 'Stake' && this.state.advance) || action === 'Extend Timelock' ? (
          <Fragment>
            {action !== 'Extend Timelock' ? (
              <WrapperField>
                <Field
                  label="Enter the receiver here:"
                  required
                  css={`
                    margin-top: ${1 * GU}px;
                  `}
                >
                  <TextInput
                    value={this.state.receiver}
                    onChange={(e) => this.setState({ receiver: e.target.value })}
                    wide
                    type="test"
                    required
                  />
                </Field>
              </WrapperField>
            ) : null}
            <WrapperLockTimeSelection>
              <Field
                label="Select a lock time"
                required
                css={`
                  margin-top: ${action === 'Extend Timelock' ? 3 * GU : 1 * GU}px;
                  width: 50%;
                `}
              >
                <TextInput
                  value={this.state.duration}
                  onChange={(e) => this.setState({ duration: e.target.value })}
                  min={0}
                  type="number"
                  step="any"
                  required
                />
              </Field>
              <DropDown
                width={'50%'}
                selected={this.state.lockFormat}
                onChange={(lockFormat) => this.setState({ lockFormat })}
                items={LOCK_FORMAT_OPTIONS}
              />
            </WrapperLockTimeSelection>
          </Fragment>
        ) : null}
        <Button
          onClick={this.handleAction}
          label={action}
          disabled={
            action === 'Stake'
              ? this.state.amount.length === 0 ||
                this.state.receiver.length === 0 ||
                this.state.duration === 0 ||
                this.state.duration.length === 0
              : action === 'Unstake'
              ? this.state.amount.length === 0
              : this.state.duration === 0 || this.state.duration.length === 0
          }
        />
        {this.state.error ? (
          <Info
            css={`
              margin-top: ${2 * GU}px;
            `}
            mode="error"
            title="Error"
          >
            {this.state.error}
          </Info>
        ) : null}
      </Fragment>
    )
  }
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

const LabelCheckBox = styled.label`
  align-items: center;
  display: flex;
  font-size: 12px;
  margin-botton: ${1 * GU}px;
`

Staker.propTypes = {
  action: PropTypes.string,
  account: PropTypes.string,
  onAction: PropTypes.func,
  minLockTime: PropTypes.number,
}

export default Staker
