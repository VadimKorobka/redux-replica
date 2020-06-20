import { createStore, applyMiddleware } from 'redux'
// import { forwardToRenderer, replayActionMain } from 'redux-replica'
import { forwardToRenderer, replayActionMain } from '../../../../lib-esm'

import rootReducer from './rootReducer'

export const createMainStore = async () => {
  const store = createStore(
    rootReducer,
    {},
    applyMiddleware(
      // Other
      forwardToRenderer, // !@@REDUX IMPORTANT! This goes last
    ),
  )

  replayActionMain(store) // !@@REDUX

  return store
}
