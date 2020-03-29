import validateAction from '../helpers/validateAction'
import { getRendererSender } from '../helpers/transport'

export const forwardToMainWithParams = (params = {}) => () => next => action => {
  const { blacklist = [] } = params
  if (!validateAction(action)) return next(action)
  if (action.meta && action.meta.scope === 'local') return next(action)

  if (blacklist.some(rule => rule.test(action.type))) {
    return next(action)
  }

  // stop action in-flight
  getRendererSender().send('redux-action', action)

  return undefined
}

const forwardToMain = forwardToMainWithParams({
  blacklist: [/^@@/, /^redux-form/],
})

export default forwardToMain
