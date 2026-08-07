import React from 'react'
import styles from './Page.module.css'

export default function Splash({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="splash" onClick={onContinue}>
      <div>
        <div className="splash-card">
          <div className="splash-badge">FM</div>
          <div className="splash-copy">
            <p className="eyebrow">Fieldmate AI</p>
            <h1>ปลดล็อกการทำงานภาคสนามได้อย่างชาญฉลาด</h1>
            <p>แตะเพื่อดำเนินการต่อ</p>
          </div>
        </div>
        <p className="splash-hint">ออกแบบสำหรับทีมงานภาคสนามที่ใช้มือถือเป็นหลัก</p>
      </div>
    </div>
  )
}
