import { getGlobalInitialState } from './transport'

export default function getInitialStateRenderer() {
  return getGlobalInitialState()
}
