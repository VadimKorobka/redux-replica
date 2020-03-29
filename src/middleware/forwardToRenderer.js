import validateAction from '../helpers/validateAction'
import { sendActionToAllRenderer } from '../helpers/transport'

const forwardToRenderer = () => next => action => {
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

  sendActionToAllRenderer(rendererAction)

  return next(action)
}

export default forwardToRenderer
