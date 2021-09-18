import React, { useState, useCallback, useEffect } from 'react'
import Editor from './component/editor'
import Preview from './component/preview'
import './app.css'
import FileName from './component/file-name'
import type ipcWindow from './types/IpcTypes'

const App: React.FC = () => {
  const [doc, setDoc] = useState<string>('# Hello, World!\n')
  const [currentSavedDoc, setCurrentSavedDoc] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('Untitled file')
  const [saved, setSaved] = useState<boolean>(false)

  const handleDocChange = useCallback(
    (newDoc: string) => {
      if (currentSavedDoc !== newDoc) {
        setSaved(false)
        setDoc(newDoc)
      }
    },
    [currentSavedDoc]
  )

  // Document saved
  useEffect(() => {
    ;(window as unknown as ipcWindow).ipcRenderer.receive(
      'document-saved',
      (filePath: string) => {
        setCurrentSavedDoc(doc)
        setFileName(filePath)
        setSaved(true)
      }
    )
  }, [])

  // Document opened
  useEffect(() => {
    ;(window as unknown as ipcWindow).ipcRenderer.receive(
      'document-opened',
      (filePath: string, content: string) => {
        setFileName(filePath)
        setDoc(content)
        setCurrentSavedDoc(content)
        setSaved(true)
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
