import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import BrandMark from '../components/BrandMark'
import EntryShell from '../components/EntryShell'
import { Button } from '../components/ui'

const features = [
  {
    icon: '🗺',
    title: 'แผนที่อัจฉริยะ',
    description: 'สำรวจบริบททรัพย์สิน ชั้นข้อมูล และข้อมูลใกล้เคียงได้ในเวิร์กโฟลว์แผนที่บนมือถือเดียวกัน',
  },
  {
    icon: '📷',
    title: 'กล้อง AI',
    description: 'บันทึกหลักฐานภาคสนามพร้อมโอเวอร์เลย์ OCR และข้อมูลประกอบที่พร้อมใช้งานในการตรวจสอบ',
  },
  {
    icon: '🧠',
    title: 'ข้อมูลส่วนกลาง',
    description: 'เปลี่ยนทุกการลงพื้นที่ให้กลายเป็นองค์ความรู้ที่นำกลับมาใช้ซ้ำได้ทั้งองค์กร',
  },
] as const

export default function Welcome() {
  const navigate = useNavigate()
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2200)
    return () => window.clearTimeout(timer)
  }, [toast])

  return (
    <EntryShell>
      <div className="welcome-screen">
        <motion.section
          className="welcome-hero"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 210, damping: 24 }}
        >
          <BrandMark size="large" animated />
          <div className="welcome-copy">
            <div className="welcome-kicker">ฟีลด์เมต AI</div>
            <h1>แพลตฟอร์มอัจฉริยะสำหรับงานสำรวจและประเมินทรัพย์สินยุคใหม่</h1>
            <p>วางแผน ถ่ายภาพ วิเคราะห์ และแชร์ข้อมูลทรัพย์สินได้ครบในเวิร์กโฟลว์เดียวบนมือถือ</p>
          </div>

          <div className="welcome-illustration" aria-hidden="true">
            <div className="welcome-orb welcome-orb-primary" />
            <div className="welcome-orb welcome-orb-secondary" />
            <div className="welcome-device">
              <div className="welcome-device-notch" />
              <div className="welcome-device-map" />
              <div className="welcome-device-card welcome-device-card-top" />
              <div className="welcome-device-card welcome-device-card-bottom" />
            </div>
          </div>
        </motion.section>

        <section className="welcome-feature-stack">
          {features.map((feature, index) => (
            <motion.article
              key={feature.title}
              className="welcome-feature-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + index * 0.06, duration: 0.42, ease: 'easeOut' }}
            >
              <div className="welcome-feature-icon">{feature.icon}</div>
              <div>
                <h2>{feature.title}</h2>
                <p>{feature.description}</p>
              </div>
            </motion.article>
          ))}
        </section>

        <motion.section
          className="welcome-actions"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.4, ease: 'easeOut' }}
        >
          <Button fullWidth onClick={() => navigate('/login')}>เริ่มต้นใช้งาน</Button>
          <Button fullWidth variant="secondary" onClick={() => navigate('/login')}>เข้าสู่ระบบ Microsoft</Button>
        </motion.section>

        <footer className="welcome-footer">
          <div className="welcome-version">Version v0.0.0</div>
          <div className="welcome-links">
            <button type="button" onClick={() => setToast('นโยบายความเป็นส่วนตัวสำหรับเดโมพร้อมใช้งานแล้ว')}>ความเป็นส่วนตัว</button>
            <button type="button" onClick={() => setToast('ข้อกำหนดการใช้งานสำหรับเดโมพร้อมใช้งานแล้ว')}>ข้อกำหนด</button>
          </div>
        </footer>

        {toast ? <div className="entry-toast">{toast}</div> : null}
      </div>
    </EntryShell>
  )
}