import React from 'react'
import { SurveyChecklistItem } from '../../types'

export default function SurveyChecklist({ items }: { items: SurveyChecklistItem[] }) {
  const completed = items.filter((item) => item.completed).length
  return (
    <section className="survey-card">
      <div className="survey-card-heading compact"><div><h2>รายการสำรวจ</h2><p>สำรวจแล้ว {completed}/{items.length} รายการ</p></div></div>
      <div className="survey-checklist">
        {items.map((item) => (
          <div key={item.id} className={item.completed ? 'is-complete' : ''}>
            <span className="material-symbols-rounded" aria-hidden="true">{item.completed ? 'check_box' : 'check_box_outline_blank'}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}