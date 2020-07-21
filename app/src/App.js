import React, { Fragment, useState } from 'react'
import { useAppLogic } from './hooks'
import { Button, Header, Main, SidePanel, SyncIndicator } from '@aragon/ui'
import { Row, Col } from 'react-bootstrap'
import Staker from './components/Staker'
import StakeHistory from './components/StakeHistory'
import Wallet from './components/Wallet'
import Info from './components/Info'
import { onChainFormat, parseAmount, stretch } from './utils/amount-utils'
import { useGuiStyle } from '@aragon/api-react'
import VotingPower from './components/VotingPower'
import Web3 from 'web3'
import { toBN } from 'web3-utils'

window.addEventListener(
  'message',
  (e) => {
    console.log(e)
  },
  false
)

const App = () => {
  const {
    depositToken,
    depositTokenBalance,
    miniMeToken,
    miniMeTokenBalance,
    isSyncing,
    actions,
    panelState,
    minLockTime,
    stakedLocks,
    account,
    vaultBalance,
  } = useAppLogic()

  const [action, setAction] = useState(null)
  const [defaultAmount, setDefaultAmount] = useState(null)
  const { appearance } = useGuiStyle()

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
              <VotingPower
                miniMeTokenBalance={miniMeTokenBalance}
                miniMeToken={miniMeToken}
                depositToken={depositToken}
                vaultBalance={vaultBalance}
              />
            </Col>
            <Col xs={12} xl={4} className="mt-3 mt-xl-0">
              <Wallet
                depositToken={depositToken}
                depositTokenBalance={depositTokenBalance}
                miniMeToken={miniMeToken}
                miniMeTokenBalance={miniMeTokenBalance}
                minLockTime={minLockTime}
              />
            </Col>
            <Col xs={12} xl={4} className="mt-3 mt-xl-0">
              <Info depositToken={depositToken} stakedLocks={stakedLocks} />
            </Col>
          </Row>
          <Row>
            <Col xs={12} className="mt-3">
              <StakeHistory
                depositToken={depositToken}
                miniMeToken={miniMeToken}
                stakedLocks={stakedLocks}
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
