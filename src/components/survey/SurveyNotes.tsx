import React from 'react'
import { SurveyNote } from '../../types'

type SurveyNotesProps = { note: SurveyNote; onChange: (note: SurveyNote) => void }

export default function SurveyNotes({ note, onChange }: SurveyNotesProps) {
  return (
    <section className="survey-card">
      <div className="survey-card-heading"><span className="material-symbols-rounded" aria-hidden="true">edit_note</span><div><h2>เพิ่มหมายเหตุ</h2><p>บันทึกรายละเอียดที่พบระหว่างสำรวจ</p></div></div>
      <textarea
        className="survey-notes-input"
        value={note.text}
        onChange={(event) => onChange({ ...note, text: event.target.value, updatedAt: new Date().toISOString() })}
        placeholder="บ้านอยู่ติดถนนคอนกรีต ทางเข้าออกสะดวก"
        rows={6}
      />
    </section>
  )
}