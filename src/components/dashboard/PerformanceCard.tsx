import React, { memo, useMemo } from 'react'
import { motion } from 'framer-motion'

type PerformanceCardProps = {
  values: number[]
  weeklyScore?: number
  monthlyScore?: number
  completedJobs?: number
  averageTime?: string
  travelDistance?: string
  accuracy?: string
}

function PerformanceCard({ values, weeklyScore = 92, monthlyScore = 89, completedJobs = 34, averageTime = '34 นาที', travelDistance = '126 กม.', accuracy = '96%' }: PerformanceCardProps) {
  const points = useMemo(() => {
    const width = 280
    const height = 88
    const max = Math.max(...values, 1)
    const step = width / Math.max(values.length - 1, 1)
    return values
      .map((value, index) => {
        const x = index * step
        const y = height - (value / max) * height
        return `${x},${y}`
      })
      .join(' ')
  }, [values])

  return (
    <section className="dashboard-card performance-card">
      <div className="performance-head">
        <div>
          <div className="dashboard-eyebrow">ประสิทธิภาพ</div>
          <h3>คะแนนรายสัปดาห์และรายเดือน</h3>
        </div>
        <div className="performance-badge">{weeklyScore}%</div>
      </div>
      <div className="chart-wrap" aria-label="กราฟความคืบหน้ารายสัปดาห์">
        <svg viewBox="0 0 280 96" width="100%" height="96" preserveAspectRatio="none">
          <polyline points={points} className="chart-line-bg" />
          <motion.polyline
            points={points}
            className="chart-line"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
            style={{ pathLength: 1 }}
          />
        </svg>
      </div>
      <div className="performance-metrics-grid">
        <div><span>คะแนนรายสัปดาห์</span><strong>{weeklyScore}%</strong></div>
        <div><span>คะแนนรายเดือน</span><strong>{monthlyScore}%</strong></div>
        <div><span>งานที่เสร็จแล้ว</span><strong>{completedJobs}</strong></div>
        <div><span>เวลาเฉลี่ย</span><strong>{averageTime}</strong></div>
        <div><span>ระยะทางเดินทาง</span><strong>{travelDistance}</strong></div>
        <div><span>ความแม่นยำ</span><strong>{accuracy}</strong></div>
      </div>
    </section>
  )
}

export default memo(PerformanceCard)
