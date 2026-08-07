import React, { memo } from 'react'

type InspectionNotesProps = {
  transcript: string
  note: string
  onNoteChange: (value: string) => void
  onInsert: (text: string) => void
}

const quickItems = [
  'ควรยืนยันข้อมูลทางกฎหมายเพิ่มเติม',
  'ควรถ่ายภาพระยะใกล้บริเวณหลังคาเพิ่ม',
  'ควรยืนยันข้อมูลราคาซื้อขายใกล้เคียง',
  'ควรส่งให้ผู้ประเมินอาวุโสตรวจทาน',
]

function InspectionNotes({ transcript, note, onNoteChange, onInsert }: InspectionNotesProps) {
  return (
    <section className="as-card">
      <h2>บันทึกการตรวจสอบ</h2>
      <div className="as-note-box">
        <span>ถอดเสียงบันทึก</span>
        <p>{transcript}</p>
      </div>
      <textarea value={note} onChange={(event) => onNoteChange(event.target.value)} placeholder="เพิ่มบันทึกการตรวจสอบเพิ่มเติม" />
      <div className="as-chip-row">
        {quickItems.map((item) => <button key={item} type="button" className="as-chip-btn" onClick={() => onInsert(item)}>{item}</button>)}
      </div>
    </section>
  )
}

export default memo(InspectionNotes)
