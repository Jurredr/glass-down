import React, { useState } from 'react'
import './file-name.css'

const FileName: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [fileName, setFileName] = useState<string>('Untitled file')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [unsaved, setUnsaved] = useState<boolean>(true)

  return (
    <div className="file-name-section">
      <p>{fileName}{unsaved ? '*' : ''}</p>
    </div>
  )
}

export default FileName
