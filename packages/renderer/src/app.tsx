import React, { useState, useEffect } from 'react'
import Editor from './component/editor'
import Preview from './component/preview'
import './app.css'
import FileName from './component/file-name'
import type ipcWindow from '../../../types/IpcTypes'

const App: React.FC = () => {
  const [doc, setDoc] = useState<string>('# Hello, World!\n')
  const [currentSavedDoc, setCurrentSavedDoc] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('Untitled file')
  const [saved, setSaved] = useState<boolean>(false)
  const [updateSaveDoc, setUpdateSaveDoc] = useState<boolean>(false)

  useEffect(() => {
    if (updateSaveDoc) {
      setCurrentSavedDoc(doc)
      setUpdateSaveDoc(false)
    }
  }, [saved, doc, updateSaveDoc])

  useEffect(() => {
    if (currentSavedDoc !== doc) {
      setSaved(false)
    } else {
      setSaved(true)
    }
  }, [currentSavedDoc, doc])

  const handleDocChange = (newDoc: string) => {
    if (currentSavedDoc !== newDoc) {
      setDoc(newDoc)
      ;(window as unknown as ipcWindow).ipcRenderer.send(
        'document-updated',
        newDoc
      )
    }
  }

  // Document saved
  useEffect(() => {
    ;(window as unknown as ipcWindow).ipcRenderer.receive(
      'document-saved',
      (filePath: string) => {
        setFileName(filePath)
        setSaved(true)
        setUpdateSaveDoc(true)
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
