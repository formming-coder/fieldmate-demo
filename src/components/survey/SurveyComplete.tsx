import React from 'react'
import { Property, PropertySurvey } from '../../types'

type SurveyCompleteProps = {
  property: Property
  survey: PropertySurvey
  onProperty: () => void
  onCamera: () => void
  onAssessment: () => void
  onMap: () => void
}

export default function SurveyComplete({ property, survey, onProperty, onCamera, onAssessment, onMap }: SurveyCompleteProps) {
  const completedAt = new Date(survey.completedAt || Date.now())
  return (
    <section className="survey-complete">
      <div className="survey-complete-mark"><span className="material-symbols-rounded" aria-hidden="true">task_alt</span></div>
      <h1>สำรวจทรัพย์เรียบร้อย</h1><p>{property.owner}</p>
      <div className="survey-card survey-data-list">
        <div><span>วันที่</span><strong>{completedAt.toLocaleDateString('th-TH')}</strong></div>
        <div><span>เวลา</span><strong>{completedAt.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</strong></div>
        <div><span>GPS</span><strong>{survey.location ? `${survey.location.latitude.toFixed(5)}, ${survey.location.longitude.toFixed(5)}` : '-'}</strong></div>
        <div><span>จำนวนรูป</span><strong>{survey.photos.length} รูป</strong></div>
        <div><span>สถานะแบบสำรวจ</span><strong>เสร็จสิ้น</strong></div>
      </div>
      <div className="survey-complete-actions">
        <button type="button" onClick={onProperty}>ดูข้อมูลทรัพย์</button>
        <button type="button" onClick={onCamera}>เปิดกล้อง AI</button>
        <button type="button" onClick={onAssessment}>เริ่มประเมิน</button>
        <button type="button" className="primary" onClick={onMap}>กลับแผนที่</button>
      </div>
    </section>
  )
}