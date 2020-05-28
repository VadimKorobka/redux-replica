export type serialisable = null | undefined | string | number | boolean | PlainObject | serialisable[]

export interface Action {
  type: string
  payload: serialisable
  meta?: {
    scope?: string
  }
  [key: string]: serialisable
}

export interface AliasedAction extends Action {
  payload: Action['payload'][]
  meta: {
    scope?: string
    trigger: string
  }
}

export interface PlainObject {
  [key: string]: serialisable
}

export interface IPCListener {
  on: (channel: string, callback: (...args: any[]) => void) => void
}

export interface IPCSender {
  send: (channel: string, ...args: any) => void
}
