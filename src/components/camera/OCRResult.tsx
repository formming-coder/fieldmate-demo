import React, { useState } from 'react'
import { OCRField, OCRResult as OCRResultType } from '../../types'
import OCRFieldEditor from './OCRFieldEditor'

type OCRResultProps = {
  result: OCRResultType
  onChange: (result: OCRResultType) => void
  onSave: () => void
  onRetake: () => void
}

export default function OCRResult({ result, onChange, onSave, onRetake }: OCRResultProps) {
  const [editing, setEditing] = useState(false)
  const updateField = (next: OCRField) => onChange({ ...result, fields: result.fields.map((field) => field.id === next.id ? next : field) })
  return (
    <section className="survey-ai-result">
      <div className="survey-ai-result-heading"><div><h1>ผลการอ่านข้อมูลจากภาพ</h1><p>ความมั่นใจ {Math.round(result.confidence * 100)}%</p></div><span className="material-symbols-rounded" aria-hidden="true">fact_check</span></div>
      <div className="survey-ai-result-fields">{result.fields.map((field) => <OCRFieldEditor key={field.id} field={field} editing={editing} onChange={updateField} />)}</div>
      <label className="survey-ai-full-text"><span>ข้อความบนป้าย</span>{editing ? <textarea rows={4} value={result.fullText} onChange={(event) => onChange({ ...result, fullText: event.target.value })} /> : <p>{result.fullText}</p>}</label>
      <div className="survey-ai-result-actions"><button type="button" onClick={onRetake}>ถ่ายใหม่</button><button type="button" onClick={() => setEditing((current) => !current)}>{editing ? 'เสร็จสิ้น' : 'แก้ไข'}</button><button type="button" className="primary" onClick={onSave}>บันทึกข้อมูล</button></div>
    </section>
  )
}