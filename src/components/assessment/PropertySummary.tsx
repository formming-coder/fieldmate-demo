import React from 'react'
import { Property, PropertySurvey } from '../../types'

export default function PropertySummary({ property, survey }: { property: Property; survey: PropertySurvey }) {
  return (
    <section className="as-card">
      <h2>สรุปข้อมูลทรัพย์</h2>
      <div className="as-grid">
        <div><span>ประเภททรัพย์</span><strong>{property.type || 'ทรัพย์สิน'}</strong></div>
        <div><span>ที่ตั้ง</span><strong>{property.province}</strong></div>
        <div><span>พื้นที่ดิน</span><strong>120 ตร.ว.</strong></div>
        <div><span>พื้นที่ใช้สอย</span><strong>220 ตร.ม.</strong></div>
        <div><span>ราคาประกาศ</span><strong>{property.marketPrice.toLocaleString('th-TH')} บาท</strong></div>
        <div><span>อายุทรัพย์</span><strong>8 ปี</strong></div>
        <div><span>สภาพทรัพย์</span><strong>{survey.note.text ? 'มีข้อมูลตรวจสอบ' : 'รอตรวจสอบเพิ่มเติม'}</strong></div>
        <div><span>GPS</span><strong>{survey.location ? `${survey.location.latitude.toFixed(5)}, ${survey.location.longitude.toFixed(5)}` : 'ไม่มีข้อมูล'}</strong></div>
      </div>
    </section>
  )
}