import { formatThaiDateTime } from '../lib/locale'
import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { useAuth } from '../lib/auth/useAuth'

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const duration = 900
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      setDisplay(Math.round(value * progress))
      if (progress < 1) {
        raf = window.requestAnimationFrame(tick)
      }
    }
    raf = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(raf)
  }, [value])

  return (
    <motion.strong
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {display}{suffix}
    </motion.strong>
  )
}

export default function Profile() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const initials = (currentUser?.name || 'เจ้าหน้าที่ภาคสนาม')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  const progress = 84
  const circumference = useMemo(() => 2 * Math.PI * 46, [])
  const dashOffset = circumference * (1 - progress / 100)

  return (
    <Layout title="โปรไฟล์">
      <div className="profile-page">
        <section className="profile-hero">
          <div className="profile-avatar">{initials}</div>
          <div>
            <h1>{currentUser?.name || 'เจ้าหน้าที่ภาคสนาม'}</h1>
            <p>{currentUser?.role || 'เจ้าหน้าที่ประเมินอาวุโส'} • {currentUser?.department || 'ฝ่ายประเมินราคาหลักประกัน'}</p>
          </div>
          <div className="profile-progress-wrap">
            <svg viewBox="0 0 120 120" className="profile-progress-ring" aria-hidden="true">
              <circle cx="60" cy="60" r="46" className="profile-progress-track" />
              <motion.circle cx="60" cy="60" r="46" className="profile-progress-fill" initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: dashOffset }} transition={{ duration: 1, ease: 'easeOut' }} strokeDasharray={circumference} />
            </svg>
            <div className="profile-progress-text">{progress}%</div>
          </div>
        </section>

        <section className="profile-card-grid">
          <article className="profile-card"><span>งานที่เสร็จแล้ว</span><AnimatedCounter value={184} /></article>
          <article className="profile-card"><span>ความแม่นยำ</span><AnimatedCounter value={96} suffix="%" /></article>
          <article className="profile-card"><span>ข้อมูลที่แชร์</span><AnimatedCounter value={72} /></article>
          <article className="profile-card"><span>เหรียญรางวัล</span><AnimatedCounter value={8} /></article>
        </section>

        <section className="profile-section">
          <div className="profile-section-title">ผลงานเด่น</div>
          <div className="profile-badges">
            <span>ผู้เชี่ยวชาญแผนที่</span>
            <span>ผู้เชี่ยวชาญ OCR</span>
            <span>ผู้นำข้อมูลส่วนกลาง</span>
            <span>ผู้เชี่ยวชาญวางแผนเส้นทาง</span>
          </div>
        </section>

        <section className="profile-section">
          <div className="profile-section-title">ข้อมูลการทำงาน</div>
          <div className="profile-summary-list">
            <div><span>ฝ่ายงาน</span><strong>{currentUser?.department || 'ฝ่ายประเมินราคาหลักประกัน'}</strong></div>
            <div><span>ตำแหน่ง</span><strong>{currentUser?.role || 'เจ้าหน้าที่ภาคสนามอาวุโส'}</strong></div>
            <div><span>พื้นที่รับผิดชอบ</span><strong>กรุงเทพมหานครและปริมณฑล</strong></div>
            <div><span>ซิงก์ล่าสุด</span><strong>{formatThaiDateTime(new Date(Date.now() - 5 * 60 * 1000), { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short', year: 'numeric' })}</strong></div>
          </div>
        </section>

        <section className="profile-section">
          <div className="profile-section-title">เมนูลัด</div>
          <div className="profile-action-list">
            <button type="button" onClick={() => navigate('/settings')}>เปิดการตั้งค่า</button>
            <button type="button" onClick={() => navigate('/shared-intelligence')}>ข้อมูลทรัพย์สินส่วนกลาง</button>
            <button type="button" onClick={() => navigate('/notifications')}>ศูนย์การแจ้งเตือน</button>
          </div>
        </section>

        <section className="profile-section">
          <div className="profile-section-title">ไทม์ไลน์</div>
          <div className="profile-timeline">
            {['ตรวจงานพื้นที่บางนา', 'อัปโหลดภาพชุดใหม่', 'ปิดงานประเมินเร่งด่วน'].map((item, index) => (
              <motion.div key={item} className="profile-timeline-item" initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.07 }}>
                <span className="profile-timeline-dot" aria-hidden="true" />
                <div>
                  <strong>{item}</strong>
                  <p>{index === 0 ? 'วันนี้ 09:30' : index === 1 ? 'เมื่อวาน 18:20' : '2 วันที่แล้ว 16:40'}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  )
}
