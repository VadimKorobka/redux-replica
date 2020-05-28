import validateAction from '@helpers/validateAction'
import { getRendererSender } from '@helpers/transport'
import { Action } from '@types'

interface Params {
  blacklist?: RegExp[]
}

export const forwardToMainWithParams = (params: Params = {}) => () => (next: CallableFunction) => (action: Action) => {
  const { blacklist = [] } = params
  if (!validateAction(action)) return next(action)
  if (action.meta && action.meta.scope === 'local') return next(action)

  if (blacklist.some((rule) => rule.test(action.type))) {
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
