import React from 'react'
import { OCRField } from '../../types'

type OCRFieldEditorProps = { field: OCRField; editing: boolean; onChange: (field: OCRField) => void }

export default function OCRFieldEditor({ field, editing, onChange }: OCRFieldEditorProps) {
  return (
    <label className="survey-ai-ocr-field">
      <span>{field.label}<small>ความมั่นใจ {Math.round(field.confidence * 100)}%</small></span>
      {editing ? <input value={field.value} onChange={(event) => onChange({ ...field, value: event.target.value })} /> : <strong>{field.value || '-'}</strong>}
    </label>
  )
}