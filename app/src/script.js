import 'core-js/stable'
import 'regenerator-runtime/runtime'
import Aragon, { events } from '@aragon/api'
import ERC20Abi from './abi/ERC20.json'
import TokenManagerAbi from './abi/TokenManager.json'
import { first } from 'rxjs/operators'

const app = new Aragon()

// TODO: check that tokens (miniMe and deposit) have the same decimals
app
  .call('tokenManager')
  .subscribe(initialize, (err) =>
    console.error(
      `Could not start background script execution due to the contract not loading token: ${err}`
    )
  )

async function initialize(_tokenManagerAddress) {
  const network = await app.network().pipe(first()).toPromise()
  const tokenManagerContract = app.external(
    _tokenManagerAddress,
    TokenManagerAbi
  )

  const settings = {
    network,
  }
  return createStore(tokenManagerContract, settings)
}

function createStore(_tokenManagerContract, _settings) {
  return app.store(
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
          case 'Staked':
            return handleEvent(nextState)
          case 'Unstaked':
            return handleEvent(nextState, returnValues)
          default:
            return state
        }
      } catch (_err) {
        console.error(`Failed to create store: ${_err.message}`)
      }
    },
    {
      init: initializeState(_tokenManagerContract, _settings),
    }
  )
}

function initializeState(_tokenManagerContract, _settings) {
  return async (_cachedState) => {
    try {
      const miniMeTokenAddress = await _tokenManagerContract.token().toPromise()
      const miniMeToken = await getTokenData(miniMeTokenAddress)

      const depositTokenAddress = await app.call('depositToken').toPromise()
      const depositToken = await getTokenData(depositTokenAddress)

      const vaultAddress = await app.call('vault').toPromise()
      const vaultBalance = await getTokenBalance(
        depositTokenAddress,
        depositToken.decimals,
        vaultAddress
      )

      return {
        ..._cachedState,
        miniMeToken,
        depositToken,
        minLockTime: parseInt(await app.call('minLockTime').toPromise()),
        vaultBalance,
        vaultAddress,
        _settings,
      }
    } catch (_err) {
      console.error(`Failed to initialize state: ${_err.message}`)
      return _cachedState
    }
  }
}

const handleEvent = async (_nextState) => {
  try {
    if (_nextState.account) {
      const {
        miniMeTokenBalance,
        depositTokenBalance,
      } = await getTokenBalances(
        _nextState.miniMeToken.address,
        _nextState.miniMeToken.decimals,
        _nextState.depositToken.address,
        _nextState.depositToken.decimals,
        _nextState.account
      )

      return {
        ..._nextState,
        miniMeTokenBalance,
        depositTokenBalance,
        stakedLocks: await getStakedLocks(_nextState.account),
        vaultBalance: await getTokenBalance(
          _nextState.depositToken.address,
          _nextState.depositToken.decimals,
          _nextState.vaultAddress
        ),
      }
    }

    return _nextState
  } catch (_err) {
    console.error(`Failed to handle event: ${_err.message}`)
    return _nextState
  }
}

const handleAccountChange = async (_nextState, { account }) => {
  try {
    if (account) {
      const {
        miniMeTokenBalance,
        depositTokenBalance,
      } = await getTokenBalances(
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
        account,
        stakedLocks: await getStakedLocks(account),
      }
    }

    return _nextState
  } catch (_err) {
    console.error(`Failed to handle account change: ${_err.message}`)
    return _nextState
  }
}

const getStakedLocks = (_tokenAddress) => {
  try {
    return app.call('getStakedLocks', _tokenAddress).toPromise()
  } catch (_err) {
    console.error(`Failed to load staked locks: ${_err.message}`)
    return []
  }
}

const getTokenData = async (_tokenAddress) => {
  try {
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
  } catch (err) {
    console.error(`Failed to load token data: ${_err.message}`)
    // TODO find a way to get a fallback
    throw new Error(_err.message)
  }
}

const getTokenBalances = async (
  _miniMeTokenAddress,
  _miniMeTokenDecimals,
  _depositTokenAddress,
  _depositTokenDecimals,
  _account
) => {
  try {
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
  } catch (_err) {
    console.error(`Failed to load token balances: ${_err.message}`)
    throw new Error(_err.message)
  }
}

const getTokenBalance = (_tokenAddress, _tokenDecimals, _address) => {
  try {
    const token = app.external(_tokenAddress, ERC20Abi)
    return token.balanceOf(_address).toPromise()
  } catch (_err) {
    console.error(`Failed to load token balance: ${_err.message}`)
    throw new Error(_err.message)
  }
}
