# redux-replica

- [redux-replica](#redux-replica)
  - [Motivation](#motivation)
    - [The solution](#the-solution)
  - [Install](#install)
  - [Actions](#actions)
    - [Local actions (renderer process)](#local-actions-renderer-process)
    - [Aliased actions (main process)](#aliased-actions-main-process)
    - [Blacklisted actions](#blacklisted-actions)
  - [Contributions](#contributions)
  - [Contributors](#contributors)

## Motivation

Using redux with electron poses a couple of problems. Processes ([main](https://github.com/electron/electron/blob/master/docs/tutorial/quick-start.md#main-process) and [renderer](https://github.com/electron/electron/blob/master/docs/tutorial/quick-start.md#renderer-process)) are completely isolated, and the only mode of communication is [IPC](https://github.com/electron/electron/blob/master/docs/api/ipc-main.md).

- Where do you keep the state?
- How do you keep the state in sync across processes?

### The solution

`redux-replica` offers an easy to use solution. The redux store on the main process becomes the single source of truth, and stores in the renderer processes become mere proxies. See [under the hood](#under-the-hood).

![redux-replica basic](https://cloud.githubusercontent.com/assets/307162/20675737/385ce59e-b585-11e6-947e-3867e77c783d.png)

## Install

```
npm install --save redux-replica
```

`redux-replica` comes as redux middleware that is really easy to apply:

```javascript
// in the main store
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
// in the renderer store
import { forwardToMain, replayActionRenderer, getInitialStateRenderer } from 'redux-replica'

const todoApp = combineReducers(reducers)
const initialState = getInitialStateRenderer()

const store = createStore(
  todoApp,
  initialState,
  applyMiddleware(
    forwardToMain, // IMPORTANT! This goes first
    ...otherMiddleware,
  ),
)

replayActionRenderer(store)
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
