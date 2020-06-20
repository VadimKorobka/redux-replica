import { createSlaveStore } from '../store/slave'
import { INCREMENT } from '../store/actions'

// Prepare html element
const app = document.getElementById('app')
const button = document.createElement('button')
button.innerText = 'Value: -'
button.setAttribute('title', 'Click to increment')
app.appendChild(button)

// !@@REDUX Create store
createSlaveStore().then((store) => {
  // Some simple usage
  button.innerText = `Value: ${store.getState().test.counter}`
  button.addEventListener('click', () => {
    store.dispatch({ type: INCREMENT })
  })
  store.subscribe(() => {
    button.innerText = `Value: ${store.getState().test.counter}`
  })
})
