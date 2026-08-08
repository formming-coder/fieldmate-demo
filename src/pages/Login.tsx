import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import BrandMark from '../components/BrandMark'
import EntryShell from '../components/EntryShell'
import { Button, Card, TextField } from '../components/ui'
import { isDevelopmentMode } from '../config/env'
import { useAuth } from '../lib/auth/useAuth'

export default function Login() {
  const navigate = useNavigate()
  const { appMode, login } = useAuth()
  const [rememberMe, setRememberMe] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRoutingAfterLogin, setIsRoutingAfterLogin] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [showMicrosoftDialog, setShowMicrosoftDialog] = useState(false)
  const appVersion = '1.0 รุ่นต้นแบบ'
  const isDevelopmentAuth = appMode === 'development'

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await login({
        rememberMe,
        email,
        password,
        provider: isDevelopmentAuth ? 'password' : 'microsoft',
      })

      if (!isDevelopmentAuth) {
        return
      }

      setToast('เข้าสู่ระบบสำเร็จ')
      setIsRoutingAfterLogin(true)
      await new Promise((resolve) => window.setTimeout(resolve, 1000))
      navigate('/permissions', { replace: true })
    } catch (caughtError) {
      setIsSubmitting(false)
      setError(caughtError instanceof Error ? caughtError.message : 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
    }
  }

  const handleMicrosoftLogin = async () => {
    if (isDevelopmentAuth) {
      setShowMicrosoftDialog(true)
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      await login({ rememberMe, provider: 'microsoft' })
    } catch (caughtError) {
      setIsSubmitting(false)
      setError(caughtError instanceof Error ? caughtError.message : 'ไม่สามารถเชื่อมต่อ Microsoft ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง')
    }
  }

  return (
    <EntryShell>
      <div className="entry-screen">
        <motion.div
          className="entry-brand-block"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 26 }}
        >
          <BrandMark size="large" />
          <div className="entry-brand-name">ฟีลด์เมต AI</div>
          <div className="entry-title">ยินดีต้อนรับ</div>
          <div className="entry-subtitle">เข้าสู่ระบบเพื่อเริ่มสำรวจข้อมูลอสังหาริมทรัพย์</div>
        </motion.div>

        <Card elevated glass style={{ display: 'grid', gap: 18, padding: 26, borderRadius: 30 }}>
          <form className="entry-form" onSubmit={handleSubmit}>
            <TextField label="อีเมล" placeholder="ชื่อผู้ใช้@องค์กร" type="email" required={isDevelopmentAuth} value={email} onChange={(event) => setEmail(event.target.value)} />
            <TextField label="รหัสผ่าน" placeholder="รหัสผ่าน" type="password" required={isDevelopmentAuth} value={password} onChange={(event) => setPassword(event.target.value)} />

            {isDevelopmentMode ? <div className="entry-info-banner">เข้าสู่ระบบเดโมพร้อมใช้งาน ใช้อีเมลและรหัสผ่านใดก็ได้ที่ไม่ว่างเปล่าเพื่อเข้าสู่ระบบ</div> : null}

            {error ? <div className="entry-error-banner">{error}</div> : null}

            <div className="entry-form-meta">
              <label className="entry-checkbox">
                <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />
                <span>จดจำการเข้าสู่ระบบ</span>
              </label>
              <button type="button" className="entry-text-button" onClick={() => setToast('ระบบรีเซ็ตรหัสผ่านสำหรับเดโมพร้อมใช้งานผ่านผู้ดูแลระบบ')}>ลืมรหัสผ่าน</button>
            </div>

            <Button type="submit" fullWidth disabled={isSubmitting}>{isSubmitting ? (isDevelopmentAuth ? 'กำลังเข้าสู่ระบบ...' : 'กำลังเชื่อมต่อ Microsoft...') : 'เข้าสู่ระบบ'}</Button>
            <Button type="button" variant="secondary" fullWidth disabled={isSubmitting} onClick={handleMicrosoftLogin}>{isSubmitting ? 'กำลังเชื่อมต่อ Microsoft...' : 'เข้าสู่ระบบด้วย Microsoft'}</Button>
          </form>
        </Card>

        {isRoutingAfterLogin ? (
          <motion.div className="entry-login-transition" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div className="entry-login-transition-card" initial={{ y: 14, scale: 0.96 }} animate={{ y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 24 }}>
              <BrandMark size="large" animated />
              <strong>กำลังยืนยันตัวตน</strong>
              <span>{isDevelopmentAuth ? 'กำลังสร้างเซสชันทดสอบ' : 'กำลังเชื่อมต่อบริการยืนยันตัวตนของ Microsoft'}</span>
            </motion.div>
          </motion.div>
        ) : null}

        <AnimatePresence>
          {showMicrosoftDialog ? (
            <motion.div className="entry-dialog-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="entry-dialog-card" initial={{ y: 12, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 12, scale: 0.98 }}>
                <strong>เข้าสู่ระบบด้วย Microsoft</strong>
                  <p>ยังไม่ได้ตั้งค่าการยืนยันตัวตนด้วย Microsoft สำหรับรุ่นต้นแบบนี้</p>
                <Button type="button" fullWidth onClick={() => setShowMicrosoftDialog(false)}>รับทราบ</Button>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {toast ? (
            <motion.div className="entry-toast" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 18 }}>
              {toast}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="entry-footer">
          <div>เวอร์ชัน {appVersion}</div>
          <div>ลิขสิทธิ์ 2026 กรุงศรี</div>
          <div>สำหรับใช้งานภายในกรุงศรีเท่านั้น</div>
        </div>
      </div>
    </EntryShell>
  )
}
