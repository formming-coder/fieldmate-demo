import React, { useState } from 'react'
import { OCRField, OCRResult } from '../../types'

export default function OCRSummary({ results, onChange }: { results: OCRResult[]; onChange: (results: OCRResult[]) => void }) {
  const [editing, setEditing] = useState(false)
  const result = results[0]
  const update = (next: OCRField) => result && onChange([{ ...result, fields: result.fields.map((field) => field.id === next.id ? next : field) }, ...results.slice(1)])
  return (
    <section className="as-card">
      <div className="aa-section-heading"><div><h2>ข้อมูล OCR</h2><p>{result ? `ความมั่นใจ ${Math.round(result.confidence * 100)}%` : 'ยังไม่มีข้อมูล OCR'}</p></div>{result ? <button type="button" onClick={() => setEditing((current) => !current)}>{editing ? 'เสร็จสิ้น' : 'แก้ไข'}</button> : null}</div>
      {result ? <div className="aa-ocr-grid">{result.fields.map((field) => <label key={field.id}><span>{field.label}</span>{editing ? <input value={field.value} onChange={(event) => update({ ...field, value: event.target.value })} /> : <strong>{field.value}</strong>}</label>)}</div> : <div className="aa-empty">ถ่ายภาพป้ายประกาศด้วยกล้อง AI เพื่อเพิ่มข้อมูล</div>}
    </section>
  )
}