import React from 'react'
import Layout from '../components/Layout'
import styles from './Page.module.css'

export default function Profile() {
  return (
    <Layout title="โปรไฟล์">
      <div className={styles.card}>
        <h4>นางสาวนีนา</h4>
        <p className={styles.muted}>เจ้าหน้าที่ภาคสนาม</p>
      </div>
    </Layout>
  )
}
