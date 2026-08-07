import React, { memo } from 'react'
import { motion } from 'framer-motion'

type QuickActionsProps = {
  onSelect: (path: string) => void
}

const items = [
  { icon: '🗺', title: 'แผนที่อัจฉริยะ', subtitle: 'สำรวจพื้นที่', path: '/map' },
  { icon: '📷', title: 'กล้อง AI', subtitle: 'ถ่ายภาพทรัพย์', path: '/camera' },
  { icon: '🤖', title: 'สรุป AI', subtitle: 'สรุปข้อมูล', path: '/ai-summary' },
  { icon: '📚', title: 'ข้อมูลกลาง', subtitle: 'แชร์องค์ความรู้', path: '/shared-intelligence' },
]

function QuickActions({ onSelect }: QuickActionsProps) {
  return (
    <section className="dashboard-section">
      <h2 className="dashboard-section-title">เมนูด่วน</h2>
      <div className="quick-actions-grid">
        {items.map((item, index) => (
          <motion.button
            key={item.title}
            type="button"
            className="quick-action-card"
            onClick={() => onSelect(item.path)}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="quick-action-icon">{item.icon}</div>
            <div className="quick-action-title">{item.title}</div>
            <div className="quick-action-subtitle">{item.subtitle}</div>
          </motion.button>
        ))}
      </div>
    </section>
  )
}

export default memo(QuickActions)