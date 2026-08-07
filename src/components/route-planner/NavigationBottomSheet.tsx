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
            <span className={`rp-priority rp-priority-${stop.priority.toLowerCase()}`}>{stop.priority}</span>
          </div>
          <div className="rp-info-grid">
            <div><span>Distance</span><strong>{stop.arrivalTime}</strong></div>
            <div><span>Type</span><strong>{stop.status}</strong></div>
            <div><span>Owner</span><strong>{stop.owner}</strong></div>
            <div><span>Phone</span><strong>{stop.phone}</strong></div>
          </div>
          <button type="button" className="rp-primary-btn" onClick={onAssessment}>Open Assessment</button>
        </div>
      ) : null}
    </BottomSheet>
  )
}

export default memo(NavigationBottomSheet)
