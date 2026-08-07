import React from 'react'
import Layout from '../components/Layout'
import styles from './Page.module.css'

export default function Login() {
  return (
    <Layout title="เข้าสู่ระบบ">
      <div style={{maxWidth:420, marginTop:8}}>
        <div className={styles.card}>
          <h3>เข้าสู่ระบบ Fieldmate AI</h3>
          <p className={styles.muted} style={{marginTop:6}}>ใช้ข้อมูลเข้าสู่ระบบของบริษัท</p>
          <form style={{display:'grid', gap:10, marginTop:12}}>
            <input placeholder="อีเมล" />
            <input placeholder="รหัสผ่าน" type="password" />
            <button className={styles.btnPrimary}>เข้าสู่ระบบ</button>
          </form>
        </div>
      </div>
    </Layout>
  )
}
