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
          label={key === 'forest' ? 'พื้นที่ป่า' : key === 'flood' ? 'พื้นที่น้ำท่วม' : key === 'urban' ? 'ผังเมือง' : key === 'expropriation' ? 'แนวเวนคืน' : key === 'landuse' ? 'การใช้ที่ดิน' : key === 'government' ? 'ที่ดินภาครัฐ' : key === 'satellite' ? 'ภาพดาวเทียม' : key === 'road' ? 'โครงข่ายถนน' : key === 'railway' ? 'แนวรถไฟ' : key === 'transit' ? 'แนวรถไฟฟ้า' : key === 'expressway' ? 'ทางด่วน' : key === 'river' ? 'แม่น้ำ' : key === 'canal' ? 'คลอง' : 'สาธารณูปโภค'}
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
