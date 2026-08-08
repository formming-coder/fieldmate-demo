import React from 'react'
import { Property, PropertySurvey } from '../../types'

type SurveyReviewProps = { property: Property; survey: PropertySurvey; completion: number }

export default function SurveyReview({ property, survey, completion }: SurveyReviewProps) {
  const checked = survey.checklist.filter((item) => item.completed).length
  return (
    <div className="survey-review-stack">
      <section className="survey-review-score"><span>ความสมบูรณ์ของแบบสำรวจ</span><strong>{completion}%</strong><div><i style={{ width: `${completion}%` }} /></div></section>
      <section className="survey-card survey-review-grid">
        <div><span className="material-symbols-rounded" aria-hidden="true">photo_library</span><small>รูปภาพ</small><strong>{survey.photos.length} รูป</strong></div>
        <div><span className="material-symbols-rounded" aria-hidden="true">my_location</span><small>GPS</small><strong>{survey.location?.confirmed ? 'ยืนยันแล้ว' : 'ยังไม่ยืนยัน'}</strong></div>
        <div><span className="material-symbols-rounded" aria-hidden="true">checklist</span><small>รายการสำรวจ</small><strong>{checked}/{survey.checklist.length}</strong></div>
        <div><span className="material-symbols-rounded" aria-hidden="true">notes</span><small>หมายเหตุ</small><strong>{survey.note.text ? 'เพิ่มแล้ว' : 'ยังไม่มี'}</strong></div>
      </section>
      <section className="survey-card">
        <div className="survey-card-heading compact"><div><h2>ข้อมูลทรัพย์</h2><p>{property.id}</p></div></div>
        <div className="survey-data-list">
          <div><span>ชื่อทรัพย์</span><strong>{property.owner}</strong></div>
          <div><span>ประเภททรัพย์</span><strong>{property.type || 'ทรัพย์สิน'}</strong></div>
          <div><span>จังหวัด</span><strong>{property.province}</strong></div>
          <div><span>ราคาประกาศ</span><strong>{property.marketPrice.toLocaleString('th-TH')} บาท</strong></div>
        </div>
      </section>
      {survey.note.text ? <section className="survey-card"><h2>หมายเหตุ</h2><p className="survey-review-note">{survey.note.text}</p></section> : null}
    </div>
  )
}