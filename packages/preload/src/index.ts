import { contextBridge, ipcRenderer } from 'electron'

const apiKey = 'electron'
/**
 * @see https://github.com/electron/electron/issues/21437#issuecomment-573522360
 */
const api: ElectronApi = {
  versions: process.versions
}

/**
 * If contextIsolated enabled use contextBridge
 * Else use fallback
 *
 * Note: Spectron tests can't work in isolated context
 * @see https://github.com/electron-userland/spectron/issues/693#issuecomment-748482545
 */
if (process.contextIsolated) {
  /**
   * The "Main World" is the JavaScript context that your main renderer code runs in.
   * By default, the page you load in your renderer executes code in this world.
   *
   * @see https://www.electronjs.org/docs/api/context-bridge
   */
  // contextBridge.exposeInMainWorld(apiKey, api);

  contextBridge.exposeInMainWorld('ipcRenderer', {
    send: (channel: string, data: string) => {
      const validChannels = ['document-updated']
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data)
      }
    },
    receive: (channel: string, func: (event: string, message: string) => void) => {
      const validChannels = ['document-saved', 'document-opened', 'document-updated']
      if (validChannels.includes(channel)) {
        ipcRenderer.on(channel, (event, ...args) => func(args[0], args[1]))
      }
    }
  })
} else {
  /**
   * Recursively Object.freeze() on objects and functions
   * @see https://github.com/substack/deep-freeze
   * @param obj Object on which to lock the attributes
   */

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deepFreeze = (obj: any) => {
    if (typeof obj === 'object' && obj !== null) {
      Object.keys(obj).forEach((prop) => {
        const val = obj[prop]
        if (
          (typeof val === 'object' || typeof val === 'function') &&
          !Object.isFrozen(val)
        ) {
          deepFreeze(val)
        }
      })
    }

    return Object.freeze(obj)
  }

  deepFreeze(api)

  window[apiKey] = api

  // Need for Spectron tests
  window.electronRequire = require
}
