type ipcWindow = {
  ipcRenderer: ipcRenderer
}

type ipcRenderer = {
  send: (channel: string, data: string) => void
  receive: (
    channel: string,
    func: (event: string, message: string) => void
  ) => void
}

export default ipcWindow
