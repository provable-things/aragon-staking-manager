import React, { Fragment, useState } from 'react'
import { useAppLogic } from './hooks'
import { Button, Header, Main, SidePanel, SyncIndicator } from '@aragon/ui'
import { Row, Col } from 'react-bootstrap'
import Staker from './components/Staker'
import StakeHistory from './components/StakeHistory'
import Wallet from './components/Wallet'
import Info from './components/Info'
import { onChainFormat } from './utils/amount-utils'
import { useGuiStyle } from '@aragon/api-react'
import VotingPower from './components/VotingPower'
import { toBN } from 'web3-utils'
import { useAppState } from '@aragon/api-react'

const App = () => {
  const { actions, panelState } = useAppLogic()
  const {
    account,
    minLockTime,
    isSyncing,
    depositToken,
    miniMeToken,
  } = useAppState()
  const { appearance } = useGuiStyle()

  const [action, setAction] = useState(null)
  const [defaultAmount, setDefaultAmount] = useState(null)

  const handleAction = ({ amount, action, duration, receiver }) => {
    if (action === 'Stake') {
      const onChainAmount = onChainFormat(toBN(amount), depositToken.decimals)

      actions.stake(onChainAmount.toString(), duration, receiver, {
        token: {
          address: depositToken.address,
          value: onChainAmount.toString(),
        },
      })
    } else if (action === 'Unstake') {
      actions.unstake(
        onChainFormat(toBN(amount), miniMeToken.decimals).toString()
      )
    }
  }

  return (
    <Main theme={appearance}>
      {isSyncing ? (
        <SyncIndicator />
      ) : (
        <Fragment>
          <Header
            primary="Staking Manager"
            secondary={
              <React.Fragment>
                <Button
                  mode="normal"
                  label={'Unstake'}
                  onClick={(_e) => {
                    panelState.requestOpen(_e)
                    setAction('Unstake')
                  }}
                />
                <Button
                  style={{ marginLeft: '10px' }}
                  mode="strong"
                  label={'Stake'}
                  onClick={(_e) => {
                    panelState.requestOpen(_e)
                    setAction('Stake')
                  }}
                />
              </React.Fragment>
            }
          />
          <SidePanel
            title={`${action} your tokens`}
            opened={panelState.visible}
            onClose={(_e) => {
              setAction(null)
              setDefaultAmount(null)
              panelState.requestClose(_e)
            }}
            onTransitionEnd={panelState.endTransition}
          >
            <Staker
              action={action}
              account={account}
              defaultAmount={defaultAmount}
              minLockTime={minLockTime}
              onAction={handleAction}
            />
          </SidePanel>

          <Row>
            <Col xs={12} xl={4}>
              <VotingPower />
            </Col>
            <Col xs={12} xl={4} className="mt-3 mt-xl-0">
              <Wallet />
            </Col>
            <Col xs={12} xl={4} className="mt-3 mt-xl-0">
              <Info />
            </Col>
          </Row>
          <Row>
            <Col xs={12} className="mt-3">
              <StakeHistory
                onUnwrap={({ amount }) => {
                  setDefaultAmount(amount)
                  panelState.requestOpen()
                  setAction('Unstake')
                }}
                onOpenSidebar={() => {
                  panelState.requestOpen()
                  setAction('Stake')
                }}
              />
            </Col>
          </Row>
        </Fragment>
      )}
    </Main>
  )
}

export default App
