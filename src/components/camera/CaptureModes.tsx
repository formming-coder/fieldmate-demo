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
  { key: 'exterior', label: 'Exterior' },
  { key: 'interior', label: 'Interior' },
  { key: 'front', label: 'Front' },
  { key: 'side', label: 'Side' },
  { key: 'back', label: 'Back' },
  { key: 'road', label: 'Road' },
  { key: 'land', label: 'Land' },
  { key: 'document', label: 'Document' },
  { key: 'title-deed', label: 'Title Deed' },
  { key: 'house-registration', label: 'House Reg.' },
  { key: 'utilities', label: 'Utilities' },
  { key: 'custom', label: 'Custom' },
]

function CaptureModes({ active, onChange }: CaptureModesProps) {
  return (
    <div className="cam-modes" role="tablist" aria-label="Capture modes">
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
