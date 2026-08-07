import React from 'react'
import styles from './FloatingAssistant.module.css'

export default function FloatingAssistant({onClick}:{onClick?: ()=>void}){
  return (
    <div className={styles.root} role="button" aria-label="เปิดผู้ช่วย AI" onClick={onClick}>
      <div className={styles.badge}>AI</div>
    </div>
  )
}
