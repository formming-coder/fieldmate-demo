import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import EntryShell from '../components/EntryShell'
import PermissionCard, { PermissionState } from '../components/PermissionCard'
import { Button } from '../components/ui'

type PermissionMap = {
  location: PermissionState
  camera: PermissionState
  notification: PermissionState
}

function PermissionGlyph({ kind }: { kind: 'location' | 'camera' | 'notification' }) {
  if (kind === 'location') {
    return (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden="true">
        <path d="M12 21c4-4.8 6-7.9 6-11a6 6 0 1 0-12 0c0 3.1 2 6.2 6 11Z" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="12" cy="10" r="2.2" fill="currentColor" />
      </svg>
    )
  }

  if (kind === 'camera') {
    return (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden="true">
        <rect x="3.8" y="7" width="16.4" height="12" rx="3" stroke="currentColor" strokeWidth="1.7" />
        <path d="M8.6 7 10 5.1h4L15.4 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden="true">
      <path d="M12 4a6.6 6.6 0 0 1 6.6 6.6V14l1.2 2.2a1 1 0 0 1-.9 1.5H5.1a1 1 0 0 1-.9-1.5L5.4 14v-3.4A6.6 6.6 0 0 1 12 4Z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9.5 18a2.5 2.5 0 0 0 5 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

export default function Permission({ onComplete }: { onComplete: () => void }) {
  const navigate = useNavigate()
  const [permissions, setPermissions] = useState<PermissionMap>({
    location: 'idle',
    camera: 'idle',
    notification: 'idle',
  })

  const allHandled = useMemo(() => Object.values(permissions).every((status) => status !== 'idle'), [permissions])

  const setPermissionState = (key: keyof PermissionMap, value: PermissionState) => {
    setPermissions((current) => ({ ...current, [key]: value }))
  }

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setPermissionState('location', 'blocked')
      return
    }
    navigator.geolocation.getCurrentPosition(
      () => setPermissionState('location', 'granted'),
      () => setPermissionState('location', 'blocked')
    )
  }

  const requestCamera = async () => {
    try {
      const stream = await navigator.mediaDevices?.getUserMedia?.({ video: true })
      stream?.getTracks().forEach((track) => track.stop())
      setPermissionState('camera', 'granted')
    } catch {
      setPermissionState('camera', 'blocked')
    }
  }

  const requestNotification = async () => {
    try {
      const result = await Notification.requestPermission()
      setPermissionState('notification', result === 'granted' ? 'granted' : 'blocked')
    } catch {
      setPermissionState('notification', 'blocked')
    }
  }

  const handleContinue = () => {
    onComplete()
    navigate('/map')
  }

  return (
    <EntryShell>
      <div className="entry-screen">
        <motion.div
          className="entry-brand-block entry-brand-block-compact"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 26 }}
        >
          <div className="entry-permission-kicker">สิทธิ์การใช้งาน</div>
          <div className="entry-title">อนุญาตการใช้งาน</div>
          <div className="entry-subtitle">ฟีลด์เมต AI ต้องใช้สิทธิ์ต่อไปนี้เพื่อรองรับการสำรวจภาคสนามและการบันทึกทรัพย์สิน</div>
        </motion.div>

        <motion.div
          className="entry-permission-stack"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.08 } },
          }}
        >
          <motion.div variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}>
            <PermissionCard icon={<PermissionGlyph kind="location" />} title="ตำแหน่ง" description="อนุญาต GPS เพื่อใช้งานแผนที่และบันทึกทรัพย์สิน" status={permissions.location} onAllow={requestLocation} onSkip={() => setPermissionState('location', 'skipped')} />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}>
            <PermissionCard icon={<PermissionGlyph kind="camera" />} title="กล้อง" description="อนุญาตกล้อง เพื่อถ่ายภาพทรัพย์สิน" status={permissions.camera} onAllow={requestCamera} onSkip={() => setPermissionState('camera', 'skipped')} />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}>
            <PermissionCard icon={<PermissionGlyph kind="notification" />} title="การแจ้งเตือน" description="อนุญาตการแจ้งเตือน เพื่อรับอัปเดตทรัพย์สินใกล้เคียง" status={permissions.notification} onAllow={requestNotification} onSkip={() => setPermissionState('notification', 'skipped')} />
          </motion.div>
        </motion.div>

        <div className="entry-permission-progress" role="status" aria-live="polite">
          <span>{Object.values(permissions).filter((state) => state !== 'idle').length}/3 รายการกำหนดแล้ว</span>
        </div>

        <div className="entry-permission-footer">
          <Button fullWidth onClick={handleContinue} disabled={!allHandled}>เข้าสู่หน้าหลัก</Button>
        </div>
      </div>
    </EntryShell>
  )
}