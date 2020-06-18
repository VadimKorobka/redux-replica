[![Total alerts](https://img.shields.io/lgtm/alerts/g/VadimKorobka/redux-replica.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/VadimKorobka/redux-replica/alerts/)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/VadimKorobka/redux-replica.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/VadimKorobka/redux-replica/context:javascript)
# redux-replica

- [redux-replica](#redux-replica)
  - [Definitions](#definitions)
    - [Electron](#electron)
    - [Chrome](#chrome-extension)
  - [Motivation](#motivation)
    - [The solution](#the-solution)
  - [Install](#install)
  - [Usage Example](#usage-example)
  - [Actions](#actions)
    - [Local actions (renderer process)](#local-actions-renderer-process)
    - [Aliased actions (main process)](#aliased-actions-main-process)
    - [Blacklisted actions](#blacklisted-actions)
  - [Contributions](#contributions)
  - [Contributors](#contributors)

## Definitions

#### Electron

In Electron, the process that runs package.json's main script is called the **_main process_**. The script that runs in the main process can display a GUI by creating web pages. An Electron app always has one main process, but never more.

Since Electron uses Chromium for displaying web pages, Chromium's multi-process architecture is also used. Each web page in Electron runs in its own process, which is called the **_renderer process_**. [Electron Docs](https://www.electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes).
<br><img src="https://www.pngitem.com/pimgs/m/88-880375_electron-architecture-diagram-electron-node-js-architecture-hd.png" alt="Electron Architecture" width="400"/>

#### Chrome Extension

**_The background script_** is the extension's event handler; it contains listeners for browser events that are important to the extension. Extension UI pages, such as a **_popup_**, can contain ordinary HTML pages with JavaScript logic. Extensions that read or write to web pages utilize a **_content script_**. The content script contains JavaScript that executes in the contexts of a page that has been loaded into the browser. Content scripts read and modify the DOM of web pages the browser visits. [Developer Chrome](https://developer.chrome.com/extensions/overview#arch)
<br><img src="https://developer.chrome.com/static/images/overview/contentscriptarc.png" alt="Chrome Extension Architecture" width="400"/>

## Motivation

Using redux with electron poses a couple of problems. Processes ([main](https://github.com/electron/electron/blob/master/docs/tutorial/quick-start.md#main-process) and [renderer](https://github.com/electron/electron/blob/master/docs/tutorial/quick-start.md#renderer-process)) are completely isolated, and the only mode of communication is [IPC](https://github.com/electron/electron/blob/master/docs/api/ipc-main.md).

- Where do you keep the state?
- How do you keep the state in sync across processes?

### The solution

`redux-replica` offers an easy to use solution. The redux store on the master process becomes the single source of truth, and stores in the slave processes become mere proxies. You **MUST** use equal reducers for all processes.

#### Electron:

- Master: _Main Process_
- Slave: Each _Renderer Process_

#### Chrome Extension:

- Master: _Background Script_
- Slave: _Popup_ and each _Content Script_

<br><img src="https://svgshare.com/i/LZ2.svg" alt="Redux Replica Mechanism" width="400"/>

## Install

```sh
$ npm install --save redux-replica
```

or

```sh
$ yarn add redux-replica
```

## Usage Example

`redux-replica` comes as redux middleware that is really easy to apply:

```javascript
// in the master store
import { forwardToRenderer, triggerAlias, replayActionMain } from 'redux-replica'

const todoApp = combineReducers(reducers)

const store = createStore(
  todoApp,
  initialState, // optional
  applyMiddleware(
    triggerAlias, // optional, see below
    ...otherMiddleware,
    forwardToRenderer, // IMPORTANT! This goes last
  ),
)

replayActionMain(store)
```

```javascript
// in the slave store
import { forwardToMain, replayActionRenderer, getInitialStateRenderer } from 'redux-replica'

const todoApp = combineReducers(reducers)

getInitialStateRenderer().then((initialState) => {
  const store = createStore(
    todoApp,
    initialState,
    applyMiddleware(
      forwardToMain, // IMPORTANT! This goes first
      ...otherMiddleware,
    ),
  )

  replayActionRenderer(store)
})
```

And that's it! You are now ready to fire actions without having to worry about synchronising your state between processes.

## Actions

Actions fired **MUST** be [FSA](https://github.com/acdlite/flux-standard-action#example)-compliant, i.e. have a `type` and `payload` property. Any actions not passing this test will be ignored and simply passed through to the next middleware.

> NB: `redux-thunk` is not FSA-compliant out of the box, but can still produce compatible actions once the async action fires.

Furthermore, actions (and that includes `payload`s) **MUST** be (de-)serialisable, i.e. either POJOs (simple `object`s - that excludes native JavaScript or DOM objects like `FileList`, `Map`, etc.), `array`s, or primitives. For workarounds, check out [aliased actions](#aliased-actions-main-process)

### Local actions (renderer process)

By default, all actions are being broadcast from the main store to the renderer processes. However, some state should only live in the renderer (e.g. `isPanelOpen`). `redux-replica` introduces the concept of action scopes.

To stop an action from propagating from renderer to main store, simply set the scope to `local`:

```javascript
function myLocalActionCreator() {
  return {
    type: 'MY_ACTION',
    payload: 123,
    meta: {
      scope: 'local',
    },
  }
}
```

### Aliased actions (main process)

Most actions will originate from the renderer side, but not all should be executed there as well. A great example is fetching of data from an external source, e.g. using [promise middleware](https://github.com/acdlite/redux-promise), which should only ever be executed once (i.e. in the main process). This can be achieved using the `triggerAlias` middleware mentioned [above](#install).

Using the `createAliasedAction` helper, you can quite easily create actions that are are only being executed in the main process, and the result of which is being broadcast to the renderer processes.

```javascript
import { createAliasedAction } from 'redux-replica'

export const importGithubProjects = createAliasedAction(
  'IMPORT_GITHUB_PROJECTS', // unique identifier
  (accessToken, repoFullName) => ({
    type: 'IMPORT_GITHUB_PROJECTS',
    payload: importProjects(accessToken, repoFullName),
  }),
)
```

### Blacklisted actions

By default actions of certain type (e.g. starting with '@@') are not propagated to the main thread. You can change this behaviour by using `forwardToMainWithParams` function.

```javascript
// in the renderer store
import { forwardToMainWithParams, replayActionRenderer, getInitialStateRenderer } from 'redux-replica'

const todoApp = combineReducers(reducers)
const initialState = getInitialStateRenderer()

const store = createStore(
  todoApp,
  initialState,
  applyMiddleware(
    forwardToMainWithParams(), // IMPORTANT! This goes first
    ...otherMiddleware,
  ),
)

replayActionRenderer(store)
```

You can specify patterns for actions that should not be propagated to the main thread.

```javascript
forwardToMainWithParams({
  blacklist: [/^@@/, /^redux-form/],
})
```

## Contributions

Contributions via [issues](https://github.com/VadimKorobka/redux-replica/issues/new) or [pull requests](https://github.com/VadimKorobka/redux-replica/compare) are hugely welcome!

Feel free to let me know whether you're successfully using `redux-replica` in your project and I'm happy to add them here as well!
