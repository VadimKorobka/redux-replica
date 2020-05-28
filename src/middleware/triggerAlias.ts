import { ALIASED } from '@actions/alias'
import aliasRegistry from '@registry/alias'
import { AliasedAction } from '@types'

const triggerAlias = () => (next: CallableFunction) => (action: AliasedAction): any => {
  if (action.type === ALIASED) {
    const alias = aliasRegistry.get(action.meta.trigger)
    const args = action.payload || []
    return next(alias(...args))
  }

  return next(action)
}

export default triggerAlias
