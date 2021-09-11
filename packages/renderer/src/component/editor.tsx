import React, { useCallback } from 'react'
import useCodeMirror from '../util/use-codemirror'
import './editor.css'

interface Props {
  initialDoc: string
  onChange: (doc: string) => void
}

const Editor: React.FC<Props> = (props) => {
  const { onChange, initialDoc } = props
  const handleChange = useCallback(
    (state) => onChange(state.doc.toString()),
    [onChange]
  )
  const [refContainer] = useCodeMirror<HTMLDivElement>({
    initialDoc: initialDoc,
    onChange: handleChange
  })

  return <div className="editor-wrapper" ref={refContainer} />
}

export default Editor
