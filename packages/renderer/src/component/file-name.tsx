import React from 'react'
import './file-name.css'

interface Props {
  saved: boolean
  fileName: string
}

const FileName: React.FC<Props> = (props) => {
  return (
    <div className="file-name-section">
      <p>
        Glassdown - {props.fileName}
        {props.saved ? '' : '*'}
      </p>
    </div>
  )
}

export default FileName
