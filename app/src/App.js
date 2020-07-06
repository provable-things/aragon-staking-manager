import React, { Fragment, useState } from 'react'
import { useAragonApi } from '@aragon/api-react'
import { Button, Header, Main, Modal, SyncIndicator } from '@aragon/ui'
import Wrapper from './components/Wrapper'
import Details from './components/Details'
import styled from 'styled-components'

import ERC20 from './abi/ERC20.json'

const App = () => {
  const { api, appState } = useAragonApi()
  const { depositToken, miniMeToken, isSyncing } = appState

  const [amount, setAmount] = useState('')
  const [opened, setOpened] = useState(false)
  const [action, setAction] = useState(null)

  const handleClick = () => {
    //api.wrap(amount).toPromise()
    api
      .wrap(amount, {
        token: { address: depositToken.address, value: amount },
      })
      .toPromise()
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
                  mode="strong"
                  label={'Wrap'}
                  onClick={() => {
                    setOpened(true)
                    setAction('wrap')
                  }}
                />
                <Button
                  style={{ marginLeft: '10px' }}
                  mode="normal"
                  label={'Unwrap'}
                  onClick={() => {
                    setOpened(true)
                    setAction('unwrap')
                  }}
                />
              </React.Fragment>
            }
          />
          <Modal
            visible={opened}
            onClose={() => {
              setOpened(false)
              setAction(null)
            }}
          >
            <Wrapper
              amount={amount}
              onChangeAmount={setAmount}
              onClick={handleClick}
            />
          </Modal>

          <Details depositToken={depositToken} miniMeToken={miniMeToken} />
        </Fragment>
      )}
    </Main>
  )
}

export default App
