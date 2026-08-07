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
        <h1>AI Property Assessment</h1>
        <p>Premium valuation intelligence for field operations</p>
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
        <div><span>Property ID</span><strong>{propertyId}</strong></div>
        <div><span>Owner</span><strong>{owner}</strong></div>
        <div><span>Inspection Date</span><strong>{inspectionDate}</strong></div>
        <div><span>Assessor</span><strong>{assessor}</strong></div>
        <div><span>GPS</span><strong>{gps}</strong></div>
        <div><span>Weather</span><strong>{weather}</strong></div>
      </div>
    </section>
  )
}

export default memo(AssessmentHeader)
