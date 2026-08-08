import React from 'react'
import { ListingPropertyType } from '../../types'

const propertyTypes: Array<{ type: ListingPropertyType; icon: string }> = [
  { type: 'ที่ดิน', icon: 'landscape' },
  { type: 'บ้านเดี่ยว', icon: 'home' },
  { type: 'บ้านแฝด', icon: 'house' },
  { type: 'ทาวน์เฮ้าส์', icon: 'holiday_village' },
  { type: 'ตึกแถว', icon: 'apartment' },
]

type PropertyTypeSelectorProps = {
  onSelect: (propertyType: ListingPropertyType) => void
  onBack: () => void
}

export default function PropertyTypeSelector({ onSelect, onBack }: PropertyTypeSelectorProps) {
  return (
    <section className="listing-type-page">
      <header className="listing-header">
        <button type="button" onClick={onBack} aria-label="ย้อนกลับ"><span className="material-symbols-rounded">arrow_back</span></button>
        <div><h1>เลือกประเภททรัพย์</h1><p>เลือกประเภทเพื่อเปิดแบบฟอร์มที่ตรงกับทรัพย์</p></div>
      </header>
      <div className="listing-type-grid">
        {propertyTypes.map((item) => (
          <button key={item.type} type="button" onClick={() => onSelect(item.type)}>
            <span className="material-symbols-rounded" aria-hidden="true">{item.icon}</span>
            <strong>{item.type}</strong>
            <small>กรอกข้อมูลประกาศขาย</small>
          </button>
        ))}
      </div>
    </section>
  )
}
