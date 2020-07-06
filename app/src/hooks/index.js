/*import { useCallback, useState, useMemo } from 'react'
import { useAppState, useAragonApi, usePath } from '@aragon/api-react'
import { useSidePanel } from './utils-hooks'



export function useWrapAction(onDone) {
  const { api } = useAragonApi()

  return useCallback(
    (amount, intentParams) => {
      try {
        api.wrap(amount, intentParams).toPromise()

        onDone()
      } catch (error) {
        console.error(error)
      }
    },
    [api, onDone]
  )
}

export function useUnwrapAction(onDone) {
  const { api } = useAragonApi()

  return useCallback(
    (amount, intentParams) => {
      try {
        api.unwrap(amount, intentParams).toPromise()

        onDone()
      } catch (error) {
        console.error(error)
      }
    },
    [api, onDone]
  )
}

export function useAppLogic() {
  const { account, token, isSyncing, ready, acceptedTokens = [] } = useAppState()
  const [selectedRequest, selectRequest] = useSelectedRequest(requests)
  //const panelState = useSidePanel()

  const actions = {
    wrap: useWrapAction(/*panelState.requestClose),
    unwrap: useUnwrapAction(/*panelState.requestClose),
  }

  return {
    panelState,
    selectedRequest,
    account,
    token,
    actions,
    requests,
  }
}*/
