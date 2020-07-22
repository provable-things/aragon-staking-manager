import { useCallback } from 'react'
import { useAragonApi } from '@aragon/api-react'
import { useSidePanel } from './side-panel'

const useStakeAction = (_onDone) => {
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

const useUnstakeAction = (_onDone) => {
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
  const panelState = useSidePanel()

  const actions = {
    stake: useStakeAction(panelState.requestClose),
    unstake: useUnstakeAction(panelState.requestClose),
    panelState,
  }

  return {
    actions,
    panelState,
  }
}

export { useStakeAction, useUnstakeAction, useAppLogic }
