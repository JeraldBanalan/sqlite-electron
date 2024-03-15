import './style.css'
import viteLogo from '/logo.svg'
import typescriptLogo from './typescript.svg'
import { setupCounter } from './counter'

// Create the form
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
  Test Form
    <form id="myForm">
    <label>Name: <input id="nameInput" placeholder="name" /> </label>
    <button type="submit">Submit</button>
    </form>
  </div>
`

// Handle the form submission
document.querySelector<HTMLFormElement>('#myForm')!.addEventListener('submit', (event) => {
  event.preventDefault();

  // Get the name input value
  const name = document.querySelector<HTMLInputElement>('#nameInput')!.value;

  // Send an IPC message to the main process with the form data
  window.ipcRenderer.send('form-submission', { name });
});

setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)

// Remove Preload scripts loading
postMessage({ payload: 'removeLoading' }, '*')

// Use contextBridge
window.ipcRenderer.on('main-process-message', (_event, message) => {
  console.log(message)
})
