import React, { useEffect, useState } from 'react'
import type ipcWindow from '../types/IpcTypes'
import './file-name.css'

const FileName: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [fileName, setFileName] = useState<string>('Untitled file')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [unsaved, setUnsaved] = useState<boolean>(true)

  // File saved
  useEffect(() => {
    ;(window as unknown as ipcWindow).ipcRenderer.receive(
      'document-saved',
      (filePath: string) => {
        setUnsaved(false)
        setFileName(filePath)
      }
    )
  }, [])

  return (
    <div className="file-name-section">
      <p>
        Glassdown - {fileName}
        {unsaved ? '*' : ''}
      </p>
    </div>
  )
}

export default FileName
