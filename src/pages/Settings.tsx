import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { Button } from '../components/ui'
import { env } from '../config/env'
import { useAuth } from '../lib/auth/useAuth'

const rows = [
  { key: 'Language', detail: 'English / ไทย' },
  { key: 'Theme', detail: 'Light' },
  { key: 'Dark Mode', detail: 'Off' },
  { key: 'Notification', detail: 'Enabled' },
  { key: 'Offline', detail: 'Smart Sync' },
  { key: 'Version', detail: 'v0.0.0' },
  { key: 'Privacy', detail: 'Internal policy' },
  { key: 'Terms', detail: 'Enterprise use' },
  { key: 'About', detail: 'Fieldmate AI mobile' },
] as const

export default function Settings() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [darkMode, setDarkMode] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <Layout title="Settings">
      <div className="settings-page">
        <motion.section className="settings-hero" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="settings-kicker">Enterprise Settings</div>
          <h1>App preferences</h1>
          <p>Prepare Fieldmate AI for field work, offline sync, accessibility, and executive presentation mode.</p>
        </motion.section>

        <section className="settings-list">
          {rows.map((row) => (
            <article key={row.key} className="settings-row">
              <div>
                <strong>{row.key}</strong>
                <span>{row.key === 'Dark Mode' ? (darkMode ? 'On' : 'Off') : row.detail}</span>
              </div>
              {row.key === 'Dark Mode' ? <button type="button" onClick={() => setDarkMode((current) => !current)}>{darkMode ? 'Disable' : 'Enable'}</button> : <button type="button">Open</button>}
            </article>
          ))}
        </section>

        <section className="settings-hero">
          <div className="settings-kicker">Authentication</div>
          <h1>{env.appMode === 'development' ? 'Development Mode' : 'Production Mode'}</h1>
          <p>{env.appMode === 'development' ? 'Demo Login is active. Microsoft Entra ID will be available after switching to production mode.' : 'Microsoft Entra ID session is managed through secure redirect-based authentication.'}</p>
          <Button type="button" variant="secondary" fullWidth onClick={() => void handleLogout()}>Logout</Button>
        </section>
      </div>
    </Layout>
  )
}
