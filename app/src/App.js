import React, { Fragment, useState } from 'react'
import { useAppLogic } from './hooks'
import { Button, Header, Main, SidePanel, SyncIndicator } from '@aragon/ui'
import { Row, Col } from 'react-bootstrap'
import Staker from './components/Staker'
import LockedWraps from './components/LockedWraps'
import Info from './components/Info'
import LocksDetails from './components/LocksDetails'
import { correctFormat, parseAmount } from './utils/number-utils'

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
    account
  } = useAppLogic()

  const [action, setAction] = useState(null)

  const handleClick = ({ amount, action, lockTime, receiver }) => {
    if (action === 'Stake') {
      const formattedAmount = correctFormat(
        parseAmount(depositToken.decimals, amount),
        depositToken.decimals,
        '*'
      )

      actions.stake(formattedAmount, lockTime, receiver, {
        token: { address: depositToken.address, value: formattedAmount },
      })
    } else if (action === 'Unstake') {
      actions.unstake(
        correctFormat(
          parseAmount(miniMeToken.decimals, amount),
          miniMeToken.decimals,
          '*'
        )
      )
    }
  }

  return (
    <Main>
      {isSyncing || !depositToken || !miniMeToken ? (
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
              panelState.requestClose(_e)
            }}
            onTransitionEnd={panelState.endTransition}
          >
            <Staker
              action={action}
              minLockTime={minLockTime}
              onClick={handleClick}
            />
          </SidePanel>

          <Row>
            <Col xs={12} lg={4}>
              <Row>
                <Col xs={12}>
                  <Info
                    depositToken={depositToken}
                    depositTokenBalance={depositTokenBalance}
                    miniMeToken={miniMeToken}
                    miniMeTokenBalance={miniMeTokenBalance}
                    minLockTime={minLockTime}
                  />
                </Col>
                <Col xs={12} className="mt-3">
                  <LocksDetails
                    depositToken={depositToken}
                    stakedLocks={stakedLocks}
                  />
                </Col>
              </Row>
            </Col>
            <Col xs={12} lg={8} className="mt-3 mt-lg-0">
              <LockedWraps
                depositToken={depositToken}
                stakedLocks={stakedLocks}
                onUnwrap={handleClick}
                onOpenSidebar={(_e) => {
                  panelState.requestOpen(_e)
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
