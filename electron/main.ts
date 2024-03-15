import path from 'path'
import { app, BrowserWindow, ipcMain } from 'electron'
import { getSqlite3, insertFormData } from './sqlite3'

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST, '../public')

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'logo.svg'),
    webPreferences: {
      preload: path.join(__dirname, './preload.js'),
    },
  })

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }
}

app.on('window-all-closed', () => {
  app.quit()
  win = null
})

app.whenReady().then(() => {
  createWindow()
  getSqlite3().then(database => {
    // ensure did-finish-load
    setTimeout(() => {
      win?.webContents.send('main-process-message', '[sqlite3] initialize success :)')
    }, 999)
  })

  // Listen for 'form-submission' event from renderer process
  ipcMain.on('form-submission', (event, formData) => {
    console.log(formData);  // Log the form data to the console

    // Insert the form data into the SQLite database
    getSqlite3().then(db => {
      insertFormData(db, formData.name);
    });
  });
})
