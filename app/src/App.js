import React, { useState } from 'react'
import { useAragonApi } from '@aragon/api-react'
import { Header, Main, SyncIndicator } from '@aragon/ui'
import Wrapper from './components/Wrapper'
import styled from 'styled-components'

import ERC20 from './abi/ERC20.json'

const App = () => {
  const { api, appState } = useAragonApi()
  const { depositToken, isSyncing } = appState

  const [amount, setAmount] = useState('')

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
      {isSyncing && <SyncIndicator />}
      <Header primary="External Token Wrapper" />
      {/*<Tabs
        items={['Wrap', 'Unwrap']}
        selected={selected}
        onChange={setSelected}
      />*/}

      <Wrapper
        amount={amount}
        onChangeAmount={(_amount) => setAmount(_amount)}
        onClick={handleClick}
      />
    </Main>
  )
}

export default App
