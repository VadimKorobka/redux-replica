import { getRendererListener } from './transport'

export default function replayActionRenderer(store) {
  getRendererListener().on('redux-action', (event, payload) => {
    store.dispatch(payload)
  })
}
