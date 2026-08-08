import React, { memo } from 'react'

type AssessmentHeaderProps = {
  propertyId: string
  type: string
  location: string
  surveyDate: string
  status: string
  offline: boolean
  onBack: () => void
}

function AssessmentHeader({ propertyId, type, location, surveyDate, status, offline, onBack }: AssessmentHeaderProps) {
  return (
    <header className="aa-header">
      <div className="aa-header-top"><button type="button" aria-label="ย้อนกลับ" onClick={onBack}><span className="material-symbols-rounded">arrow_back</span></button><div><h1>AI ประเมินทรัพย์</h1><p>{propertyId}</p></div><span>{status}</span></div>
      {offline ? <div className="aa-offline"><span className="material-symbols-rounded">cloud_off</span>กำลังทำงานแบบออฟไลน์</div> : null}
      <div className="aa-header-grid">
        <div><span>รหัสทรัพย์</span><strong>{propertyId}</strong></div>
        <div><span>ประเภททรัพย์</span><strong>{type}</strong></div>
        <div><span>ตำแหน่ง</span><strong>{location}</strong></div>
        <div><span>วันที่สำรวจ</span><strong>{surveyDate}</strong></div>
      </div>
    </header>
  )
}

export default memo(AssessmentHeader)
