import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { useCurrentOfficerQuery } from '../hooks/useBackendQueries'

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
  const { data: officer } = useCurrentOfficerQuery()
  const initials = (officer?.name || 'Field Officer')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  const progress = 84
  const circumference = useMemo(() => 2 * Math.PI * 46, [])
  const dashOffset = circumference * (1 - progress / 100)

  return (
    <Layout title="Profile">
      <div className="profile-page">
        <section className="profile-hero">
          <div className="profile-avatar">{initials}</div>
          <div>
            <h1>{officer?.name || 'Field Officer'}</h1>
            <p>{officer?.role || 'Senior Field Valuer'} • Asset Valuation Department</p>
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
          <article className="profile-card"><span>Completed Jobs</span><AnimatedCounter value={184} /></article>
          <article className="profile-card"><span>Accuracy</span><AnimatedCounter value={96} suffix="%" /></article>
          <article className="profile-card"><span>Shared Records</span><AnimatedCounter value={72} /></article>
          <article className="profile-card"><span>Badges</span><AnimatedCounter value={8} /></article>
        </section>

        <section className="profile-section">
          <div className="profile-section-title">Achievements</div>
          <div className="profile-badges">
            <span>Top Mapper</span>
            <span>OCR Expert</span>
            <span>Shared Intelligence Lead</span>
            <span>Route Optimizer</span>
          </div>
        </section>

        <section className="profile-section">
          <div className="profile-section-title">Professional Summary</div>
          <div className="profile-summary-list">
            <div><span>Department</span><strong>Property Valuation</strong></div>
            <div><span>Role</span><strong>Senior Field Officer</strong></div>
            <div><span>Region</span><strong>Bangkok Metropolitan</strong></div>
            <div><span>Last Sync</span><strong>5 min ago</strong></div>
          </div>
        </section>

        <section className="profile-section">
          <div className="profile-section-title">Quick Access</div>
          <div className="profile-action-list">
            <button type="button" onClick={() => navigate('/settings')}>Open Settings</button>
            <button type="button" onClick={() => navigate('/shared-intelligence')}>Shared Intelligence</button>
            <button type="button" onClick={() => navigate('/notifications')}>Notification Center</button>
          </div>
        </section>

        <section className="profile-section">
          <div className="profile-section-title">Timeline</div>
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
