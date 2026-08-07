import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { Button } from '../components/ui'
import { env } from '../config/env'
import { useAuth } from '../lib/auth/useAuth'

const rows = [
  { key: 'ภาษา', detail: 'ไทย' },
  { key: 'ธีม', detail: 'สว่าง' },
  { key: 'โหมดมืด', detail: 'ปิด' },
  { key: 'การแจ้งเตือน', detail: 'เปิดใช้งาน' },
  { key: 'ออฟไลน์', detail: 'ซิงก์อัจฉริยะ' },
  { key: 'Version', detail: 'v0.0.0' },
  { key: 'ความเป็นส่วนตัว', detail: 'นโยบายภายในองค์กร' },
  { key: 'ข้อกำหนด', detail: 'สำหรับใช้งานภายในองค์กร' },
  { key: 'เกี่ยวกับ', detail: 'แอปสำหรับภาคสนามที่ขับเคลื่อนด้วย AI' },
] as const

export default function Settings() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [darkMode, setDarkMode] = useState(false)
  const [toast, setToast] = useState('')

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const handleRowAction = (rowKey: string) => {
    const messages: Record<string, string> = {
      ภาษา: 'กำหนดภาษาเป็นไทยเรียบร้อยแล้ว',
      ธีม: 'กำหนดธีมสว่างสำหรับเดโมแล้ว',
      การแจ้งเตือน: 'เปิดศูนย์การแจ้งเตือนสำหรับงานภาคสนามแล้ว',
      ออฟไลน์: 'เปิดการซิงก์อัจฉริยะแบบออฟไลน์แล้ว',
      Version: 'แสดงข้อมูลเวอร์ชันสำหรับเดโมแล้ว',
      ความเป็นส่วนตัว: 'เปิดนโยบายความเป็นส่วนตัวขององค์กรแล้ว',
      ข้อกำหนด: 'เปิดข้อกำหนดการใช้งานภายในองค์กรแล้ว',
      เกี่ยวกับ: 'เปิดรายละเอียดแอปฟีลด์เมต AI แล้ว',
    }
    setToast(messages[rowKey] || 'เปิดรายการตั้งค่าแล้ว')
  }

  return (
    <Layout title="ตั้งค่า">
      <div className="settings-page">
        <motion.section className="settings-hero" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="settings-kicker">การตั้งค่าแอป</div>
          <h1>การตั้งค่าการใช้งาน</h1>
          <p>เตรียมฟีลด์เมต AI ให้พร้อมสำหรับงานภาคสนาม การซิงก์แบบออฟไลน์ การเข้าถึง และการนำเสนอข้อมูล</p>
        </motion.section>

        <section className="settings-list">
          {rows.map((row) => (
            <article key={row.key} className="settings-row">
              <div>
                <strong>{row.key}</strong>
                <span>{row.key === 'โหมดมืด' ? (darkMode ? 'เปิด' : 'ปิด') : row.detail}</span>
              </div>
              {row.key === 'โหมดมืด' ? (
                <button type="button" onClick={() => {
                  setDarkMode((current) => !current)
                  setToast(darkMode ? 'ปิดโหมดมืดแล้ว' : 'เปิดโหมดมืดแล้ว')
                }}>
                  {darkMode ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                </button>
              ) : (
                <button type="button" onClick={() => handleRowAction(row.key)}>เปิด</button>
              )}
            </article>
          ))}
        </section>

        <section className="settings-hero">
          <div className="settings-kicker">การยืนยันตัวตน</div>
          <h1>{env.appMode === 'development' ? 'โหมดพัฒนา' : 'โหมดใช้งานจริง'}</h1>
          <p>{env.appMode === 'development' ? 'กำลังใช้การเข้าสู่ระบบโหมดสาธิต และจะเปิดใช้งาน Microsoft เมื่อสลับเป็นโหมดใช้งานจริง' : 'เซสชัน Microsoft ถูกจัดการด้วยการยืนยันตัวตนแบบปลอดภัยผ่านการเปลี่ยนเส้นทาง'}</p>
          <Button type="button" variant="secondary" fullWidth onClick={() => void handleLogout()}>ออกจากระบบ</Button>
        </section>

        {toast ? <div className="entry-toast">{toast}</div> : null}
      </div>
    </Layout>
  )
}
