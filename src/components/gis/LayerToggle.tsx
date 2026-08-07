import React, { memo } from 'react'

type LayerToggleProps = {
  label: string
  description: string
  active: boolean
  opacity: number
  onToggle: () => void
  onOpacityChange: (value: number) => void
}

function LayerToggle({ label, description, active, opacity, onToggle, onOpacityChange }: LayerToggleProps) {
  return (
    <div className="gis-layer-toggle">
      <div className="gis-layer-top">
        <div>
          <strong>{label}</strong>
          <p>{description}</p>
        </div>
        <button type="button" className={active ? 'is-active' : ''} onClick={onToggle}>
          {active ? 'On' : 'Off'}
        </button>
      </div>
      <label>
        <span>Opacity {Math.round(opacity * 100)}%</span>
        <input type="range" min={0.1} max={1} step={0.05} value={opacity} onChange={(event) => onOpacityChange(Number(event.target.value))} />
      </label>
    </div>
  )
}

export default memo(LayerToggle)
