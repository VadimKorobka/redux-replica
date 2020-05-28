/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-var-requires */
import { WebContents } from 'electron'
import { Action, IPCListener, IPCSender } from '@types'
// eslint-disable-next-line import/no-extraneous-dependencies
import { Store } from 'redux'

const isChrome = typeof chrome !== 'undefined'
let isElectron = false

try {
  const electron = require('electron')
  if (electron) {
    isElectron = true
  }
} catch {
  //
}

if (!isElectron && !isChrome) {
  throw new Error('Chrome or Electron is not detected')
}

export const getRendererSender = (): IPCSender => {
  if (isElectron) {
    const { ipcRenderer } = require('electron')
    return ipcRenderer
  }
  if (isChrome) {
    return {
      send: (channel, ...args) => {
        chrome.runtime.sendMessage({ channel, args })
      },
    }
  }
  throw new Error('Unknown platform')
}

export const getRendererListener = (): IPCListener => {
  if (isElectron) {
    const { ipcRenderer } = require('electron')
    return ipcRenderer
  }
  if (isChrome) {
    return {
      on: (channel, callback) => {
        chrome.runtime.onMessage.addListener((request) => {
          if (request && request.channel === channel) {
            callback(undefined, ...request.args)
          }
        })
      },
    }
  }
  throw new Error('Unknown platform')
}

export const getMainListener = () => {
  if (isElectron) {
    const { ipcMain } = require('electron')
    return ipcMain
  }
  if (isChrome) {
    return getRendererListener()
  }
  throw new Error('Unknown platform')
}

export const sendActionToAllRenderer = (channel: string, action: Action) => {
  if (isElectron) {
    const { webContents } = require('electron')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const allWebContents: WebContents[] = webContents.getAllWebContents()

    allWebContents.forEach((contents) => {
      contents.send(channel, action)
    })
  } else if (isChrome) {
    chrome.runtime.sendMessage({ channel, args: [action] })
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(({ id }) => chrome.tabs.sendMessage(id, { channel, args: [action] }))
    })
  }
}

export const setGlobalInitialState = <T extends Store = Store>(store: T) => {
  if (isElectron) {
    const globalClosured = global as any
    globalClosured.getReduxState = () => JSON.stringify(store.getState())
  } else if (isChrome) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse): boolean => {
      if (request.channel === 'redux-get-initial-state') {
        sendResponse(store.getState())
        return true
      }

      return false
    })
  }
}

export const getGlobalInitialState = <T extends Store = Store>(): Promise<T> => {
  if (isElectron) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const getReduxState: CallableFunction = require('electron').remote.getGlobal('getReduxState')
    if (!getReduxState) {
      throw new Error('Could not find reduxState global in main process, did you forget to call replayActionMain?')
    }
    return Promise.resolve(JSON.parse(getReduxState()))
  }
  if (isChrome) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('TIMEOUT')), 30000)
      chrome.runtime.sendMessage({ channel: 'redux-get-initial-state' }, (response) => {
        console.log(response)
        resolve(response)
        clearTimeout(timeout)
      })
    })
  }
  throw new Error('Unknown platform')
}
