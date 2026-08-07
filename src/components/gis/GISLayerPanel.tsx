import React, { memo } from 'react'
import LayerToggle from './LayerToggle'

export type GISLayerKey =
  | 'forest'
  | 'flood'
  | 'urban'
  | 'expropriation'
  | 'landuse'
  | 'government'
  | 'satellite'
  | 'road'
  | 'railway'
  | 'transit'
  | 'expressway'
  | 'river'
  | 'canal'
  | 'utility'

export type GISLayerState = Record<GISLayerKey, { active: boolean; opacity: number; description: string }>

type GISLayerPanelProps = {
  open: boolean
  layers: GISLayerState
  onToggle: (key: GISLayerKey) => void
  onOpacityChange: (key: GISLayerKey, value: number) => void
}

function GISLayerPanel({ open, layers, onToggle, onOpacityChange }: GISLayerPanelProps) {
  if (!open) return null

  return (
    <aside className="gis-layer-panel">
      {Object.entries(layers).map(([key, value]) => (
        <LayerToggle
          key={key}
          label={key === 'urban' ? 'City Plan (ผังเมือง)' : key === 'transit' ? 'BTS / MRT' : key === 'road' ? 'Road Network' : key.charAt(0).toUpperCase() + key.slice(1)}
          description={value.description}
          active={value.active}
          opacity={value.opacity}
          onToggle={() => onToggle(key as GISLayerKey)}
          onOpacityChange={(next) => onOpacityChange(key as GISLayerKey, next)}
        />
      ))}
    </aside>
  )
}

export default memo(GISLayerPanel)
