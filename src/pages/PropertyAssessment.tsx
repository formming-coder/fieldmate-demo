import React from 'react'
import Layout from '../components/Layout'
import styles from './Page.module.css'

export default function PropertyAssessment() {
  return (
    <Layout title="การประเมินทรัพย์สิน">
      <div className={styles.card}>
        <h4>การประเมินทรัพย์สิน</h4>
        <p className={styles.muted}>เครื่องมือและเช็คลิสต์ช่วยประเมินด้วย AI</p>
      </div>
    </Layout>
  )
}
