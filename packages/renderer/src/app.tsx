import React, { useState, useCallback } from 'react'
import Editor from './component/editor'
import Preview from './component/preview'
import './app.css'
import FileName from './component/file-name'

const App: React.FC = () => {
  const [doc, setDoc] = useState<string>('# Hello, World!\n')

  const handleDocChange = useCallback((newDoc) => {
    setDoc(newDoc)
  }, [])

  return (
    <div className="app">
      <FileName />
      <div className="app-content">
        <Editor onChange={handleDocChange} initialDoc={doc} />
        <Preview doc={doc} />
      </div>
    </div>
  )
}

export default App
