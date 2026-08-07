import React from 'react'
import { NavLink } from 'react-router-dom'
import styles from './BottomNav.module.css'

const Icon = ({ path }: { path: string }) => (
  <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: path }} />
)

export default function BottomNav() {
  return (
    <div className={styles.navWrap}>
      <nav className="bottom-nav">
        <NavLink to="/map" className={({isActive}) => `${styles.item} ${isActive? styles.active : ''}`}>
          <Icon path={`<path d=\"M21 10.5V7a1 1 0 0 0-1-1l-5 1.5V4a1 1 0 0 0-1-1l-4 1.5V2a1 1 0 0 0-1-1L4 3v7l7 4 7-3.5z\"/>`} />
          <span className={styles.itemLabel}>แผนที่</span>
        </NavLink>
        <NavLink to="/camera" className={({isActive}) => `${styles.item} ${isActive? styles.active : ''}`}>
          <Icon path={`<path d=\"M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z\"/><path d=\"M20 21v-8\"/>`} />
          <span className={styles.itemLabel}>ถ่ายภาพ</span>
        </NavLink>
        <NavLink to="/album" className={({isActive}) => `${styles.item} ${isActive? styles.active : ''}`}>
          <Icon path={`<rect x=\"3\" y=\"3\" width=\"18\" height=\"14\" rx=\"2\"/><path d=\"M3 7h18\"/>`} />
          <span className={styles.itemLabel}>อัลบั้ม</span>
        </NavLink>
        <NavLink to="/shared-intelligence" className={({isActive}) => `${styles.item} ${isActive? styles.active : ''}`}>
          <Icon path={`<path d="M4 7h16"/><path d="M4 12h10"/><path d="M4 17h7"/><circle cx="17" cy="17" r="3"/>`} />
          <span className={styles.itemLabel}>ข้อมูลกลาง</span>
        </NavLink>
        <NavLink to="/search" className={({isActive}) => `${styles.item} ${isActive? styles.active : ''}`}>
          <Icon path={`<circle cx=\"11\" cy=\"11\" r=\"7\"/><path d=\"M21 21l-4.35-4.35\"/>`} />
          <span className={styles.itemLabel}>ค้นหา</span>
        </NavLink>
        <NavLink to="/profile" className={({isActive}) => `${styles.item} ${isActive? styles.active : ''}`}>
          <Icon path={`<path d=\"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2\"/><circle cx=\"12\" cy=\"7\" r=\"4\"/>`} />
          <span className={styles.itemLabel}>โปรไฟล์</span>
        </NavLink>
      </nav>
    </div>
  )
}
