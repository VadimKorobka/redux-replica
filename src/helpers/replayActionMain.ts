import { Store } from 'redux'
import { Action } from '@types'

import { getMainListener, setGlobalInitialState } from '@transport'

export default function replayActionMain<T extends Store = Store>(store: T) {
  setGlobalInitialState(store)

  getMainListener().on('redux-action', (event: Event, action: Action) => {
    store.dispatch(action)
  })
}
