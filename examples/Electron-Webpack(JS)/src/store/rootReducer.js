import { combineReducers } from 'redux'

import { INCREMENT } from './actions'

const defaultState = {
  counter: 0,
}

const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case INCREMENT:
      return { ...state, counter: (state.counter += 1) }
    default:
      return state
  }
}

const rootReducer = combineReducers({ test: reducer })

export default rootReducer
