import React, { Fragment, useState } from 'react'
import { useAragonApi } from '@aragon/api-react'
import { Button, Header, Main, SidePanel, SyncIndicator } from '@aragon/ui'
import Wrapper from './components/Wrapper'
import Details from './components/Details'
import styled from 'styled-components'

import ERC20 from './abi/ERC20.json'

const App = () => {
  const { api, appState } = useAragonApi()
  const {
    depositToken,
    depositTokenBalance,
    miniMeToken,
    miniMeTokenBalance,
    isSyncing,
  } = appState

  const [opened, setOpened] = useState(false)
  const [action, setAction] = useState(null)

  const handleClick = ({ amount, action }) => {
    console.log(amount, action)
    //api.wrap(amount).toPromise()
    /*if (action === 'Wrap') {
      api
        .wrap(amount, {
          token: { address: depositToken.address, value: amount },
        })
        .toPromise()
    } else if (action === 'Unwrap') {
      api
        .wrap(amount, {
          token: { address: depositToken.address, value: amount },
        })
        .toPromise()
    }*/
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
                  onClick={() => {
                    setOpened(true)
                    setAction('Unwrap')
                  }}
                />
                <Button
                  style={{ marginLeft: '10px' }}
                  mode="strong"
                  label={'Wrap'}
                  onClick={() => {
                    setOpened(true)
                    setAction('Wrap')
                  }}
                />
              </React.Fragment>
            }
          />
          <SidePanel
            title={`${action} your tokens`}
            opened={opened}
            onClose={() => {
              setOpened(false)
              setAction(null)
            }}
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
