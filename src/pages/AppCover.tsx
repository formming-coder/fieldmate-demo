import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui'
import './AppCover.css'
import AnimatedLogo from '../components/app-cover/AnimatedLogo'
import FeatureCards from '../components/app-cover/FeatureCards'
import HeroIllustration from '../components/app-cover/HeroIllustration'

const features = [
  {
    icon: '🗺',
    title: 'Smart Map',
    description: 'ค้นหาทรัพย์บนแผนที่',
  },
  {
    icon: '📷',
    title: 'AI Camera',
    description: 'AI OCR อ่านข้อมูลจากป้ายประกาศขาย',
  },
  {
    icon: '🤖',
    title: 'AI Assessment',
    description: 'ผู้ช่วยวิเคราะห์ข้อมูลทรัพย์สิน',
  },
  {
    icon: '🤝',
    title: 'Shared Intelligence',
    description: 'แบ่งปันข้อมูลร่วมกันทั้งองค์กร',
  },
] as const

export default function AppCover({ onContinue }: { onContinue: () => void }) {
  const navigate = useNavigate()

  const handleMicrosoftLogin = () => {
    navigate('/login')
    onContinue()
  }

  return (
    <div className="app-shell">
      <div className="mobile-shell app-cover-shell">
        <div className="app-cover-geometric-bg" aria-hidden="true" />
        <main className="app-cover-main">
          <HeroIllustration />

          <AnimatedLogo
            title="Fieldmate AI"
            tagline="AI Property Survey Platform"
            subtitle="แพลตฟอร์มอัจฉริยะสำหรับการสำรวจ เก็บข้อมูล และประเมินราคาหลักประกัน"
          />

          <motion.div
            id="app-cover-features"
            className="app-cover-feature-wrap"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26, duration: 0.5, ease: 'easeOut' }}
          >
            <FeatureCards items={[...features]} />
          </motion.div>

          <motion.section
            className="app-cover-actions"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.34, duration: 0.48, ease: 'easeOut' }}
          >
            <Button fullWidth className="app-cover-button-primary" onClick={onContinue}>เริ่มต้นใช้งาน</Button>
            <Button fullWidth variant="ghost" className="app-cover-button-secondary" onClick={handleMicrosoftLogin}>เข้าสู่ระบบด้วย Microsoft</Button>
          </motion.section>

          <motion.footer
            className="app-cover-footer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.42, duration: 0.5 }}
          >
            <div>Version 2.0</div>
            <div>Build RC1</div>
            <div>© Fieldmate AI</div>
            <div>Property Valuation Innovation Platform</div>
          </motion.footer>
        </main>
      </div>
    </div>
  )
}
