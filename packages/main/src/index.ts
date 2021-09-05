import { app, BrowserWindow, nativeImage } from 'electron'
import { join } from 'path'
import { platform } from 'process'
import { URL } from 'url'

const isSingleInstance = app.requestSingleInstanceLock()

if (!isSingleInstance) {
  app.quit()
  process.exit(0)
}

// Disable hardware acceleration
app.disableHardwareAcceleration()

let mainWindow: BrowserWindow | null = null

const createWindow = async () => {
  const iconPath =
    platform === 'darwin'
      ? join(__dirname, '../../../buildResources/icon.icns')
      : join(__dirname, '../../../buildResources/icon.png')

  mainWindow = new BrowserWindow({
    show: false, // Use 'ready-to-show' event to show window
    vibrancy: 'under-window',
    visualEffectState: 'active',
    titleBarStyle: 'hiddenInset',
    icon: iconPath,
    webPreferences: {
      nativeWindowOpen: true,
      preload: join(__dirname, '../../preload/dist/index.cjs'),
      contextIsolation: import.meta.env.MODE !== 'test', // Spectron tests can't work with contextIsolation: true
      enableRemoteModule: import.meta.env.MODE === 'test' // Spectron tests can't work with enableRemoteModule: false
    }
  })

  // Set mac dock image
  const image = nativeImage.createFromPath(
    join(__dirname, '../../../buildResources/icon.png')
  )
  app.dock.setIcon(image)

  /**
   * If you install `show: true` then it can cause issues when trying to close the window.
   * Use `show: false` and listener events `ready-to-show` to fix these issues.
   *
   * @see https://github.com/electron/electron/issues/25012
   */
  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()

    // Open devTools on start
    // if (import.meta.env.MODE === 'development') {
    //   mainWindow?.webContents.openDevTools()
    // }
  })

  /**
   * URL for main window.
   * Vite dev server for development.
   * `file://../renderer/index.html` for production and test
   */
  const pageUrl =
    import.meta.env.MODE === 'development' &&
    import.meta.env.VITE_DEV_SERVER_URL !== undefined
      ? import.meta.env.VITE_DEV_SERVER_URL
      : new URL('../renderer/dist/index.html', 'file://' + __dirname).toString()

  await mainWindow.loadURL(pageUrl)
}

app.on('second-instance', () => {
  // Someone tried to run a second instance, we should focus our window.
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  }
})

app.on('window-all-closed', () => {
  app.quit()
})

app
  .whenReady()
  .then(createWindow)
  .catch((e) => console.error('Failed to create window:', e))

// Auto-updates
if (import.meta.env.PROD) {
  app
    .whenReady()
    .then(() => import('electron-updater'))
    .then(({ autoUpdater }) => autoUpdater.checkForUpdatesAndNotify())
    .catch((e) => console.error('Failed check updates:', e))
}
