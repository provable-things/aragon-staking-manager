import { useCallback } from 'react'
import { useAragonApi, useAppState } from '@aragon/api-react'
import { useSidePanel } from './side-panel'

const useWrapAction = (_onDone) => {
  const { api } = useAragonApi()

  return useCallback(
    (_amount, _lockTime, _receiver, _intentParams) => {
      try {
        api.stake(_amount, _lockTime, _receiver, _intentParams).toPromise()

        _onDone()
      } catch (error) {
        console.error(error)
      }
    },
    [api, _onDone]
  )
}

const useUnwrapAction = (_onDone) => {
  const { api } = useAragonApi()

  return useCallback(
    (_amount) => {
      try {
        api.unstake(_amount).toPromise()

        _onDone()
      } catch (error) {
        console.error(error)
      }
    },
    [api, _onDone]
  )
}

const useAppLogic = () => {
  const {
    depositToken,
    depositTokenBalance,
    miniMeToken,
    miniMeTokenBalance,
    isSyncing,
    minLockTime,
    stakedLocks,
    account,
  } = useAppState()

  const panelState = useSidePanel()

  const actions = {
    stake: useWrapAction(panelState.requestClose),
    unstake: useUnwrapAction(panelState.requestClose),
  }

  return {
    actions,
    depositToken,
    depositTokenBalance,
    miniMeToken,
    miniMeTokenBalance,
    isSyncing,
    panelState,
    minLockTime,
    stakedLocks,
    account,
  }
}

export { useWrapAction, useUnwrapAction, useAppLogic }
