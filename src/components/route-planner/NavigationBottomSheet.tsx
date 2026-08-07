import React, { memo } from 'react'
import BottomSheet from '../map/BottomSheet'
import { RouteStop } from './PropertyStop'

type NavigationBottomSheetProps = {
  open: boolean
  stop: RouteStop | null
  onClose: () => void
  onAssessment: () => void
}

function NavigationBottomSheet({ open, stop, onClose, onAssessment }: NavigationBottomSheetProps) {
  const priorityLabel = stop?.priority === 'High' ? 'สูง' : stop?.priority === 'Medium' ? 'กลาง' : 'ต่ำ'
  const statusLabel = stop?.status === 'completed' ? 'เสร็จสิ้น' : stop?.status === 'visited' ? 'เข้าพื้นที่แล้ว' : 'รอดำเนินการ'

  return (
    <BottomSheet open={open} onClose={onClose}>
      {stop ? (
        <div className="rp-sheet-content">
          <img src={stop.image} alt={stop.title} className="rp-sheet-image" />
          <div className="rp-sheet-head">
            <div>
              <strong>{stop.title}</strong>
              <p>{stop.address}</p>
            </div>
            <span className={`rp-priority rp-priority-${stop.priority.toLowerCase()}`}>{priorityLabel}</span>
          </div>
          <div className="rp-info-grid">
            <div><span>เวลาไปถึง</span><strong>{stop.arrivalTime}</strong></div>
            <div><span>สถานะ</span><strong>{statusLabel}</strong></div>
            <div><span>เจ้าของ</span><strong>{stop.owner}</strong></div>
            <div><span>เบอร์โทร</span><strong>{stop.phone}</strong></div>
          </div>
          <button type="button" className="rp-primary-btn" onClick={onAssessment}>เปิดงานประเมิน</button>
        </div>
      ) : null}
    </BottomSheet>
  )
}

export default memo(NavigationBottomSheet)
