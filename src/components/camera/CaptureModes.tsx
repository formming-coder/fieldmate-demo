import React, { memo } from 'react'
import { motion } from 'framer-motion'

export type CaptureMode =
  | 'exterior'
  | 'interior'
  | 'front'
  | 'side'
  | 'back'
  | 'road'
  | 'land'
  | 'document'
  | 'title-deed'
  | 'house-registration'
  | 'utilities'
  | 'custom'

type CaptureModesProps = {
  active: CaptureMode
  onChange: (mode: CaptureMode) => void
}

const items: Array<{ key: CaptureMode; label: string }> = [
  { key: 'exterior', label: 'ภายนอก' },
  { key: 'interior', label: 'ภายใน' },
  { key: 'front', label: 'ด้านหน้า' },
  { key: 'side', label: 'ด้านข้าง' },
  { key: 'back', label: 'ด้านหลัง' },
  { key: 'road', label: 'ถนน' },
  { key: 'land', label: 'ที่ดิน' },
  { key: 'document', label: 'เอกสาร' },
  { key: 'title-deed', label: 'โฉนด' },
  { key: 'house-registration', label: 'ทะเบียนบ้าน' },
  { key: 'utilities', label: 'สาธารณูปโภค' },
  { key: 'custom', label: 'กำหนดเอง' },
]

function CaptureModes({ active, onChange }: CaptureModesProps) {
  return (
    <div className="cam-modes" role="tablist" aria-label="โหมดการถ่ายภาพ">
      {items.map((item) => {
        const selected = item.key === active
        return (
          <button key={item.key} type="button" className="cam-mode" onClick={() => onChange(item.key)} role="tab" aria-selected={selected}>
            {selected ? <motion.span className="cam-mode-active" layoutId="cam-mode-active" /> : null}
            <span>{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default memo(CaptureModes)
