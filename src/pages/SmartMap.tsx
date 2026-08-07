import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { usePropertiesQuery } from '../hooks/useBackendQueries'
import { usePullToRefresh } from '../hooks/usePullToRefresh'
import { Property } from '../types'
import { Circle, MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import MapHeader from '../components/map/MapHeader'
import FloatingSearch from '../components/map/FloatingSearch'
import FilterChips, { SmartFilter } from '../components/map/FilterChips'
import MapFAB from '../components/map/MapFAB'
import BottomSheet from '../components/map/BottomSheet'
import { createClusterIcon } from '../components/map/Cluster'
import { createPropertyMarkerIcon } from '../components/map/Marker'
import 'leaflet/dist/leaflet.css'
import '../styles/smartmap.css'

const PropertyGallery = lazy(() => import('../components/map/PropertyGallery'))
const PropertyInfo = lazy(() => import('../components/map/PropertyInfo'))
const NearbyCarousel = lazy(() => import('../components/map/NearbyCarousel'))
const AITips = lazy(() => import('../components/map/AITips'))

const DEFAULT_CENTER: [number, number] = [13.736717, 100.523186]
const SATELLITE_TILES = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
const STREET_TILES = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

type ClusterNode = {
  lat: number
  lon: number
  items: Property[]
}

type NearbyItem = {
  property: Property
  distanceKm: number
  similarity: number
}

function UserPulseMarker({ onLocate }: { onLocate: (lat: number, lon: number) => void }) {
  const [position, setPosition] = useState<[number, number] | null>(null)

  useMapEvents({
    click(event) {
      onLocate(event.latlng.lat, event.latlng.lng)
    },
    locationfound(event) {
      const next: [number, number] = [event.latlng.lat, event.latlng.lng]
      setPosition(next)
      onLocate(event.latlng.lat, event.latlng.lng)
    },
  })

  return position ? <Marker position={position} icon={L.divIcon({ className: 'smart-user-pulse' })} /> : null
}

function MapFlyTo({ center, zoom }: { center: [number, number] | null; zoom: number }) {
  const map = useMap()

  useEffect(() => {
    if (!center) return
    map.flyTo(center, zoom, { duration: 0.75 })
  }, [center, zoom, map])

  return null
}

function statusLabel(status: string) {
  if (status === 'verified') return 'Verified'
  if (status === 'pending') return 'Pending'
  if (status === 'historical') return 'Historical'
  return 'Inspected'
}

function confidenceFromProperty(property: Property) {
  const base = Math.round((property.marketPrice % 10000000) / 180000)
  return Math.min(97, Math.max(72, base))
}

export default function SmartMap() {
  const navigate = useNavigate()
  const { data: properties = [], isLoading: loading, refetch } = usePropertiesQuery()
  const [center, setCenter] = useState<[number, number] | null>(DEFAULT_CENTER)
  const [zoom, setZoom] = useState(13)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<SmartFilter>('all')
  const [satelliteOn, setSatelliteOn] = useState(false)
  const [showLayers, setShowLayers] = useState(false)
  const [showAITips, setShowAITips] = useState(true)
  const [isOffline, setIsOffline] = useState(() => (typeof navigator !== 'undefined' ? !navigator.onLine : false))

  useEffect(() => {
    const onNetwork = () => {
      setIsOffline(!navigator.onLine)
    }

    window.addEventListener('online', onNetwork)
    window.addEventListener('offline', onNetwork)

    return () => {
      window.removeEventListener('online', onNetwork)
      window.removeEventListener('offline', onNetwork)
    }
  }, [])

  const refreshProperties = async () => {
    await refetch()
  }

  const pullToRefresh = usePullToRefresh(refreshProperties)

  const filteredProperties = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return properties
      .filter((item) => {
        const type = (item.type || '').toLowerCase()
        const matchesQuery = !query || [item.owner, item.province, item.type || '', item.marketPrice.toString()].join(' ').toLowerCase().includes(query)

        const matchesFilter = (() => {
          if (activeFilter === 'all') return true
          if (activeFilter === 'house') return type.includes('house')
          if (activeFilter === 'townhome') return type.includes('town') || type.includes('semi') || type.includes('twin')
          if (activeFilter === 'condo') return type.includes('condo')
          if (activeFilter === 'land') return type.includes('land')
          if (activeFilter === 'commercial') return type.includes('commercial')
          if (activeFilter === 'latest') {
            const inspectedAt = new Date(item.lastInspection).getTime()
            return Date.now() - inspectedAt < 1000 * 60 * 60 * 24 * 30
          }
          if (activeFilter === 'nearby') {
            if (!center) return true
            return Math.abs(item.latitude - center[0]) < 0.04 && Math.abs(item.longitude - center[1]) < 0.04
          }
          return true
        })()

        return matchesQuery && matchesFilter
      })
      .sort((a, b) => new Date(b.lastInspection).getTime() - new Date(a.lastInspection).getTime())
  }, [activeFilter, center, properties, searchQuery])

  const clusters = useMemo<ClusterNode[]>(() => {
    const grouped = new Map<string, ClusterNode>()

    filteredProperties.forEach((property) => {
      const key = `${property.latitude.toFixed(3)}|${property.longitude.toFixed(3)}`
      const existing = grouped.get(key)
      if (existing) {
        existing.items.push(property)
      } else {
        grouped.set(key, { lat: property.latitude, lon: property.longitude, items: [property] })
      }
    })

    return Array.from(grouped.values())
  }, [filteredProperties])

  const selectedProperty = useMemo(
    () => properties.find((item) => item.id === selectedId) || null,
    [properties, selectedId]
  )

  const nearbyProperties = useMemo<NearbyItem[]>(() => {
    if (!selectedProperty) return []

    return properties
      .filter((item) => item.id !== selectedProperty.id)
      .map((item, index) => ({
        property: item,
        distanceKm: Math.max(0.6, Math.abs(item.latitude - selectedProperty.latitude) * 90),
        similarity: Math.min(98, Math.max(72, 92 - index * 4)),
      }))
      .slice(0, 10)
  }, [properties, selectedProperty])

  const selectedConfidence = selectedProperty ? confidenceFromProperty(selectedProperty) : 0
  const selectedDistance = nearbyProperties[0]?.distanceKm || 0.9

  const onLocate = (lat: number, lon: number) => {
    setCenter([lat, lon])
    setZoom(14)
  }

  const requestCurrentLocation = () => {
    navigator.geolocation?.getCurrentPosition((position) => {
      setCenter([position.coords.latitude, position.coords.longitude])
      setZoom(15)
    })
  }

  const centerOnProperty = (property: Property) => {
    setSelectedId(property.id)
    setCenter([property.latitude, property.longitude])
    setZoom(15)
  }

  const todayLabel = useMemo(
    () => new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()),
    []
  )

  return (
    <Layout title="แผนที่อัจฉริยะ" immersive hideAssistant>
      <div className="smart-map-page" {...pullToRefresh.bind}>
        <MapHeader todayLabel={todayLabel} offline={isOffline} />

        <div className={`smart-pull-indicator ${pullToRefresh.isRefreshing ? 'visible' : ''}`} style={{ height: `${pullToRefresh.pullDistance}px` }}>
          {pullToRefresh.isRefreshing ? 'Refreshing...' : 'Pull to refresh'}
        </div>

        <div className="smart-map-frame">
          <MapContainer center={center || DEFAULT_CENTER} zoom={zoom} zoomControl={false} style={{ height: '100%', width: '100%' }}>
            <TileLayer attribution={satelliteOn ? '&copy; Esri' : '&copy; OpenStreetMap contributors'} url={satelliteOn ? SATELLITE_TILES : STREET_TILES} />
            <MapFlyTo center={center} zoom={zoom} />
            <UserPulseMarker onLocate={onLocate} />
            <Circle center={center || DEFAULT_CENTER} radius={1200} pathOptions={{ color: '#FFC107', fillColor: '#FFE28A', fillOpacity: 0.14 }} />

            {clusters.map((node, index) => {
              if (node.items.length > 1) {
                return (
                  <Marker
                    key={`cluster-${index}`}
                    position={[node.lat, node.lon]}
                    icon={createClusterIcon(node.items.length)}
                    eventHandlers={{
                      click: () => {
                        setCenter([node.lat, node.lon])
                        setZoom((current) => Math.min(current + 1, 18))
                        setSelectedId(node.items[0].id)
                      },
                    }}
                  />
                )
              }

              const property = node.items[0]
              const selected = selectedId === property.id
              return (
                <Marker
                  key={property.id}
                  position={[property.latitude, property.longitude]}
                  icon={createPropertyMarkerIcon(property, selected)}
                  eventHandlers={{ click: () => centerOnProperty(property) }}
                />
              )
            })}
          </MapContainer>

          <div className="smart-map-floating-top">
            <FloatingSearch value={searchQuery} onChange={setSearchQuery} />
            <FilterChips value={activeFilter} onChange={setActiveFilter} />
          </div>

          <div className="smart-map-fabs">
            <MapFAB label="Current Location" icon="my_location" onClick={requestCurrentLocation} />
            <MapFAB label="Compass" icon="explore" onClick={() => setZoom(13)} />
            <MapFAB label="Layer" icon="layers" onClick={() => setShowLayers((current) => !current)} />
            <MapFAB label="AI Suggest" icon="auto_awesome" onClick={() => setShowAITips((current) => !current)} />
            <MapFAB label="GIS Intelligence" icon="public" onClick={() => navigate('/gis')} />
            <MapFAB label="Route Planner" icon="route" onClick={() => navigate('/route-planner')} />
          </div>

          <div className={`smart-layer-panel ${showLayers ? 'open' : ''}`}>
            <button type="button" className={!satelliteOn ? 'active' : ''} onClick={() => setSatelliteOn(false)}>Street</button>
            <button type="button" className={satelliteOn ? 'active' : ''} onClick={() => setSatelliteOn(true)}>Satellite</button>
          </div>

          {showAITips && selectedProperty ? (
            <Suspense fallback={null}>
              <AITips confidence={selectedConfidence} />
            </Suspense>
          ) : null}

          <div className="smart-map-meta-pills">
            <span>{filteredProperties.length} results</span>
            <span>{satelliteOn ? 'Satellite' : 'Street'}</span>
            <button type="button" className="smart-map-gis-pill" onClick={() => navigate('/gis')}>GIS Intelligence</button>
            <button type="button" className="smart-map-gis-pill" onClick={() => navigate('/route-planner')}>Route Planner</button>
          </div>
        </div>

        {!selectedProperty && !loading ? (
          <button type="button" className="smart-open-camera" onClick={() => navigate('/camera')}>Open AI Camera</button>
        ) : null}
      </div>

      <BottomSheet open={Boolean(selectedProperty)} onClose={() => setSelectedId(null)}>
        {selectedProperty ? (
          <>
            <Suspense fallback={<div className="smart-gallery-skeleton" />}>
              <PropertyGallery images={selectedProperty.images} title={selectedProperty.owner} />
            </Suspense>

            <Suspense fallback={<div className="smart-info-skeleton" />}>
              <PropertyInfo
                property={selectedProperty}
                aiConfidence={selectedConfidence}
                distanceKm={selectedDistance}
                statusLabel={statusLabel(selectedProperty.status)}
              />
            </Suspense>

            <Suspense fallback={null}>
              <NearbyCarousel items={nearbyProperties} onSelect={centerOnProperty} />
            </Suspense>
          </>
        ) : null}
      </BottomSheet>
    </Layout>
  )
}
