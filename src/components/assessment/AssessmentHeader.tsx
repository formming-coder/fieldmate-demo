import React, { memo } from 'react'
import { motion } from 'framer-motion'

type AssessmentHeaderProps = {
  propertyId: string
  owner: string
  inspectionDate: string
  assessor: string
  gps: string
  weather: string
  aiStatus: string
}

function AssessmentHeader({ propertyId, owner, inspectionDate, assessor, gps, weather, aiStatus }: AssessmentHeaderProps) {
  return (
    <section className="as-card as-header">
      <div>
        <h1>ประเมินทรัพย์สินด้วย AI</h1>
        <p>ระบบช่วยประเมินภาคสนามสำหรับเดโมการใช้งานจริง</p>
      </div>
      <motion.span
        className="as-ai-badge"
        initial={{ scale: 0.92, opacity: 0.4 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ repeat: Infinity, repeatType: 'reverse', duration: 1.1 }}
      >
        {aiStatus}
      </motion.span>
      <div className="as-grid as-header-grid">
        <div><span>รหัสทรัพย์</span><strong>{propertyId}</strong></div>
        <div><span>เจ้าของ</span><strong>{owner}</strong></div>
        <div><span>วันที่ตรวจสอบ</span><strong>{inspectionDate}</strong></div>
        <div><span>ผู้ประเมิน</span><strong>{assessor}</strong></div>
        <div><span>GPS</span><strong>{gps}</strong></div>
        <div><span>สภาพอากาศ</span><strong>{weather}</strong></div>
      </div>
    </section>
  )
}

export default memo(AssessmentHeader)
