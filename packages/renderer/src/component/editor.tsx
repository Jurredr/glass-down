import React, { useEffect } from 'react'
import useCodeMirror from '../util/use-codemirror'
import './editor.css'
import type { EditorView } from '@codemirror/view'

interface Props {
  initialDoc: string
  onChange: (doc: string, editorView: EditorView | undefined) => void
}

const Editor: React.FC<Props> = (props) => {
  // console.log('remounted with initial doc being: \n\n' + props.initialDoc)
  const { onChange, initialDoc } = props
  const [refContainer, editorView] = useCodeMirror<HTMLDivElement>({
    initialDoc: initialDoc,
    onChange: (state) => onChange(state.doc.toString(), editorView)
  })

  useEffect(() => {
    onChange(initialDoc, editorView)
  }, [initialDoc])

  return <div className="editor-wrapper" ref={refContainer} />
}

export default Editor
