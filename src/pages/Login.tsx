import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import BrandMark from '../components/BrandMark'
import EntryShell from '../components/EntryShell'
import { Button, Card, TextField } from '../components/ui'

export default function Login({ onLogin }: { onLogin: (input: { rememberMe: boolean; email?: string; password?: string; provider: 'password' | 'microsoft' }) => Promise<void> }) {
  const navigate = useNavigate()
  const [rememberMe, setRememberMe] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRoutingAfterLogin, setIsRoutingAfterLogin] = useState(false)
  const [error, setError] = useState('')
  const appVersion = 'v0.0.0'

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await onLogin({ rememberMe, email, password, provider: 'password' })
      setIsRoutingAfterLogin(true)
      await new Promise((resolve) => window.setTimeout(resolve, 620))
      navigate('/permissions')
    } catch {
      setIsSubmitting(false)
      setError('เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบข้อมูลอีกครั้ง หรือลองเข้าสู่ระบบด้วย Microsoft')
    }
  }

  const handleMicrosoftLogin = async () => {
    setError('')
    setIsSubmitting(true)

    try {
      await onLogin({ rememberMe: true, provider: 'microsoft' })
      setIsRoutingAfterLogin(true)
      await new Promise((resolve) => window.setTimeout(resolve, 620))
      navigate('/permissions')
    } catch {
      setIsSubmitting(false)
      setError('ไม่สามารถเชื่อมต่อ Microsoft ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง')
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
            <TextField label="Email" placeholder="name@krungsri.com" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
            <TextField label="Password" placeholder="รหัสผ่าน" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} />

            {error ? <div className="entry-error-banner">{error}</div> : null}

            <div className="entry-form-meta">
              <label className="entry-checkbox">
                <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />
                <span>Remember Me</span>
              </label>
              <button type="button" className="entry-text-button">ลืมรหัสผ่าน</button>
            </div>

            <Button type="submit" fullWidth disabled={isSubmitting}>{isSubmitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</Button>
            <Button type="button" variant="secondary" fullWidth disabled={isSubmitting} onClick={handleMicrosoftLogin}>{isSubmitting ? 'กำลังเชื่อมต่อ Microsoft...' : 'เข้าสู่ระบบด้วย Microsoft'}</Button>
            <Button type="button" variant="ghost" fullWidth disabled style={{ border: '1px solid var(--border)', opacity: 0.7, color: '#4b5563' }}>Face ID / Fingerprint (พร้อมใช้งานเร็ว ๆ นี้)</Button>
          </form>
        </Card>

        {isRoutingAfterLogin ? (
          <motion.div className="entry-login-transition" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div className="entry-login-transition-card" initial={{ y: 14, scale: 0.96 }} animate={{ y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 24 }}>
              <BrandMark size="large" animated />
              <strong>กำลังยืนยันตัวตน</strong>
              <span>เตรียมความพร้อมก่อนเข้าสู่ระบบงานภาคสนาม</span>
            </motion.div>
          </motion.div>
        ) : null}

        <div className="entry-footer">
          <div>Application Version {appVersion}</div>
          <div>Copyright 2026 Krungsri</div>
          <div>Krungsri Internal Use Only</div>
        </div>
      </div>
    </EntryShell>
  )
}
