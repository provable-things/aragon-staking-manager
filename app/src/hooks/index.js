import { useCallback } from 'react'
import { useAragonApi, useAppState } from '@aragon/api-react'
import { useSidePanel } from './side-panel'

const useWrapAction = (_onDone) => {
  const { api } = useAragonApi()

  return useCallback(
    (_amount, _lockTime, _receiver, _intentParams) => {
      try {
        api.wrap(_amount, _lockTime, _receiver, _intentParams).toPromise()

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
        api.unwrap(_amount).toPromise()

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
    lockedWraps,
  } = useAppState()

  const panelState = useSidePanel()

  const actions = {
    wrap: useWrapAction(panelState.requestClose),
    unwrap: useUnwrapAction(panelState.requestClose),
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
    lockedWraps,
  }
}

export { useWrapAction, useUnwrapAction, useAppLogic }
