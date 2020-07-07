import 'core-js/stable'
import 'regenerator-runtime/runtime'

import React from 'react'
import ReactDOM from 'react-dom'
import { AragonApi } from '@aragon/api-react'
import App from './App'

import 'bootstrap/dist/css/bootstrap.min.css'

const reducer = (state) => {
  if (state === null) {
    return {
      depositTokenBalance: null,
      depositToken: null,
      miniMeTokenBalance: 0,
      miniMeToken: null,
      isSyncing: true,
    }
  }
  return state
}

ReactDOM.render(
  <AragonApi reducer={reducer}>
    <App />
  </AragonApi>,
  document.getElementById('root')
)
