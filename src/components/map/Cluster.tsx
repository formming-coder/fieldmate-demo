import L from 'leaflet'

export function createClusterIcon(count: number) {
  return L.divIcon({
    className: 'smart-cluster-wrap',
    html: `<div class="smart-cluster">${count}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })
}
