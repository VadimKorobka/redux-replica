import validateAction from '@helpers/validateAction'
import { sendActionToAllRenderer } from '@helpers/transport'
import { Action } from '@types'

const forwardToRenderer = () => (next: CallableFunction) => (action: Action) => {
  if (!validateAction(action)) return next(action)
  if (action.meta && action.meta.scope === 'local') return next(action)

  // change scope to avoid endless-loop
  const rendererAction = {
    ...action,
    meta: {
      ...action.meta,
      scope: 'local',
    },
  }

  sendActionToAllRenderer('redux-action', rendererAction)

  return next(action)
}

export default forwardToRenderer
