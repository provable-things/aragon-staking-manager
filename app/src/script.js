import 'core-js/stable'
import 'regenerator-runtime/runtime'
import Aragon, { events } from '@aragon/api'
import { first } from 'rxjs/operators'
import ERC20Abi from './abi/ERC20.json'
import TokenManagerAbi from './abi/TokenManager.json'

const app = new Aragon()

app.store(
  async (state, { event }) => {
    const nextState = {
      ...state,
    }

    try {
      switch (event) {
        /*case 'Increment':
          return { ...nextState, count: await getDepositToken() }
        case 'Decrement':
          return { ...nextState, count: await getDepositToken() }*/
        case events.SYNC_STATUS_SYNCING:
          return { ...nextState, isSyncing: true }
        case events.SYNC_STATUS_SYNCED:
          return { ...nextState, isSyncing: false }
        /*case 'Wrap':
          return handleWrap(nextState)*/
        default:
          return state
      }
    } catch (err) {
      console.log(err)
    }
  },
  {
    init: initializeState(),
  }
)

function initializeState() {
  return async (cachedState) => {
    try {
      const tokenManagerAddress = await app.call('tokenManager').toPromise()
      const tokenManagerContract = app.external(
        tokenManagerAddress,
        TokenManagerAbi
      )

      const miniMeTokenAddress = await tokenManagerContract.token().toPromise()
      const miniMeToken = await getTokenData(miniMeTokenAddress)

      const depositTokenAddress = await app.call('depositToken').toPromise()
      const depositToken = await getTokenData(depositTokenAddress)

      return {
        ...cachedState,
        miniMeToken,
        depositToken,
      }
    } catch (err) {
      console.log(err)
    }
  }
}

const getTokenData = async (_tokenAddress) => {
  const token = app.external(_tokenAddress, ERC20Abi)
  const decimals = await token.decimals().toPromise()
  const name = await token.name().toPromise()
  const symbol = await token.symbol().toPromise()

  return {
    decimals,
    name,
    symbol,
    address: _tokenAddress,
  }
}
