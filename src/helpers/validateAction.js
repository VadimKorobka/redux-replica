import { isFSA } from 'flux-standard-action'

export default function validateAction(action) {
  if (!isFSA(action)) {
    console.error('WARNING! Action not FSA-compliant', action)
    return false
  }

  return true
}
