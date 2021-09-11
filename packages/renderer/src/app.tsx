import React, { useState, useCallback, useEffect } from 'react'
import Editor from './component/editor'
import Preview from './component/preview'
import './app.css'
import FileName from './component/file-name'
import type ipcWindow from './types/IpcTypes'

const App: React.FC = () => {
  const [doc, setDoc] = useState<string>('# Hello, World!\n')
  const [fileName, setFileName] = useState<string>('Untitled file')
  const [saved, setSaved] = useState<boolean>(false)

  const handleDocChange = useCallback((newDoc) => {
    if (newDoc !== doc) {
      setSaved(false)
      setDoc(newDoc)
    }
  }, [])

  // Document saved
  useEffect(() => {
    ;(window as unknown as ipcWindow).ipcRenderer.receive(
      'document-saved',
      (filePath: string) => {
        setSaved(true)
        setFileName(filePath)
      }
    )
  }, [])

  // Document opened
  useEffect(() => {
    ;(window as unknown as ipcWindow).ipcRenderer.receive(
      'document-opened',
      (filePath: string, content: string) => {
        setSaved(true)
        setFileName(filePath)
        setDoc(content)
      }
    )
  }, [])

  return (
    <div className="app">
      <FileName saved={saved} fileName={fileName} />
      <div className="app-content">
        <Editor onChange={handleDocChange} initialDoc={doc} />
        <Preview doc={doc} />
      </div>
    </div>
  )
}

export default App
