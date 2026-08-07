import React, { memo } from 'react'

type NearbyAnalysisProps = {
  radius: string
  onRadiusChange: (value: string) => void
  items: Array<{ label: string; distance: string; type: string }>
}

function NearbyAnalysis({ radius, onRadiusChange, items }: NearbyAnalysisProps) {
  const radii = ['500m', '1km', '3km', '5km']

  return (
    <section className="gis-panel-card">
      <div className="gis-section-title">Nearby Analysis</div>
      <div className="gis-chip-row">
        {radii.map((item) => (
          <button key={item} type="button" className={radius === item ? 'is-active' : ''} onClick={() => onRadiusChange(item)}>
            {item}
          </button>
        ))}
      </div>
      <div className="gis-nearby-list">
        {items.map((item) => (
          <div key={`${item.label}-${item.distance}`} className="gis-nearby-item">
            <strong>{item.label}</strong>
            <span>{item.type}</span>
            <em>{item.distance}</em>
          </div>
        ))}
      </div>
    </section>
  )
}

export default memo(NearbyAnalysis)
