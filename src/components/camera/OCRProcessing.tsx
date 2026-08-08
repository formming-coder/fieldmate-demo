import React from 'react'

const stages = ['กำลังเตรียมภาพ', 'กำลังอ่านข้อมูล', 'กำลังวิเคราะห์', 'กำลังตรวจสอบผลลัพธ์']

export default function OCRProcessing({ stage }: { stage: number }) {
  return (
    <section className="survey-ai-processing" role="status" aria-live="polite">
      <div className="survey-ai-processing-icon"><span className="material-symbols-rounded" aria-hidden="true">document_scanner</span><i /></div>
      <h1>กำลังวิเคราะห์ภาพ...</h1>
      <div className="survey-ai-stage-list">{stages.map((label, index) => <div key={label} className={index < stage ? 'done' : index === stage ? 'active' : ''}><span className="material-symbols-rounded" aria-hidden="true">{index < stage ? 'check_circle' : 'radio_button_unchecked'}</span>{label}</div>)}</div>
    </section>
  )
}