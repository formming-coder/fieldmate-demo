import React, { memo } from 'react'
import { BottomSheet } from '../ui'

type VoiceSearchProps = {
  open: boolean
  onClose: () => void
  onUse: (query: string) => void
}

function VoiceSearch({ open, onClose, onUse }: VoiceSearchProps) {
  return (
    <BottomSheet open={open} onClose={onClose} snapPoints={[0.26, 0.4, 0.56]} initialSnap={1}>
      <div className="ais-modal-card">
        <div className="ais-mic-orb">🎙</div>
        <strong>ค้นหาด้วยเสียง</strong>
        <p>พูดคำค้นหาได้ทันที เช่น พื้นที่สำรวจ เจ้าของทรัพย์ หรือช่วงราคา</p>
        <button type="button" className="is-primary" onClick={() => onUse('บ้านเดี่ยวแถวบางนา')}>ใช้คำค้นหาเสียง</button>
      </div>
    </BottomSheet>
  )
}

export default memo(VoiceSearch)
