import React, { memo } from 'react'
import { motion } from 'framer-motion'

type KPICardProps = {
  total: number
  completed: number
  pending: number
  review: number
  rejected: number
  target: number
}

function KPICard({ total, completed, pending, review, rejected, target }: KPICardProps) {
  const ratio = Math.min(1, total / Math.max(target, 1))
  const circumference = 2 * Math.PI * 44
  const offset = circumference * (1 - ratio)

  return (
    <section className="db-card db-kpi-card">
      <div className="db-kpi-head">
        <div>
          <div className="db-eyebrow">ตัวชี้วัดวันนี้</div>
          <h2>ความคืบหน้า {Math.round(ratio * 100)}%</h2>
        </div>
        <div className="db-kpi-ring-wrap">
          <svg viewBox="0 0 120 120" width="120" height="120">
            <circle cx="60" cy="60" r="44" className="db-kpi-ring-track" />
            <motion.circle
              cx="60"
              cy="60"
              r="44"
              className="db-kpi-ring-progress"
              strokeDasharray={circumference}
              strokeDashoffset={circumference}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <div className="db-kpi-ring-label">{Math.round(ratio * 100)}%</div>
        </div>
      </div>
      <div className="db-kpi-grid">
        <div><span>รายการวันนี้</span><strong>{total}</strong></div>
        <div><span>เสร็จแล้ว</span><strong>{completed}</strong></div>
        <div><span>รอดำเนินการ</span><strong>{pending}</strong></div>
        <div><span>รอทบทวน</span><strong>{review}</strong></div>
        <div><span>ไม่ผ่าน</span><strong>{rejected}</strong></div>
        <div><span>เป้าหมาย</span><strong>{target}</strong></div>
      </div>
    </section>
  )
}

export default memo(KPICard)
