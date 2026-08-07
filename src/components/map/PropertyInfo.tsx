import React, { memo, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Property } from '../../types'

type TimelineEvent = {
  id: string
  title: string
  detail: string
  time: string
}

type PropertyInfoProps = {
  property: Property
  aiConfidence: number
  distanceKm: number
  statusLabel: string
}

const rowHeight = 54
const maxRows = 4

function PropertyInfo({ property, aiConfidence, distanceKm, statusLabel }: PropertyInfoProps) {
  const navigate = useNavigate()
  const timelineRef = useRef<HTMLDivElement | null>(null)
  const [startIndex, setStartIndex] = useState(0)

  const timeline = useMemo<TimelineEvent[]>(() => [
    { id: 'event-1', title: 'Inspection history', detail: 'On-site check completed', time: '2026-08-07 09:20' },
    { id: 'event-2', title: 'Review history', detail: 'Supervisor review completed', time: '2026-08-07 10:45' },
    { id: 'event-3', title: 'Photo uploads', detail: '4 photos synced to cloud', time: '2026-08-07 11:10' },
    { id: 'event-4', title: 'AI analysis', detail: 'Value confidence improved', time: '2026-08-07 11:40' },
    { id: 'event-5', title: 'Inspection history', detail: 'Historic baseline linked', time: '2026-08-05 14:20' },
    { id: 'event-6', title: 'AI analysis', detail: 'Flood risk recalculated', time: '2026-08-04 18:30' },
  ], [])

  const visible = timeline.slice(startIndex, startIndex + maxRows)

  const onScrollTimeline = () => {
    const top = timelineRef.current?.scrollTop || 0
    const next = Math.min(Math.floor(top / rowHeight), Math.max(0, timeline.length - maxRows))
    if (next !== startIndex) setStartIndex(next)
  }

  return (
    <section className="smart-info">
      <div className="smart-info-head">
        <h2>{property.owner}</h2>
        <span className="smart-info-type">{property.type || 'Property'}</span>
      </div>
      <div className="smart-info-grid">
        <div><span>Owner</span><strong>{property.owner}</strong></div>
        <div><span>AI confidence</span><strong>{aiConfidence}%</strong></div>
        <div><span>Estimated price</span><strong>THB {property.marketPrice.toLocaleString()}</strong></div>
        <div><span>Distance</span><strong>{distanceKm.toFixed(1)} km</strong></div>
        <div><span>Address</span><strong>{property.province}</strong></div>
        <div><span>Status</span><strong>{statusLabel}</strong></div>
        <div><span>Appointment</span><strong>{new Date(property.lastInspection).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</strong></div>
      </div>

      <div className="smart-info-actions">
        <button type="button" onClick={() => window.open(`https://www.google.com/maps?q=${property.latitude},${property.longitude}`, '_blank', 'noopener,noreferrer')}>Start Navigation</button>
        <button type="button" onClick={() => navigate('/camera')}>Open Camera</button>
        <button type="button" onClick={() => navigate('/ai-summary')}>AI Summary</button>
        <button type="button">Save</button>
        <button type="button">Share</button>
      </div>

      <div className="smart-timeline-wrap">
        <h3>Timeline</h3>
        <div className="smart-timeline" ref={timelineRef} onScroll={onScrollTimeline}>
          <div style={{ height: timeline.length * rowHeight, position: 'relative' }}>
            {visible.map((event, idx) => {
              const realIndex = startIndex + idx
              return (
                <div key={event.id} className="smart-timeline-item" style={{ top: realIndex * rowHeight }}>
                  <span className="dot" aria-hidden="true" />
                  <div>
                    <strong>{event.title}</strong>
                    <p>{event.detail}</p>
                  </div>
                  <time>{event.time}</time>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default memo(PropertyInfo)
