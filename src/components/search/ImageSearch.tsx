import React, { memo } from 'react'
import { BottomSheet } from '../ui'

type ImageSearchProps = {
  open: boolean
  onClose: () => void
  onUse: (query: string) => void
}

function ImageSearch({ open, onClose, onUse }: ImageSearchProps) {
  return (
    <BottomSheet open={open} onClose={onClose} snapPoints={[0.28, 0.42, 0.64]} initialSnap={1}>
      <div className="ais-modal-card">
        <div className="ais-mic-orb">📷</div>
        <strong>ค้นหาด้วยภาพ</strong>
        <p>ค้นหาจากภาพ OCR วัตถุ หรือเอกสารได้จากชุดข้อมูลจริง</p>
        <div className="ais-inline-actions">
          <button type="button" onClick={() => onUse('รูปที่มีป้ายขาย')}>วัตถุ</button>
          <button type="button" onClick={() => onUse('OCR โฉนดที่ดิน')}>OCR</button>
          <button type="button" className="is-primary" onClick={() => onUse('เอกสารใกล้บางนา')}>เอกสาร</button>
        </div>
      </div>
    </BottomSheet>
  )
}

export default memo(ImageSearch)
