import React, { memo } from 'react'

export type RouteStop = {
  id: string
  title: string
  address: string
  owner: string
  phone: string
  priority: 'High' | 'Medium' | 'Low'
  arrivalTime: string
  inspectionTime: string
  status: 'visited' | 'pending' | 'completed'
  image: string
}

type PropertyStopProps = {
  stop: RouteStop
  onOpen: () => void
  onCall: () => void
}

function PropertyStop({ stop, onOpen, onCall }: PropertyStopProps) {
  const priorityLabel = stop.priority === 'High' ? 'สูง' : stop.priority === 'Medium' ? 'กลาง' : 'ต่ำ'

  return (
    <article className="rp-stop-card">
      <img src={stop.image} alt={stop.title} className="rp-stop-image" />
      <div className="rp-stop-body">
        <div className="rp-stop-head">
          <div>
            <strong>{stop.title}</strong>
            <p>{stop.address}</p>
          </div>
          <span className={`rp-priority rp-priority-${stop.priority.toLowerCase()}`}>{priorityLabel}</span>
        </div>
        <div className="rp-stop-meta">
          <span>{stop.owner}</span>
          <span>{stop.phone}</span>
          <span>{stop.arrivalTime}</span>
          <span>{stop.inspectionTime}</span>
        </div>
        <div className="rp-inline-actions">
          <button type="button" onClick={onCall}>โทรหาเจ้าของ</button>
          <button type="button" className="is-primary" onClick={onOpen}>เปิดรายละเอียด</button>
        </div>
      </div>
    </article>
  )
}

export default memo(PropertyStop)
