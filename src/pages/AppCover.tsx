import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui'
import './AppCover.css'
import AnimatedLogo from '../components/app-cover/AnimatedLogo'
import HeroIllustration from '../components/app-cover/HeroIllustration'

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

          <section className="app-cover-content">
            <AnimatedLogo
              title="ฟีลด์เมต AI"
              tagline="แพลตฟอร์มสำรวจทรัพย์สินด้วย AI"
              subtitle="แพลตฟอร์มอัจฉริยะสำหรับการสำรวจ เก็บข้อมูล และประเมินราคาหลักประกัน"
            />

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
              <div>เวอร์ชัน 2.0</div>
              <div>รุ่นทดสอบ 1</div>
              <div>ลิขสิทธิ์ ฟีลด์เมต AI</div>
            </motion.footer>
          </section>
        </main>
      </div>
    </div>
  )
}
