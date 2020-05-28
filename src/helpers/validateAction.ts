import isPlainObject from 'lodash-es/isPlainObject'
import isString from 'lodash-es/isString'
import { Action } from '@types'

function isValidKey(key: string): boolean {
  return ['type', 'payload', 'error', 'meta'].indexOf(key) > -1
}

function isFSA(action: Action): boolean {
  return isPlainObject(action) && isString(action.type) && Object.keys(action).every(isValidKey)
}

export default function validateAction(action: Action): boolean {
  if (!isFSA(action)) {
    console.error('WARNING! Action not FSA-compliant', action)
    return false
  }

  return true
}
