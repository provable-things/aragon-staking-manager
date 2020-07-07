import React, { Fragment, useState } from 'react'
import { useAppLogic } from './hooks'
import { Button, Header, Main, SidePanel, SyncIndicator } from '@aragon/ui'
import Wrapper from './components/Wrapper'
import Details from './components/Details'

const App = () => {
  const {
    depositToken,
    depositTokenBalance,
    miniMeToken,
    miniMeTokenBalance,
    isSyncing,
    actions,
    panelState,
  } = useAppLogic()

  const [action, setAction] = useState(null)

  const handleClick = ({ amount, action }) => {
    if (action === 'Wrap') {
      actions.wrap(amount, {
        token: { address: depositToken.address, value: amount },
      })
    } else if (action === 'Unwrap') {
      actions.wrap(amount)
    }
  }

  return (
    <Main>
      {isSyncing || !depositToken || !miniMeToken ? (
        <SyncIndicator />
      ) : (
        <Fragment>
          <Header
            primary="External Token Wrapper"
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
            <Wrapper action={action} onClick={handleClick} />
          </SidePanel>

          <Details
            depositToken={depositToken}
            depositTokenBalance={depositTokenBalance}
            miniMeToken={miniMeToken}
            miniMeTokenBalance={miniMeTokenBalance}
          />
        </Fragment>
      )}
    </Main>
  )
}

export default App
