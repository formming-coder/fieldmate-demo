import L from 'leaflet'

export function createClusterIcon(count: number) {
  return L.divIcon({
    className: 'smart-cluster-wrap',
    html: `<div class="smart-cluster">${count}</div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  })
}
