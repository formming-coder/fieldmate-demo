import React, { memo } from 'react'

type DuplicateCardProps = {
  visible: boolean
  similarity: number
  officer: string
  captureDate: string
  onOpenExisting: () => void
  onCreateNew: () => void
}

function DuplicateCard({ visible, similarity, officer, captureDate, onOpenExisting, onCreateNew }: DuplicateCardProps) {
  if (!visible) return null

  return (
    <section className="spi-duplicate-card">
      <div>
        <strong>พบรายการที่อาจซ้ำกัน</strong>
        <p>ความคล้าย {similarity}% • {officer} • {captureDate}</p>
      </div>
      <div className="spi-inline-actions">
        <button type="button" onClick={onOpenExisting}>เปิดรายการเดิม</button>
        <button type="button" className="is-primary" onClick={onCreateNew}>สร้างรายการใหม่</button>
      </div>
    </section>
  )
}

export default memo(DuplicateCard)
