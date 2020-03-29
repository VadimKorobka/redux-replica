let isChrome = typeof chrome !== 'undefined'
let isElectron = false

try {
  const electron = require('electron')
  if (electron) {
    isElectron = true
  }
} catch (e) {}

if (!isElectron && !isChrome) {
  throw new Error('Chrome or Electron is not detected')
}

export const getRendererSender = () => {
  if (isElectron) {
    const { ipcRenderer } = require('electron')
    return ipcRenderer
  } else if (isChrome) {
    return {
      send: (channel, ...args) => {
        chrome.runtime.sendMessage({ channel, args })
      },
    }
  }
}

export const getRendererListener = () => {
  if (isElectron) {
    const { ipcRenderer } = require('electron')
    return ipcRenderer
  } else if (isChrome) {
    return {
      on: (channel, callback) => {
        chrome.runtime.onMessage.addListener(request => {
          if (request && request.channel === channel) {
            callback(undefined, ...request.args)
          }
        })
      },
    }
  }
}

export const getMainListener = () => {
  if (isElectron) {
    const { ipcMain } = require('electron')
    return ipcMain
  } else if (isChrome) {
    return getRendererListener()
  }
}

export const sendActionToAllRenderer = (channel, action) => {
  if (isElectron) {
    const { webContents } = require('electron')
    const allWebContents = webContents.getAllWebContents()

    allWebContents.forEach(contents => {
      contents.send(channel, action)
    })
  } else if (isChrome) {
    chrome.runtime.sendMessage({ channel, args: [action] })
  }
}

export const setGlobalInitialStateCreator = () => {
  let storeClosured = { getState: () => ({}) }
  if (isElectron) {
    global.getReduxState = () => JSON.stringify(storeClosured)
  } else if (isChrome) {
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
      if (request.channel == 'redux-get-initial-state') {
        sendResponse(storeClosured.getState())
        return true
      }
    })
  }
  return newStore => {
    if (isElectron) {
      global.getReduxState = () => JSON.stringify(storeClosured.getState())
    } else if (isChrome) {
      storeClosured = newStore
    }
  }
}

export const getGlobalInitialState = () => {
  if (isElectron) {
    const getReduxState = require('electron').remote.getGlobal('getReduxState')
    if (!getReduxState) {
      throw new Error('Could not find reduxState global in main process, did you forget to call replayActionMain?')
    }
    return JSON.parse(getReduxState())
  } else if (isChrome) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject('TIMEOUT'), 30000)
      chrome.runtime.sendMessage({ channel: 'redux-get-initial-state' }, response => {
        console.log(response)
        resolve(response)
        clearTimeout(timeout)
      })
    })
  }
}

// chrome.runtime.onMessage.addListener(
//     (request, sender, sendResponse) => {
//       console.log(request)
//     }
//   );
//   chrome.runtime.sendMessage({ test: 1 })
