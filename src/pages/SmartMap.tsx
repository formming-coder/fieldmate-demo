import { formatThaiCurrency } from '../lib/locale'
import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { usePropertiesQuery } from '../hooks/useBackendQueries'
import { usePullToRefresh } from '../hooks/usePullToRefresh'
import { useLiveLocation } from '../hooks/useLiveLocation'
import { Property } from '../types'
import { Circle, MapContainer, Marker, Polyline, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import MapHeader from '../components/map/MapHeader'
import FloatingSearch from '../components/map/FloatingSearch'
import FilterChips, { SmartFilter } from '../components/map/FilterChips'
import MapFAB from '../components/map/MapFAB'
import BottomSheet from '../components/map/BottomSheet'
import { createClusterIcon } from '../components/map/Cluster'
import { createPropertyMarkerIcon } from '../components/map/Marker'
import { getOfflineQueueCounts } from '../lib/offline/queue'
import { hasGoogleMapsApiKey } from '../config/env'
import 'leaflet/dist/leaflet.css'
import '../styles/smartmap.css'

const PropertyGallery = lazy(() => import('../components/map/PropertyGallery'))
const PropertyInfo = lazy(() => import('../components/map/PropertyInfo'))
const NearbyCarousel = lazy(() => import('../components/map/NearbyCarousel'))
const AITips = lazy(() => import('../components/map/AITips'))

const DEFAULT_CENTER: [number, number] = [13.736717, 100.523186]
const SATELLITE_TILES = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
const STREET_TILES = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const TERRAIN_TILES = 'https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}.jpg'

type MapMode = 'street' | 'satellite' | 'terrain'
type MapLoadState = 'initializing' | 'loading' | 'ready' | 'error'

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

function mapPropertyType(type?: string) {
  const lower = (type || '').toLowerCase()
  if (lower.includes('land')) return 'ที่ดิน'
  if (lower.includes('house')) return 'บ้านเดี่ยว'
  if (lower.includes('town')) return 'ทาวน์โฮม'
  if (lower.includes('condo')) return 'คอนโด'
  if (lower.includes('commercial')) return 'อาคารพาณิชย์'
  return 'ทรัพย์สิน'
}

function mapPropertyStatus(status?: string) {
  const lower = (status || '').toLowerCase()
  if (lower.includes('sold') || lower.includes('verified') || lower.includes('archived')) return 'ปิดรายการ'
  if (lower.includes('pending')) return 'รอตรวจสอบ'
  if (lower.includes('appraisal') || lower.includes('inspected')) return 'ประเมินแล้ว'
  return 'ประกาศขาย'
}

function thaiDate(value: string) {
  return new Date(value).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })
}

function UserPulseMarker({ onLocate }: { onLocate: (lat: number, lon: number) => void }) {
  const [position, setPosition] = useState<[number, number] | null>(null)

  useMapEvents({
    locationfound(event) {
      const next: [number, number] = [event.latlng.lat, event.latlng.lng]
      setPosition(next)
      onLocate(event.latlng.lat, event.latlng.lng)
    },
  })

  return position ? <Marker position={position} icon={L.divIcon({ className: 'smart-user-pulse' })} /> : null
}

function MapInteraction({ onLocate, measureMode, onMeasurePoint }: { onLocate: (lat: number, lon: number) => void; measureMode: boolean; onMeasurePoint: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(event) {
      if (measureMode) {
        onMeasurePoint(event.latlng.lat, event.latlng.lng)
        return
      }
      onLocate(event.latlng.lat, event.latlng.lng)
    },
  })

  return null
}

function distanceKm(from: [number, number], to: [number, number]) {
  const toRad = (value: number) => (value * Math.PI) / 180
  const earthRadiusKm = 6371
  const lat = toRad(to[0] - from[0])
  const lon = toRad(to[1] - from[1])
  const a = Math.sin(lat / 2) ** 2 + Math.cos(toRad(from[0])) * Math.cos(toRad(to[0])) * Math.sin(lon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return earthRadiusKm * c
}

function MapFlyTo({ center, zoom }: { center: [number, number] | null; zoom: number }) {
  const map = useMap()

  useEffect(() => {
    if (!center) return
    map.flyTo(center, zoom, { duration: 0.75 })
  }, [center, zoom, map])

  return null
}

function MapReadyWatcher({ onReady }: { onReady: () => void }) {
  const map = useMap()

  useEffect(() => {
    map.whenReady(() => {
      onReady()
    })
  }, [map, onReady])

  return null
}

function statusLabel(status: string) {
  if (status === 'verified') return 'ตรวจสอบแล้ว'
  if (status === 'pending') return 'รอตรวจสอบ'
  if (status === 'historical') return 'ข้อมูลย้อนหลัง'
  return 'ตรวจภาคสนามแล้ว'
}

function confidenceFromProperty(property: Property) {
  const base = Math.round((property.marketPrice % 10000000) / 180000)
  return Math.min(97, Math.max(72, base))
}

function readCompletedSurveyIds() {
  if (typeof window === 'undefined') return new Set<string>()
  try {
    const raw = window.localStorage.getItem('fieldmate-completed-surveys')
    return new Set(Object.keys(raw ? JSON.parse(raw) as Record<string, unknown> : {}))
  } catch {
    return new Set<string>()
  }
}

export default function SmartMap() {
  const navigate = useNavigate()
  const { data: properties = [], isLoading: loading, refetch } = usePropertiesQuery()
  const [center, setCenter] = useState<[number, number] | null>(DEFAULT_CENTER)
  const [zoom, setZoom] = useState(13)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<SmartFilter>('all')
  const [mapMode, setMapMode] = useState<MapMode>('street')
  const [showLayers, setShowLayers] = useState(false)
  const [showTraffic, setShowTraffic] = useState(true)
  const [showAITips, setShowAITips] = useState(true)
  const [isOffline, setIsOffline] = useState(() => (typeof navigator !== 'undefined' ? !navigator.onLine : false))
  const [queueCount, setQueueCount] = useState(() => getOfflineQueueCounts().total)
  const [measureMode, setMeasureMode] = useState(false)
  const [measurePoints, setMeasurePoints] = useState<Array<[number, number]>>([])
  const [mapLoadState, setMapLoadState] = useState<MapLoadState>('initializing')
  const [mapError, setMapError] = useState('')
  const [tileErrorCount, setTileErrorCount] = useState(0)
  const [mapRetrySeed, setMapRetrySeed] = useState(0)
  const [isMapBusy, setIsMapBusy] = useState(true)
  const [actionMessage, setActionMessage] = useState('')
  const [completedSurveyIds, setCompletedSurveyIds] = useState(readCompletedSurveyIds)
  const mapFrameRef = useRef<HTMLDivElement | null>(null)
  const hasAutoCenteredRef = useRef(false)
  const { location, accuracyLevel, permission, error: gpsError, requestCurrentPosition } = useLiveLocation({ highAccuracy: true, watch: true, timeoutMs: 12000 })
  const googleKeyReady = hasGoogleMapsApiKey()

  useEffect(() => {
    const onNetwork = () => {
      setIsOffline(!navigator.onLine)
    }

    window.addEventListener('online', onNetwork)
    window.addEventListener('offline', onNetwork)
    window.addEventListener('fieldmate:offline-queue-updated', onNetwork)

    return () => {
      window.removeEventListener('online', onNetwork)
      window.removeEventListener('offline', onNetwork)
      window.removeEventListener('fieldmate:offline-queue-updated', onNetwork)
    }
  }, [])

  useEffect(() => {
    const refreshSurveyStatus = () => setCompletedSurveyIds(readCompletedSurveyIds())
    window.addEventListener('fieldmate:survey-completed', refreshSurveyStatus)
    window.addEventListener('storage', refreshSurveyStatus)
    return () => {
      window.removeEventListener('fieldmate:survey-completed', refreshSurveyStatus)
      window.removeEventListener('storage', refreshSurveyStatus)
    }
  }, [])

  useEffect(() => {
    setQueueCount(getOfflineQueueCounts().total)
  }, [isOffline])

  useEffect(() => {
    if (!mapFrameRef.current || typeof ResizeObserver === 'undefined') return

    const target = mapFrameRef.current
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      if (entry.contentRect.height < 280) {
        setMapLoadState('error')
        setMapError('ความสูงพื้นที่แผนที่ไม่ถูกต้อง กรุณารีโหลดหน้าจอ')
      }
    })
    observer.observe(target)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!actionMessage) return
    const timer = window.setTimeout(() => setActionMessage(''), 2200)
    return () => window.clearTimeout(timer)
  }, [actionMessage])

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
  const selectedDistanceLabel = `${selectedDistance.toFixed(1)} กม.`

  const onLocate = (lat: number, lon: number) => {
    setCenter([lat, lon])
    setZoom(14)
  }

  const requestCurrentLocation = () => {
    setIsMapBusy(true)
    requestCurrentPosition()
    if (location) {
      setCenter([location.latitude, location.longitude])
      setZoom(16)
      setIsMapBusy(false)
    }
  }

  const requestCurrentGps = () => {
    requestCurrentLocation()
    setActionMessage('กำลังอัปเดต GPS ปัจจุบัน')
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

  useEffect(() => {
    if (!location) return
    if (!hasAutoCenteredRef.current) {
      setCenter([location.latitude, location.longitude])
      setZoom(16)
      hasAutoCenteredRef.current = true
    }
    setIsMapBusy(false)
  }, [location?.latitude, location?.longitude])

  const livePosition = location ? ([location.latitude, location.longitude] as [number, number]) : null

  const gpsLabel = useMemo(() => {
    if (!location) return 'GPS กำลังค้นหา'
    if (accuracyLevel === 'high') return `GPS แม่นยำ ${location.accuracy} ม.`
    if (accuracyLevel === 'medium') return `GPS ปานกลาง ${location.accuracy} ม.`
    return `GPS ต่ำ ${location.accuracy} ม.`
  }, [accuracyLevel, location])

  const addMeasurePoint = (lat: number, lon: number) => {
    setMeasurePoints((current) => {
      if (current.length >= 2) return [[lat, lon]]
      return [...current, [lat, lon]]
    })
  }

  const measureDistance = measurePoints.length === 2 ? distanceKm(measurePoints[0], measurePoints[1]) : 0

  const findNearbyProperty = () => {
    if (!location || !properties.length) return
    const nearest = [...properties].sort((a, b) => {
      const aDistance = Math.abs(a.latitude - location.latitude) + Math.abs(a.longitude - location.longitude)
      const bDistance = Math.abs(b.latitude - location.latitude) + Math.abs(b.longitude - location.longitude)
      return aDistance - bDistance
    })[0]
    if (!nearest) return
    centerOnProperty(nearest)
  }

  const openPropertyNavigation = () => {
    if (!selectedProperty) return
    const destination = `${selectedProperty.latitude},${selectedProperty.longitude}`
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`, '_blank', 'noopener,noreferrer')
  }

  const summaryNearbyForSale = useMemo(() => {
    if (!location) return 0
    return properties.filter((item) => {
      const distance = Math.abs(item.latitude - location.latitude) + Math.abs(item.longitude - location.longitude)
      const status = mapPropertyStatus(item.status)
      return distance <= 0.08 && status === 'ประกาศขาย'
    }).length
  }, [location, properties])

  const summaryTasksToday = useMemo(() => {
    return properties.filter((item) => {
      const date = new Date(item.lastInspection)
      const today = new Date()
      return date.toDateString() === today.toDateString()
    }).length
  }, [properties])

  const summarySaved = useMemo(() => properties.filter((item) => mapPropertyStatus(item.status) !== 'รอตรวจสอบ').length, [properties])

  const currentLocationText = location ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}` : 'กำลังค้นหาตำแหน่ง'

  const openNavigation = () => {
    if (!selectedProperty || typeof window === 'undefined') return
    const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedProperty.latitude},${selectedProperty.longitude}&travelmode=driving`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const tileUrl = mapMode === 'satellite' ? SATELLITE_TILES : mapMode === 'terrain' ? TERRAIN_TILES : STREET_TILES
  const attribution = mapMode === 'satellite' ? '&copy; Esri' : mapMode === 'terrain' ? '&copy; Stadia Maps & OpenMapTiles & OpenStreetMap contributors' : '&copy; OpenStreetMap contributors'

  const retryMap = () => {
    setMapError('')
    setTileErrorCount(0)
    setMapLoadState('initializing')
    setIsMapBusy(true)
    setMapRetrySeed((current) => current + 1)
    requestCurrentPosition()
    void refetch()
  }

  const showMapSkeleton = loading || mapLoadState === 'initializing' || mapLoadState === 'loading'
  const showMapError = mapLoadState === 'error'

  return (
    <Layout title="แผนที่อัจฉริยะ" immersive hideAssistant>
      <div className="smart-map-page" {...pullToRefresh.bind}>
        <MapHeader todayLabel={todayLabel} offline={isOffline} gpsLabel={gpsLabel} queuedCount={queueCount} />

        <div className={`smart-pull-indicator ${pullToRefresh.isRefreshing ? 'visible' : ''}`} style={{ height: `${pullToRefresh.pullDistance}px` }}>
          {pullToRefresh.isRefreshing ? 'กำลังโหลด...' : 'ดึงลงเพื่อรีเฟรช'}
        </div>

        <div className="smart-map-frame" ref={mapFrameRef}>
          <MapContainer key={`${mapRetrySeed}-${mapMode}`} center={center || DEFAULT_CENTER} zoom={zoom} zoomControl={false} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution={attribution}
              url={tileUrl}
              eventHandlers={{
                loading: () => {
                  setMapLoadState('loading')
                },
                load: () => {
                  setMapLoadState('ready')
                  setMapError('')
                  setTileErrorCount(0)
                },
                tileerror: () => {
                  setTileErrorCount((current) => {
                    const next = current + 1
                    if (next >= 4) {
                      setMapLoadState('error')
                      setMapError('ไม่สามารถโหลดแผนที่ได้ในขณะนี้ กรุณาตรวจสอบอินเทอร์เน็ตหรือคีย์แผนที่')
                    }
                    return next
                  })
                },
              }}
            />
            <MapReadyWatcher onReady={() => setMapLoadState((current) => (current === 'error' ? current : 'ready'))} />
            <MapFlyTo center={center} zoom={zoom} />
            <MapInteraction onLocate={onLocate} measureMode={measureMode} onMeasurePoint={addMeasurePoint} />
            <UserPulseMarker onLocate={onLocate} />
            <Circle center={center || DEFAULT_CENTER} radius={Math.max(140, location?.accuracy || 360)} pathOptions={{ color: '#2f8fff', fillColor: '#7cc4ff', fillOpacity: 0.2 }} />
            {livePosition ? <Marker position={livePosition} icon={L.divIcon({ className: 'smart-live-location-marker' })} /> : null}
            {measurePoints.length ? <Polyline positions={measurePoints} pathOptions={{ color: '#1d5eff', weight: 4, dashArray: '8 8' }} /> : null}
            {showTraffic ? <Polyline positions={[[13.729, 100.507], [13.734, 100.518], [13.742, 100.529], [13.753, 100.541]]} pathOptions={{ color: '#e34c2f', weight: 7, opacity: 0.5 }} /> : null}

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
                  icon={createPropertyMarkerIcon(property, selected, completedSurveyIds.has(property.id))}
                  eventHandlers={{ click: () => centerOnProperty(property) }}
                />
              )
            })}
          </MapContainer>

          {showMapSkeleton ? (
            <div className="smart-map-state-overlay" role="status" aria-live="polite">
              <div className="smart-map-skeleton" />
              <div className="smart-map-skeleton smart-map-skeleton-line" />
              <div className="smart-map-state-message">กำลังโหลดแผนที่...</div>
            </div>
          ) : null}

          {showMapError ? (
            <div className="smart-map-state-overlay is-error" role="alert">
              <div className="smart-map-error-card">
                <strong>ไม่สามารถแสดงแผนที่ได้</strong>
                <span>{mapError}</span>
                <button type="button" onClick={retryMap}>ลองใหม่อีกครั้ง</button>
              </div>
            </div>
          ) : null}

          {isMapBusy && !showMapSkeleton && !showMapError ? (
            <div className="smart-map-loading-chip" role="status" aria-live="polite">
              <span className="smart-map-spinner" aria-hidden="true" />
              <span>กำลังระบุตำแหน่ง...</span>
            </div>
          ) : null}

          {!googleKeyReady ? (
            <div className="smart-map-health-warning">ไม่พบคีย์แผนที่ในตัวแปรแวดล้อม ระบบจะใช้แผนที่สำรองเพื่อป้องกันหน้าจอว่าง</div>
          ) : null}

          {(permission === 'denied' || permission === 'unsupported' || gpsError) ? (
            <div className="smart-map-gps-warning">
              <strong>การเข้าถึง GPS มีปัญหา</strong>
              <span>{gpsError || (permission === 'unsupported' ? 'อุปกรณ์นี้ไม่รองรับ GPS' : 'กรุณาอนุญาตตำแหน่งเพื่อจัดศูนย์แผนที่อัตโนมัติ')}</span>
              <button type="button" onClick={requestCurrentPosition}>ลองขอสิทธิ์อีกครั้ง</button>
            </div>
          ) : null}

          <div className="smart-current-location-pill">ตำแหน่งปัจจุบัน: {currentLocationText}</div>

          <div className="smart-map-summary-card">
            <div><span>ตำแหน่งปัจจุบัน</span><strong>{currentLocationText}</strong></div>
            <div><span>ประกาศขายใกล้ฉัน</span><strong>{summaryNearbyForSale} รายการ</strong></div>
            <div><span>งานของวันนี้</span><strong>{summaryTasksToday} งาน</strong></div>
            <div><span>ทรัพย์ที่บันทึกไว้</span><strong>{summarySaved} รายการ</strong></div>
          </div>

          <div className="smart-map-floating-top">
            <FloatingSearch
              value={searchQuery}
              onChange={setSearchQuery}
              onVoice={() => {
                setSearchQuery('บ้านเดี่ยวใกล้สุขุมวิท')
                setActionMessage('เติมคำค้นหาด้วยเสียงสำหรับเดโมแล้ว')
              }}
            />
            <FilterChips value={activeFilter} onChange={setActiveFilter} />
          </div>

          <div className="smart-map-fabs">
            <MapFAB label="ค้นหา" icon="search" onClick={() => setActionMessage('โฟกัสช่องค้นหาแล้ว')} />
            <MapFAB label="ตัวกรอง" icon="tune" onClick={() => setShowLayers((current) => !current)} />
            <MapFAB label="GPS ปัจจุบัน" icon="my_location" onClick={requestCurrentGps} />
            <MapFAB label="ชั้นข้อมูล" icon="layers" onClick={() => setShowLayers((current) => !current)} />
            <MapFAB label="ทรัพย์ใกล้เคียง" icon="near_me" onClick={findNearbyProperty} />
            <MapFAB label="การจราจร" icon={showTraffic ? 'traffic' : 'route'} onClick={() => setShowTraffic((current) => !current)} />
            <MapFAB label="Compass" icon="explore" onClick={() => setZoom(13)} />
            <MapFAB label="ซูมเข้า" icon="add" onClick={() => setZoom((current) => Math.min(current + 1, 20))} />
            <MapFAB label="ซูมออก" icon="remove" onClick={() => setZoom((current) => Math.max(current - 1, 5))} />
            <MapFAB label="วัดระยะ" icon={measureMode ? 'straighten' : 'route'} onClick={() => {
              setMeasureMode((current) => !current)
              setMeasurePoints([])
            }} />
            <MapFAB label="คำแนะนำ AI" icon="auto_awesome" onClick={() => setShowAITips((current) => !current)} />
            {selectedProperty ? <MapFAB label="นำทาง" icon="navigation" onClick={openNavigation} /> : null}
            <MapFAB label="GIS อัจฉริยะ" icon="public" onClick={() => navigate('/gis')} />
            <MapFAB label="วางแผนเส้นทาง" icon="route" onClick={() => navigate('/route-planner')} />
          </div>

          <div className={`smart-layer-panel ${showLayers ? 'open' : ''}`}>
            <button type="button" className={mapMode === 'street' ? 'active' : ''} onClick={() => setMapMode('street')}>ถนน</button>
            <button type="button" className={mapMode === 'satellite' ? 'active' : ''} onClick={() => setMapMode('satellite')}>ดาวเทียม</button>
            <button type="button" className={mapMode === 'terrain' ? 'active' : ''} onClick={() => setMapMode('terrain')}>ภูมิประเทศ</button>
            <button type="button" className={showTraffic ? 'active' : ''} onClick={() => setShowTraffic((current) => !current)}>การจราจร</button>
          </div>

          {showAITips && selectedProperty ? (
            <Suspense fallback={null}>
              <AITips confidence={selectedConfidence} />
            </Suspense>
          ) : null}

          <div className="smart-map-meta-pills">
            <span>{filteredProperties.length} รายการ</span>
            <span>{mapMode === 'satellite' ? 'ดาวเทียม' : mapMode === 'terrain' ? 'ภูมิประเทศ' : 'ถนน'}</span>
            <span>{showTraffic ? 'Traffic เปิด' : 'Traffic ปิด'}</span>
            <span>{googleKeyReady ? 'คีย์แผนที่พร้อมใช้' : 'คีย์แผนที่ยังไม่พร้อม'}</span>
            {measurePoints.length === 2 ? <span>{measureDistance.toFixed(2)} กม.</span> : null}
            <button type="button" className="smart-map-gis-pill" onClick={() => navigate('/gis')}>GIS อัจฉริยะ</button>
            <button type="button" className="smart-map-gis-pill" onClick={() => navigate('/route-planner')}>วางแผนเส้นทาง</button>
          </div>
        </div>

        {!selectedProperty && !loading ? (
          <button type="button" className="smart-open-camera" onClick={() => navigate('/camera')}>เปิดกล้อง AI</button>
        ) : null}

        {actionMessage ? <div className="smart-map-action-toast" role="status" aria-live="polite">{actionMessage}</div> : null}
      </div>

      <BottomSheet open={Boolean(selectedProperty)} onClose={() => setSelectedId(null)}>
        {selectedProperty ? (
          <div className="smart-sheet-content">
            <section className="smart-sheet-summary">
              <img src={selectedProperty.images[0]} alt={selectedProperty.owner} />
              <div>
                <div className="smart-sheet-title">{selectedProperty.owner}</div>
                <div className="smart-sheet-line">{selectedProperty.province} • เขตสำรวจหลัก</div>
                <div className="smart-sheet-line">ID: {selectedProperty.id} • {mapPropertyType(selectedProperty.type)} • {completedSurveyIds.has(selectedProperty.id) ? 'สำรวจแล้ว' : mapPropertyStatus(selectedProperty.status)}</div>
                <div className="smart-sheet-line">อัปเดตล่าสุด {thaiDate(selectedProperty.lastInspection)}</div>
              </div>
            </section>

            <section className="smart-sheet-kpis">
              <div><span>ราคา</span><strong>{formatThaiCurrency(selectedProperty.marketPrice)}</strong></div>
              <div><span>ราคาต่อ ตร.ม.</span><strong>{formatThaiCurrency(Math.round(selectedProperty.marketPrice / 120))}</strong></div>
              <div><span>เจ้าของ</span><strong>{selectedProperty.owner}</strong></div>
              <div><span>ระยะห่างจาก Current Location</span><strong>{selectedDistanceLabel}</strong></div>
            </section>

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

            <section className="smart-sheet-actions">
              <button type="button" onClick={() => navigate(`/survey/${selectedProperty.id}`)}>{completedSurveyIds.has(selectedProperty.id) ? 'สำรวจอีกครั้ง' : 'เริ่มสำรวจ'}</button>
              <button type="button" onClick={() => navigate(`/property/${selectedProperty.id}`)}>ดูรายละเอียด</button>
              <button type="button" onClick={() => navigate('/assessment')}>เริ่มประเมิน</button>
              <button type="button" onClick={openPropertyNavigation}>นำทาง</button>
            </section>
          </div>
        ) : null}
      </BottomSheet>
    </Layout>
  )
}
