import 'core-js/stable'
import 'regenerator-runtime/runtime'
import Aragon, { events, a } from '@aragon/api'
import ERC20Abi from './abi/ERC20.json'
import TokenManagerAbi from './abi/TokenManager.json'
import { correctFormat } from './utils/format'
import { useConnectedAccount } from '@aragon/api-react'

const app = new Aragon()

app.store(
  async (state, { event, returnValues }) => {
    const nextState = {
      ...state,
    }

    try {
      switch (event) {
        case events.ACCOUNTS_TRIGGER:
          return handleAccountChange(nextState, returnValues)
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

const handleAccountChange = async (_nextState, { account }) => {
  const { miniMeTokenBalance, depositTokenBalance } = await getTokenBalances(
    _nextState.miniMeToken.address,
    _nextState.miniMeToken.decimals,
    _nextState.depositToken.address,
    _nextState.depositToken.decimals,
    account
  )

  return {
    ..._nextState,
    miniMeTokenBalance,
    depositTokenBalance,
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

const getTokenBalances = async (
  _miniMeTokenAddress,
  _miniMeTokenDecimals,
  _depositTokenAddress,
  _depositTokenDecimals,
  _account
) => {
  const miniMeTokenBalance = await getTokenBalance(
    _miniMeTokenAddress,
    _miniMeTokenDecimals,
    _account
  )
  const depositTokenBalance = await getTokenBalance(
    _depositTokenAddress,
    _depositTokenDecimals,
    _account
  )

  return {
    miniMeTokenBalance,
    depositTokenBalance,
  }
}

const getTokenBalance = async (_tokenAddress, _tokenDecimals, _address) => {
  const token = app.external(_tokenAddress, ERC20Abi)
  const balance = await token.balanceOf(_address).toPromise()
  return correctFormat(balance, _tokenDecimals, '/')
}
