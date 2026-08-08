import React from 'react'

export default function PropertyNotes({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="listing-field">
      <span>หมายเหตุ</span>
      <textarea
        rows={4}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="เช่น ติดถนนคอนกรีต ทางเข้าออกสะดวก"
      />
    </label>
  )
}
