import React, { Fragment, useState } from 'react'
import { useAppLogic } from './hooks'
import { Button, Header, Main, SidePanel, SyncIndicator } from '@aragon/ui'
import { Row, Col } from 'react-bootstrap'
import Wrapper from './components/Wrapper'
import LockedWraps from './components/LockedWraps'
import Info from './components/Info'
import LocksDetails from './components/LocksDetails'
import { correctFormat, parseAmount } from './utils/format'

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
    lockedWraps,
  } = useAppLogic()

  const [action, setAction] = useState(null)

  const handleClick = ({ amount, action, lockTime, receiver }) => {
    console.log(lockTime)
    if (action === 'Wrap') {
      const formattedAmount = correctFormat(
        parseAmount(depositToken.decimals, amount),
        depositToken.decimals,
        '*'
      ).toString()

      actions.wrap(formattedAmount, lockTime, receiver, {
        token: { address: depositToken.address, value: formattedAmount },
      })
    } else if (action === 'Unwrap') {
      const formattedAmount = correctFormat(
        parseAmount(miniMeToken.decimals, amount),
        miniMeToken.decimals,
        '*'
      ).toString()

      unwrap(formattedAmount)
    }
  }

  const unwrap = (_amount) => actions.unwrap(_amount)

  return (
    <Main>
      {isSyncing || !depositToken || !miniMeToken ? (
        <SyncIndicator />
      ) : (
        <Fragment>
          <Header
            primary="Lockable Token Wrapper"
            secondary={
              <React.Fragment>
                <Button
                  mode="normal"
                  label={'Unwrap'}
                  onClick={(_e) => {
                    panelState.requestOpen(_e)
                    setAction('Unwrap')
                  }}
                />
                <Button
                  style={{ marginLeft: '10px' }}
                  mode="strong"
                  label={'Wrap'}
                  onClick={(_e) => {
                    panelState.requestOpen(_e)
                    setAction('Wrap')
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
            <Wrapper
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
                    lockedWraps={lockedWraps}
                  />
                </Col>
              </Row>
            </Col>
            <Col xs={12} lg={8} className="mt-3 mt-lg-0">
              <LockedWraps
                depositToken={depositToken}
                lockedWraps={lockedWraps}
                onUnwrap={unwrap}
              />
            </Col>
          </Row>
        </Fragment>
      )}
    </Main>
  )
}

export default App
