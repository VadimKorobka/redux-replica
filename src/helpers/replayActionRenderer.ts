import { Store } from 'redux'
import { getRendererListener } from '@transport'

export default function replayActionRenderer<T extends Store = Store>(store: T) {
  getRendererListener().on('redux-action', (event, payload) => {
    store.dispatch(payload)
  })
}
