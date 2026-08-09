import React, { useEffect, useMemo, useRef } from 'react'
import { Circle, MapContainer, Marker, Polyline, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Property } from '../../types'
import { createClusterIcon } from './Cluster'
import { createPropertyMarkerIcon } from './Marker'

type MapMode = 'street' | 'satellite' | 'terrain'

type SmartMapCanvasProps = {
  center: [number, number]
  zoom: number
  mapMode: MapMode
  showTraffic: boolean
  properties: Property[]
  selectedId: string | null
  radiusKm: number
  currentLocation: { latitude: number; longitude: number; accuracy: number } | null
  measureMode: boolean
  onMeasurePoint: (latitude: number, longitude: number) => void
  onPropertySelect: (property: Property) => void
  onReady: () => void
  onError?: (error: Error) => void
}

type ClusterNode = {
  lat: number
  lon: number
  items: Property[]
}

const TILE_SOURCES: Record<MapMode, { url: string; attribution: string }> = {
  street: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri',
  },
  terrain: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors, &copy; OpenTopoMap',
  },
}

function MapFlyTo({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()

  useEffect(() => {
    map.invalidateSize()
    map.flyTo(center, zoom, { duration: 0.8 })
  }, [center, map, zoom])

  return null
}

function MapReady() {
  const map = useMap()

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      map.invalidateSize()
    })
    return () => window.cancelAnimationFrame(frame)
  }, [map])

  return null
}

function MapClickHandler({ measureMode, onMeasurePoint }: { measureMode: boolean; onMeasurePoint: (latitude: number, longitude: number) => void }) {
  useMapEvents({
    click(event) {
      if (!measureMode) return
      onMeasurePoint(event.latlng.lat, event.latlng.lng)
    },
  })

  return null
}

function buildTrafficPath(center: [number, number]) {
  return [
    [center[0] - 0.009, center[1] - 0.014],
    [center[0] - 0.004, center[1] - 0.007],
    [center[0] + 0.001, center[1] - 0.001],
    [center[0] + 0.006, center[1] + 0.006],
    [center[0] + 0.012, center[1] + 0.013],
  ] as Array<[number, number]>
}

export default function SmartMapCanvas({
  center,
  zoom,
  mapMode,
  showTraffic,
  properties,
  selectedId,
  radiusKm,
  currentLocation,
  measureMode,
  onMeasurePoint,
  onPropertySelect,
  onReady,
  onError,
}: SmartMapCanvasProps) {
  const clusters = useMemo<ClusterNode[]>(() => {
    const grouped = new Map<string, ClusterNode>()
    properties.forEach((property) => {
      const key = `${property.latitude.toFixed(3)}|${property.longitude.toFixed(3)}`
      const current = grouped.get(key)
      if (current) current.items.push(property)
      else grouped.set(key, { lat: property.latitude, lon: property.longitude, items: [property] })
    })
    return Array.from(grouped.values())
  }, [properties])

  const trafficPath = useMemo(() => buildTrafficPath(center), [center])
  const hasSignaledReadyRef = useRef(false)
  const signalReadyOnce = () => {
    if (hasSignaledReadyRef.current) return
    hasSignaledReadyRef.current = true
    onReady()
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      zoomControl={false}
      className="smart-google-map smart-leaflet-map"
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution={TILE_SOURCES[mapMode].attribution}
        url={TILE_SOURCES[mapMode].url}
        eventHandlers={{
          load: signalReadyOnce,
          tileerror: () => {
            signalReadyOnce()
            onError?.(new Error('ไม่สามารถโหลดแผนที่สำรองได้'))
          },
        }}
      />
      <MapReady />
      <MapFlyTo center={center} zoom={zoom} />
      <MapClickHandler measureMode={measureMode} onMeasurePoint={onMeasurePoint} />

      {currentLocation ? (
        <>
          <Marker
            position={[currentLocation.latitude, currentLocation.longitude]}
            icon={L.divIcon({ className: 'smart-user-pulse', iconSize: [20, 20], iconAnchor: [10, 10] })}
          />
          <Circle
            center={[currentLocation.latitude, currentLocation.longitude]}
            radius={radiusKm * 1000}
            pathOptions={{ color: '#0f8b58', fillColor: '#bcebd3', fillOpacity: 0.12, weight: 2 }}
          />
        </>
      ) : null}

      {showTraffic ? <Polyline positions={trafficPath} pathOptions={{ color: '#ea6a2b', weight: 5, opacity: 0.55 }} /> : null}

      {clusters.map((node, index) => {
        if (node.items.length > 1) {
          return (
            <Marker
              key={`smart-cluster-${node.lat}-${node.lon}`}
              position={[node.lat, node.lon]}
              icon={createClusterIcon(node.items.length)}
              eventHandlers={{
                click: () => {
                  onPropertySelect(node.items[0])
                },
              }}
            />
          )
        }

        const property = node.items[0]
        const selected = property.id === selectedId

        return (
          <Marker
            key={property.id}
            position={[property.latitude, property.longitude]}
            icon={createPropertyMarkerIcon(property, selected)}
            eventHandlers={{
              click: () => onPropertySelect(property),
            }}
          />
        )
      })}
    </MapContainer>
  )
}
