import React from 'react'
import useCodeMirror from '../util/use-codemirror'
import './editor.css'

interface Props {
  initialDoc: string
  onChange: (doc: string) => void
}

const Editor: React.FC<Props> = (props) => {
  const { onChange, initialDoc } = props
  const [refContainer] = useCodeMirror<HTMLDivElement>({
    initialDoc: initialDoc,
    onChange: (state) => onChange(state.doc.toString())
  })

  return <div className="editor-wrapper" ref={refContainer} />
}

export default Editor
