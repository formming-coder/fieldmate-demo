import React from 'react'
import Layout from '../components/Layout'
import styles from './Page.module.css'

export default function Notifications() {
  return (
    <Layout title="การแจ้งเตือน">
      <div className={styles.list}>
        <div className={styles.card}>ไม่มีการแจ้งเตือนใหม่</div>
      </div>
    </Layout>
  )
}
