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
  const appVersion = 'v0.0.0'
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
      navigate('/home', { replace: true })
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
          <div className="entry-brand-name">Fieldmate AI</div>
          <div className="entry-title">ยินดีต้อนรับ</div>
          <div className="entry-subtitle">เข้าสู่ระบบเพื่อเริ่มสำรวจข้อมูลอสังหาริมทรัพย์</div>
        </motion.div>

        <Card elevated glass style={{ display: 'grid', gap: 18, padding: 26, borderRadius: 30 }}>
          <form className="entry-form" onSubmit={handleSubmit}>
            <TextField label="Email" placeholder="name@krungsri.com" type="email" required={isDevelopmentAuth} value={email} onChange={(event) => setEmail(event.target.value)} />
            <TextField label="Password" placeholder="รหัสผ่าน" type="password" required={isDevelopmentAuth} value={password} onChange={(event) => setPassword(event.target.value)} />

            {isDevelopmentMode ? <div className="entry-info-banner">Demo Login พร้อมใช้งาน ใช้อีเมลและรหัสผ่านใดก็ได้ที่ไม่ว่างเปล่าเพื่อเข้าสู่ระบบ</div> : null}

            {error ? <div className="entry-error-banner">{error}</div> : null}

            <div className="entry-form-meta">
              <label className="entry-checkbox">
                <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />
                <span>Remember Me</span>
              </label>
              <button type="button" className="entry-text-button">ลืมรหัสผ่าน</button>
            </div>

            <Button type="submit" fullWidth disabled={isSubmitting}>{isSubmitting ? (isDevelopmentAuth ? 'กำลังเข้าสู่ระบบ...' : 'กำลังเชื่อมต่อ Microsoft...') : 'เข้าสู่ระบบ'}</Button>
            <Button type="button" variant="secondary" fullWidth disabled={isSubmitting} onClick={handleMicrosoftLogin}>{isSubmitting ? 'กำลังเชื่อมต่อ Microsoft...' : 'เข้าสู่ระบบด้วย Microsoft'}</Button>
            <Button type="button" variant="ghost" fullWidth disabled style={{ border: '1px solid var(--border)', opacity: 0.7, color: '#4b5563' }}>Coming Soon</Button>
          </form>
        </Card>

        {isRoutingAfterLogin ? (
          <motion.div className="entry-login-transition" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div className="entry-login-transition-card" initial={{ y: 14, scale: 0.96 }} animate={{ y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 24 }}>
              <BrandMark size="large" animated />
              <strong>กำลังยืนยันตัวตน</strong>
              <span>{isDevelopmentAuth ? 'กำลังสร้าง Demo Session สำหรับการทดสอบ' : 'กำลังเชื่อมต่อ Microsoft Entra ID'}</span>
            </motion.div>
          </motion.div>
        ) : null}

        <AnimatePresence>
          {showMicrosoftDialog ? (
            <motion.div className="entry-dialog-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="entry-dialog-card" initial={{ y: 12, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 12, scale: 0.98 }}>
                <strong>Microsoft Login</strong>
                <p>Microsoft Login จะเปิดใช้งานเมื่อเชื่อมต่อ Production</p>
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
          <div>Application Version {appVersion}</div>
          <div>Copyright 2026 Krungsri</div>
          <div>Krungsri Internal Use Only</div>
        </div>
      </div>
    </EntryShell>
  )
}
