import React, { memo } from 'react'

type ExportActionsProps = {
  onPdf: () => void
  onExcel: () => void
  onShare: () => void
  onEmail: () => void
  onSave: () => void
}

function ExportActions({ onPdf, onExcel, onShare, onEmail, onSave }: ExportActionsProps) {
  return (
    <section className="as-card">
      <h2>ส่งออกข้อมูล</h2>
      <div className="as-export-grid">
        <button type="button" onClick={onPdf}>PDF</button>
        <button type="button" onClick={onExcel}>Excel</button>
        <button type="button" onClick={onShare}>แชร์</button>
        <button type="button" onClick={onEmail}>อีเมล</button>
      </div>
      <button type="button" className="as-save-final" onClick={onSave}>บันทึกรายงานการประเมิน</button>
    </section>
  )
}

export default memo(ExportActions)
