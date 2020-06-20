import { createStore, applyMiddleware } from 'redux'
// import { forwardToMain, replayActionRenderer, getInitialStateRenderer } from 'redux-replica'
import { forwardToMain, replayActionRenderer, getInitialStateRenderer } from '../../../../lib-esm'

import rootReducer from './rootReducer'

export const createSlaveStore = async () => {
  const initialState = await getInitialStateRenderer() // !
  const store = createStore(
    rootReducer,
    initialState, // !@@REDUX
    applyMiddleware(
      forwardToMain, // !@@REDUX IMPORTANT! This goes ***first***
      // Other
    ),
  )

  replayActionRenderer(store) // !@@REDUX

  return store
}
