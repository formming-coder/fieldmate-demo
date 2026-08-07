import React, { memo } from 'react'

export type AnnotationTool = 'draw' | 'arrow' | 'circle' | 'rectangle' | 'text' | 'number'

type AnnotationToolsProps = {
  active: AnnotationTool
  onChange: (tool: AnnotationTool) => void
}

const tools: AnnotationTool[] = ['draw', 'arrow', 'circle', 'rectangle', 'text', 'number']

function AnnotationTools({ active, onChange }: AnnotationToolsProps) {
  return (
    <div className="cam-annotation-tools">
      {tools.map((tool) => (
        <button key={tool} type="button" className={active === tool ? 'is-active' : ''} onClick={() => onChange(tool)}>
          {tool}
        </button>
      ))}
    </div>
  )
}

export default memo(AnnotationTools)
