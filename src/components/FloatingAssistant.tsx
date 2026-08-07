import React from 'react'
import styles from './FloatingAssistant.module.css'

export default function FloatingAssistant({onClick}:{onClick?: ()=>void}){
  return (
    <div className={styles.root} role="button" aria-label="Open AI Assistant" onClick={onClick}>
      <div className={styles.badge}>AI</div>
    </div>
  )
}
