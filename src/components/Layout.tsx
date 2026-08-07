import React from 'react'
import BottomNav from './BottomNav'
import styles from './Layout.module.css'
import FloatingAssistant from './FloatingAssistant'

export default function Layout({ children, title = 'Fieldmate' }: { children: React.ReactNode; title?: string }) {
  return (
    <div className="app-shell">
      <header className="app-header container">
        <div className="app-title">
          <div className="logo">FM</div>
          <div>
            <div style={{fontSize:12, color:'var(--muted)'}}>Fieldmate AI</div>
            <div style={{fontWeight:700}}>{title}</div>
          </div>
        </div>

        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <button className={styles.iconBtn} aria-label="ค้นหา">🔎</button>
          <button className={styles.iconBtn} aria-label="การแจ้งเตือน">🔔</button>
          <button className={styles.iconBtn} aria-label="พิกัด">📍</button>
        </div>
      </header>

      <main className={`${styles.page} ${styles.container}`}>{children}</main>

      <FloatingAssistant />
      <BottomNav />
    </div>
  )
}
