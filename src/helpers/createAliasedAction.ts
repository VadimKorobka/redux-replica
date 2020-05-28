import { ALIASED } from '@actions/alias'
import aliasRegistry from '@registry/alias'

export default function createAliasedAction(name: string, actionCreator: <T = any>(...args: any[]) => T) {
  // register
  aliasRegistry.set(name, actionCreator)

  // factory
  return (...args: any[]) => ({
    type: ALIASED,
    payload: args,
    meta: {
      trigger: name,
    },
  })
}
