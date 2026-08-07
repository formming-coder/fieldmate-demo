import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import BrandMark from '../components/BrandMark'
import EntryShell from '../components/EntryShell'
import { Button } from '../components/ui'

const features = [
  {
    icon: '🗺',
    title: 'Smart Map',
    description: 'Explore property context, layers, and nearby intelligence in one mobile map workflow.',
  },
  {
    icon: '📷',
    title: 'AI Camera',
    description: 'Capture field evidence with structured overlays, OCR, and inspection-ready metadata.',
  },
  {
    icon: '🧠',
    title: 'Shared Intelligence',
    description: 'Turn every field visit into reusable knowledge for every valuer across the organization.',
  },
] as const

export default function Welcome() {
  const navigate = useNavigate()

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
            <div className="welcome-kicker">Fieldmate AI</div>
            <h1>Premium field intelligence for modern property valuation</h1>
            <p>Plan, capture, analyze, and share property evidence through one native mobile workflow.</p>
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
            <button type="button">Privacy</button>
            <button type="button">Terms</button>
          </div>
        </footer>
      </div>
    </EntryShell>
  )
}