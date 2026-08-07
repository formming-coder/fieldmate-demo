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
      <h2>Export</h2>
      <div className="as-export-grid">
        <button type="button" onClick={onPdf}>PDF</button>
        <button type="button" onClick={onExcel}>Excel</button>
        <button type="button" onClick={onShare}>Share</button>
        <button type="button" onClick={onEmail}>Email</button>
      </div>
      <button type="button" className="as-save-final" onClick={onSave}>Save Assessment Report</button>
    </section>
  )
}

export default memo(ExportActions)
