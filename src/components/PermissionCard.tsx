import React from 'react'
import { motion } from 'framer-motion'
import { Button, Card } from './ui'

export type PermissionState = 'idle' | 'granted' | 'skipped' | 'blocked'

export default function PermissionCard({
  icon,
  title,
  description,
  status,
  onAllow,
  onSkip,
}: {
  icon: React.ReactNode
  title: string
  description: string
  status: PermissionState
  onAllow: () => void
  onSkip: () => void
}) {
  const statusText = status === 'granted' ? 'อนุญาตแล้ว' : status === 'skipped' ? 'ข้ามไว้ก่อน' : status === 'blocked' ? 'ถูกปฏิเสธ' : 'รอการตัดสินใจ'
  const isFinal = status === 'granted' || status === 'blocked' || status === 'skipped'

  return (
    <Card elevated glass style={{ display: 'grid', gap: 14, padding: 20, borderRadius: 24 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <motion.div className="entry-permission-icon" animate={{ scale: isFinal ? 1 : [1, 1.04, 1] }} transition={{ duration: 1.2, repeat: isFinal ? 0 : Infinity, ease: 'easeInOut' }}>
          {icon}
        </motion.div>
        <div style={{ flex: 1 }}>
          <div className="entry-permission-title">{title}</div>
          <div className="entry-permission-description">{description}</div>
        </div>
      </div>
      <div className={`entry-permission-status entry-permission-status-${status}`}>{statusText}</div>
      <div className="entry-permission-actions">
        <Button type="button" fullWidth onClick={onAllow}>อนุญาต</Button>
        <Button type="button" variant="ghost" fullWidth onClick={onSkip} style={{ border: '1px solid var(--border)', background: 'rgba(255,255,255,0.6)' }}>ข้าม</Button>
      </div>
    </Card>
  )
}