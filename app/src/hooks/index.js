/*import { useCallback, useState, useMemo } from 'react'
import { useAppState, useAragonApi, usePath } from '@aragon/api-react'
import { useSidePanel } from './utils-hooks'



export function useWrapAction(onDone) {
  const { api } = useAragonApi()

  return useCallback(
    (depositTokenAddress, depositAmount, requestAmount, reference, intentParams) => {
      try {
        api.createTokenRequest(depositTokenAddress, depositAmount, requestAmount, reference, intentParams).toPromise()

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
    requestId => {
      try {
        api.finaliseTokenRequest(requestId).toPromise()

        onDone()
      } catch (error) {
        console.error(error)
      }
    },
    [api, onDone]
  )
}

export function useAppLogic() {
  const { account, token, isSyncing, ready, requests, acceptedTokens = [] } = useAppState()
  const [selectedRequest, selectRequest] = useSelectedRequest(requests)
  //const panelState = useSidePanel()

  const actions = {
    request: useRequestAction(/*panelState.requestClose),
    submit: useSubmitAction(/*panelState.requestClose),
    withdraw: useWithdrawAction(/*panelState.requestClose),
  }

  return {
    panelState,
    isSyncing: isSyncing || !ready,
    selectedRequest,
    selectRequest,
    acceptedTokens,
    account,
    token,
    actions,
    requests,
  }
}*/
