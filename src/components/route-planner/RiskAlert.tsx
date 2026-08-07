import React, { memo } from 'react'

type RiskAlertProps = {
  items: Array<{ title: string; detail: string; tone: 'flood' | 'forest' | 'road' | 'danger' | 'construction' }>
}

function RiskAlert({ items }: RiskAlertProps) {
  return (
    <section className="rp-card">
      <div className="rp-eyebrow">การตรวจจับความเสี่ยงด้วย AI</div>
      <h2>การแจ้งเตือนเส้นทาง</h2>
      <div className="rp-risk-list">
        {items.map((item) => (
          <div key={item.title} className={`rp-risk-item rp-risk-${item.tone}`}>
            <strong>{item.title}</strong>
            <span>{item.detail}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default memo(RiskAlert)
