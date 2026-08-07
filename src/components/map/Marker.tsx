import L from 'leaflet'
import { Property } from '../../types'

function shortPrice(value: number) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `${Math.round(value / 1000)}K`
  return `${value}`
}

function typeEmoji(type?: string) {
  const lower = (type || '').toLowerCase()
  if (lower.includes('land')) return '🌾'
  if (lower.includes('house')) return '🏠'
  if (lower.includes('town')) return '🏘️'
  if (lower.includes('condo')) return '🏢'
  if (lower.includes('commercial')) return '🏬'
  return '📍'
}

export function createPropertyMarkerIcon(property: Property, selected: boolean) {
  return L.divIcon({
    className: 'smart-marker-wrap',
    html: `
      <div class="smart-marker ${selected ? 'smart-marker-selected' : 'smart-marker-normal'}">
        <span class="smart-marker-type">${typeEmoji(property.type)}</span>
        <span class="smart-marker-price">${shortPrice(property.marketPrice)}</span>
      </div>
    `,
    iconSize: [86, 36],
    iconAnchor: [43, 34],
  })
}
