import L from 'leaflet'
import { Property } from '../../types'

function shortPrice(value: number) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)} ล.`
  if (value >= 1000) return `${Math.round(value / 1000)} พัน`
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

function markerStatus(property: Property) {
  const raw = `${property.status || ''}`.toLowerCase()
  if (raw.includes('sold') || raw.includes('verified') || raw.includes('archived')) {
    return { key: 'sold', label: 'ปิดรายการ' }
  }
  if (raw.includes('pending')) {
    return { key: 'pending', label: 'รอตรวจสอบ' }
  }
  if (raw.includes('appraisal') || raw.includes('inspected')) {
    return { key: 'appraisal', label: 'ประเมินแล้ว' }
  }
  return { key: 'for-sale', label: 'ประกาศขาย' }
}

function markerTypeLabel(type?: string) {
  const lower = (type || '').toLowerCase()
  if (lower.includes('land')) return 'ที่ดิน'
  if (lower.includes('house')) return 'บ้านเดี่ยว'
  if (lower.includes('town')) return 'ทาวน์โฮม'
  if (lower.includes('condo')) return 'คอนโด'
  if (lower.includes('commercial')) return 'พาณิชย์'
  return 'ทรัพย์สิน'
}

export function createPropertyMarkerIcon(property: Property, selected: boolean, surveyed = false) {
  const status = surveyed ? { key: 'surveyed', label: 'สำรวจแล้ว' } : markerStatus(property)
  return L.divIcon({
    className: 'smart-marker-wrap',
    html: `
      <div class="smart-marker ${selected ? 'smart-marker-selected' : 'smart-marker-normal'} smart-marker-status-${status.key}">
        <span class="smart-marker-type">${typeEmoji(property.type)}</span>
        <span class="smart-marker-price">${shortPrice(property.marketPrice)} บาท</span>
        <span class="smart-marker-id">${property.id}</span>
        <span class="smart-marker-status">${status.label}</span>
        <span class="smart-marker-meta">${markerTypeLabel(property.type)}</span>
      </div>
    `,
    iconSize: [124, 52],
    iconAnchor: [62, 48],
  })
}
