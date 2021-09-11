import type { MenuItemConstructorOptions } from 'electron'
import { dialog } from 'electron'
import { app, BrowserWindow, Menu, nativeImage, shell } from 'electron'
import * as path from 'path'
import { URL } from 'url'
import fs from 'fs'

const isSingleInstance = app.requestSingleInstanceLock()
const isMac = process.platform === 'darwin'
let currentSaveDir: string | null = null

if (!isSingleInstance) {
  app.quit()
  process.exit(0)
}

// Disable hardware acceleration
app.disableHardwareAcceleration()

let mainWindow: BrowserWindow | null = null

const createWindow = async () => {
  const iconPath = isMac
    ? path.join(__dirname, '../../../buildResources/icon.icns')
    : path.join(__dirname, '../../../buildResources/icon.png')

  mainWindow = new BrowserWindow({
    show: false, // Use 'ready-to-show' event to show window
    vibrancy: 'under-window',
    visualEffectState: 'active',
    titleBarStyle: 'hiddenInset',
    frame: false,
    transparent: true,
    roundedCorners: true,
    icon: iconPath,
    webPreferences: {
      nativeWindowOpen: true,
      preload: path.join(__dirname, '../../preload/dist/index.cjs'),
      contextIsolation: import.meta.env.MODE !== 'test', // Spectron tests can't work with contextIsolation: true
      enableRemoteModule: import.meta.env.MODE === 'test' // Spectron tests can't work with enableRemoteModule: false
    }
  })

  // Set menu
  const menuTemplate: Electron.MenuItemConstructorOptions[] = [
    ...((isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' },
              { type: 'separator' },
              {
                label: 'Preferences',
                accelerator: 'CmdOrCtrl+,',
                click: () => console.log('test')
              },
              { type: 'separator' },
              { role: 'services' },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideOthers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit' }
            ]
          }
        ]
      : []) as MenuItemConstructorOptions[]),
    {
      label: 'File',
      submenu: [
        {
          label: 'New File',
          accelerator: 'CmdOrCtrl+N',
          click: () => console.log('test')
        },
        {
          label: 'New Window',
          accelerator: 'CmdOrCtrl+Shift+N',
          click: () => console.log('test')
        },
        {
          type: 'separator'
        },
        {
          label: 'Open',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            if (mainWindow) {
              dialog.showOpenDialog(mainWindow, {}).then(({ filePaths }) => {
                const filePath = filePaths[0]
                fs.readFile(filePath, 'utf8', (error, content) => {
                  if (error) {
                    console.log(error)
                  } else {
                    currentSaveDir = filePath
                    mainWindow?.webContents.send(
                      'document-opened',
                      filePath,
                      content
                    )
                  }
                })
              })
            }
          }
        },
        {
          label: 'Open Recent',
          role: 'recentdocuments',
          submenu: [
            {
              label: 'Clear Recent',
              role: 'clearrecentdocuments'
            }
          ]
        },
        {
          type: 'separator'
        },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            if (mainWindow) {
              if (currentSaveDir) {
                fs.writeFile(currentSaveDir, '', (error) => {
                  if (error) {
                    console.log(error)
                  } else {
                    mainWindow?.webContents.send(
                      'document-saved',
                      currentSaveDir
                    )
                  }
                })
              } else {
                dialog
                  .showSaveDialog(mainWindow, {
                    filters: [{ name: 'Markdown files', extensions: ['md'] }]
                  })
                  .then(({ filePath }) => {
                    if (filePath) {
                      currentSaveDir = filePath
                      fs.writeFile(filePath, '', (error) => {
                        if (error) {
                          console.log(error)
                        } else {
                          mainWindow?.webContents.send(
                            'document-saved',
                            filePath
                          )
                        }
                      })
                    }
                  })
              }
            }
          }
        },
        {
          label: 'Save As',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => {
            if (mainWindow) {
              dialog
                .showSaveDialog(mainWindow, {
                  filters: [{ name: 'Markdown files', extensions: ['md'] }]
                })
                .then(({ filePath }) => {
                  if (filePath) {
                    currentSaveDir = filePath
                    fs.writeFile(filePath, '', (error) => {
                      if (error) {
                        console.log(error)
                      } else {
                        mainWindow?.webContents.send('document-saved', filePath)
                      }
                    })
                  }
                })
            }
          }
        }
      ] as MenuItemConstructorOptions[]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...((isMac
          ? [
              { role: 'pasteAndMatchStyle' },
              { role: 'delete' },
              { role: 'selectAll' },
              { type: 'separator' },
              {
                label: 'Speech',
                submenu: [{ role: 'startSpeaking' }, { role: 'stopSpeaking' }]
              }
            ]
          : [
              { role: 'delete' },
              { type: 'separator' },
              { role: 'selectAll' }
            ]) as MenuItemConstructorOptions[])
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...((isMac
          ? [
              { type: 'separator' },
              { role: 'front' },
              { type: 'separator' },
              { role: 'window' }
            ]
          : [{ role: 'close' }]) as MenuItemConstructorOptions[])
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: "Glassdown's GitHub page",
          click: async () => {
            await shell.openExternal('https://github.com/Jurredr/glass-down')
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)

  // Set mac dock image
  const image = nativeImage.createFromPath(
    path.join(__dirname, '../../../buildResources/icon.png')
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
