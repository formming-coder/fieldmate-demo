import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { BottomSheet } from '../components/ui'
import FilterChips, { SmartFilter } from '../components/map/FilterChips'
import GoogleMapCanvas from '../components/map/GoogleMapCanvas'
import MapHeader from '../components/map/MapHeader'
import SmartMapCanvas from '../components/map/SmartMapCanvas'
import { env, hasGoogleMapsApiKey } from '../config/env'
import { useLiveLocation } from '../hooks/useLiveLocation'
import { usePropertiesQuery } from '../hooks/useBackendQueries'
import { usePullToRefresh } from '../hooks/usePullToRefresh'
import { getOfflineQueueCounts } from '../lib/offline/queue'
import { formatThaiCurrency } from '../lib/locale'
import { Property } from '../types'
import '../styles/smartmap.css'

const DEFAULT_CENTER: [number, number] = [13.7563, 100.5018]

const PropertyGallery = lazy(() => import('../components/map/PropertyGallery'))

type MapLoadState = 'initializing' | 'loading' | 'ready' | 'error'

function mapPropertyType(type?: string) {
  const lower = (type || '').toLowerCase()
  if (lower.includes('land') || lower.includes('ที่ดิน')) return 'ที่ดินเปล่า'
  if (lower.includes('semi') || lower.includes('บ้านแฝด')) return 'บ้านแฝด'
  if (lower.includes('townhouse') || lower.includes('ทาวน์เฮ้าส์')) return 'ทาวน์เฮ้าส์'
  if (lower.includes('townhome') || lower.includes('ทาวน์โฮม')) return 'ทาวน์โฮม'
  if (lower.includes('commercial') || lower.includes('ตึกแถว') || lower.includes('พาณิชย์')) return 'ตึกแถว/อาคารพาณิชย์'
  return 'บ้านเดี่ยว'
}

function mapFilterMatches(type?: string, filter: SmartFilter) {
  const label = mapPropertyType(type)
  if (filter === 'all') return true
  if (filter === 'land') return label === 'ที่ดินเปล่า'
  if (filter === 'house') return label === 'บ้านเดี่ยว'
  if (filter === 'semi') return label === 'บ้านแฝด'
  if (filter === 'townhouse') return label === 'ทาวน์เฮ้าส์'
  if (filter === 'townhome') return label === 'ทาวน์โฮม'
  if (filter === 'commercial') return label === 'ตึกแถว/อาคารพาณิชย์'
  return true
}

function mapPropertyStatus(status?: string) {
  const lower = (status || '').toLowerCase()
  if (lower.includes('sold') || lower.includes('verified') || lower.includes('archived')) return 'ปิดรายการ'
  if (lower.includes('pending')) return 'รอตรวจสอบ'
  if (lower.includes('appraisal') || lower.includes('inspected')) return 'สำรวจแล้ว'
  return 'ประกาศ'
}

function propertySubtitle(property: Property) {
  return `${property.province} • ${mapPropertyType(property.type)}`
}

export default function SmartMap() {
  const navigate = useNavigate()
  const { data: properties = [], isLoading, refetch } = usePropertiesQuery()
  const [center, setCenter] = useState<[number, number] | null>(DEFAULT_CENTER)
  const [zoom, setZoom] = useState(13)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<SmartFilter>('all')
  const [mapLoadState, setMapLoadState] = useState<MapLoadState>('initializing')
  const [mapError, setMapError] = useState('')
  const [mapRetrySeed, setMapRetrySeed] = useState(0)
  const [mapProvider, setMapProvider] = useState<'google' | 'leaflet'>(() => (hasGoogleMapsApiKey() ? 'google' : 'leaflet'))
  const [isOffline, setIsOffline] = useState(() => (typeof navigator !== 'undefined' ? !navigator.onLine : false))
  const [actionMessage, setActionMessage] = useState('')
  const [queuedCount, setQueuedCount] = useState(() => getOfflineQueueCounts().total)
  const hasAutoCenteredRef = useRef(false)
  const { location, accuracyLevel, permission, error: gpsError, requestCurrentPosition } = useLiveLocation({ highAccuracy: true, watch: true, timeoutMs: 12000 })

  useEffect(() => {
    setMapLoadState('loading')
  }, [])

  useEffect(() => {
    const syncNetwork = () => setIsOffline(!navigator.onLine)
    const syncQueue = () => setQueuedCount(getOfflineQueueCounts().total)
    window.addEventListener('online', syncNetwork)
    window.addEventListener('offline', syncNetwork)
    window.addEventListener('fieldmate:offline-queue-updated', syncQueue)
    return () => {
      window.removeEventListener('online', syncNetwork)
      window.removeEventListener('offline', syncNetwork)
      window.removeEventListener('fieldmate:offline-queue-updated', syncQueue)
    }
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
    return [...properties]
      .filter((item) => mapFilterMatches(item.type, activeFilter))
      .sort((a, b) => new Date(b.lastInspection).getTime() - new Date(a.lastInspection).getTime())
  }, [activeFilter, properties])

  const selectedProperty = useMemo(
    () => properties.find((item) => item.id === selectedId) || null,
    [properties, selectedId]
  )

  const todayLabel = useMemo(
    () => new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()),
    []
  )

  const gpsLabel = useMemo(() => {
    if (!location) return 'GPS กำลังค้นหา'
    if (accuracyLevel === 'high') return `GPS แม่นยำ ${location.accuracy} ม.`
    if (accuracyLevel === 'medium') return `GPS ปานกลาง ${location.accuracy} ม.`
    return `GPS ต่ำ ${location.accuracy} ม.`
  }, [accuracyLevel, location])

  useEffect(() => {
    if (!location) return
    if (!hasAutoCenteredRef.current) {
      setCenter([location.latitude, location.longitude])
      setZoom(16)
      hasAutoCenteredRef.current = true
    }
  }, [location])

  useEffect(() => {
    if (!selectedId) return
    if (filteredProperties.some((item) => item.id === selectedId)) return
    setSelectedId(null)
  }, [filteredProperties, selectedId])

  const centerOnCurrentLocation = () => {
    if (location) {
      setCenter([location.latitude, location.longitude])
      setZoom(16)
    }
    requestCurrentPosition()
    setActionMessage('กำลังระบุตำแหน่งปัจจุบัน')
  }

  const centerOnProperty = (property: Property) => {
    setSelectedId(property.id)
    setCenter([property.latitude, property.longitude])
    setZoom(15)
  }

  const retryMap = () => {
    setMapError('')
    setMapLoadState('loading')
    setMapRetrySeed((current) => current + 1)
    requestCurrentPosition()
    void refetch()
  }

  const handleMapReady = () => {
    setMapLoadState('ready')
    setMapError('')
  }

  const handleGoogleMapError = (error: Error) => {
    console.error('[Fieldmate Map] Google Maps load failed', error)
    setMapProvider('leaflet')
    setMapError('')
    setMapLoadState('loading')
    setActionMessage('สลับไปใช้แผนที่สำรอง')
  }

  const handleLeafletMapError = (error: Error) => {
    console.error('[Fieldmate Map] Leaflet map load failed', error)
    setMapError('ไม่สามารถโหลดแผนที่สำรองได้')
    setMapLoadState('error')
  }

  const mapCenter = center || DEFAULT_CENTER
  const showMapSkeleton = isLoading || mapLoadState === 'initializing' || mapLoadState === 'loading'
  const showMapError = mapLoadState === 'error'
  const currentLocationText = location ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}` : 'กำลังค้นหาตำแหน่ง'
  const recentProperties = filteredProperties.slice(0, 6)

  return (
    <Layout title="แผนที่" immersive hideAssistant>
      <div className="field-map-page" {...pullToRefresh.bind}>
        <MapHeader todayLabel={todayLabel} offline={isOffline} gpsLabel={gpsLabel} queuedCount={queuedCount} />

        <div className={`field-map-pull-indicator ${pullToRefresh.isRefreshing ? 'visible' : ''}`} style={{ height: `${pullToRefresh.pullDistance}px` }}>
          {pullToRefresh.isRefreshing ? 'กำลังรีเฟรช' : 'ดึงลงเพื่อรีเฟรช'}
        </div>

        <div className="field-map-frame">
          {mapProvider === 'google' ? (
            <GoogleMapCanvas
              apiKey={env.googleMapsApiKey}
              center={mapCenter}
              zoom={zoom}
              mapMode="street"
              showTraffic={false}
              properties={filteredProperties}
              selectedId={selectedId}
              radiusKm={0.5}
              currentLocation={location}
              retrySeed={mapRetrySeed}
              measureMode={false}
              onMeasurePoint={() => {}}
              onPropertySelect={centerOnProperty}
              onReady={handleMapReady}
              onError={handleGoogleMapError}
            />
          ) : (
            <SmartMapCanvas
              key={`leaflet-${mapRetrySeed}`}
              center={mapCenter}
              zoom={zoom}
              mapMode="street"
              showTraffic={false}
              properties={filteredProperties}
              selectedId={selectedId}
              radiusKm={0.5}
              currentLocation={location}
              measureMode={false}
              onMeasurePoint={() => {}}
              onPropertySelect={centerOnProperty}
              onReady={handleMapReady}
              onError={handleLeafletMapError}
            />
          )}

          {showMapSkeleton ? (
            <div className="field-map-overlay" role="status" aria-live="polite">
              <div className="field-map-skeleton" />
              <div className="field-map-skeleton field-map-skeleton-line" />
              <div className="field-map-state-message">กำลังโหลดแผนที่...</div>
            </div>
          ) : null}

          {showMapError ? (
            <div className="field-map-overlay is-error" role="alert">
              <div className="field-map-error-card">
                <strong>ไม่สามารถโหลดแผนที่ได้</strong>
                <span>{mapError}</span>
                <button type="button" onClick={retryMap}>ลองใหม่</button>
              </div>
            </div>
          ) : null}

          {(permission === 'denied' || permission === 'unsupported' || gpsError) ? (
            <div className="field-map-gps-warning">
              <strong>ยังไม่ได้รับอนุญาตตำแหน่ง</strong>
              <span>{gpsError || (permission === 'unsupported' ? 'อุปกรณ์นี้ไม่รองรับ GPS' : 'กรุณาอนุญาตตำแหน่งเพื่อจัดศูนย์แผนที่อัตโนมัติ')}</span>
              <button type="button" onClick={requestCurrentPosition}>อนุญาตตำแหน่ง</button>
            </div>
          ) : null}

          <div className="field-map-current-pill">ตำแหน่งปัจจุบัน • {currentLocationText}</div>

          <div className="field-map-filter-rail">
            <FilterChips value={activeFilter} onChange={setActiveFilter} />
          </div>

          <button type="button" className="field-map-gps-fab" onClick={centerOnCurrentLocation} aria-label="ไปที่ตำแหน่งปัจจุบัน">
            <span className="material-symbols-rounded" aria-hidden="true">my_location</span>
          </button>

          <button type="button" className="field-map-capture-fab" onClick={() => navigate('/camera')}>
            <span className="material-symbols-rounded" aria-hidden="true">photo_camera</span>
            <span>บันทึก</span>
          </button>

          <div className="field-map-list-panel">
            <div className="field-map-list-header">
              <div>
                <strong>ทรัพย์ล่าสุด</strong>
                <span>{filteredProperties.length} รายการพร้อมใช้งาน</span>
              </div>
              <button type="button" onClick={() => navigate('/album')}>ดูทั้งหมด</button>
            </div>

            <div className="field-map-list-rail">
              {recentProperties.length ? recentProperties.map((property) => {
                const isSelected = property.id === selectedId
                return (
                  <button
                    key={property.id}
                    type="button"
                    className={`field-map-list-card ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => centerOnProperty(property)}
                  >
                    <img src={property.images[0]} alt={property.owner} />
                    <div>
                      <span>{mapPropertyType(property.type)}</span>
                      <strong>{property.owner}</strong>
                      <small>{formatThaiCurrency(property.marketPrice || 0)} • {mapPropertyStatus(property.status)}</small>
                    </div>
                  </button>
                )
              }) : (
                <div className="field-map-empty">ยังไม่มีทรัพย์ที่ตรงกับตัวกรองนี้</div>
              )}
            </div>
          </div>
        </div>

        <BottomSheet open={Boolean(selectedProperty)} onClose={() => setSelectedId(null)}>
          {selectedProperty ? (
            <div className="field-map-sheet">
              <section className="field-map-sheet-summary">
                <img src={selectedProperty.images[0]} alt={selectedProperty.owner} />
                <div>
                  <div className="field-map-sheet-title">{selectedProperty.owner}</div>
                  <div className="field-map-sheet-line">{propertySubtitle(selectedProperty)}</div>
                  <div className="field-map-sheet-line">ID: {selectedProperty.id} • {mapPropertyStatus(selectedProperty.status)}</div>
                  <div className="field-map-sheet-line">อัปเดตล่าสุด {new Date(selectedProperty.lastInspection).toLocaleDateString('th-TH')}</div>
                </div>
              </section>

              <section className="field-map-sheet-kpis">
                <div><span>ราคา</span><strong>{formatThaiCurrency(selectedProperty.marketPrice || 0)}</strong></div>
                <div><span>จังหวัด</span><strong>{selectedProperty.province}</strong></div>
                <div><span>เบอร์ผู้ขาย</span><strong>{selectedProperty.sellerPhone || 'ไม่ระบุ'}</strong></div>
                <div><span>พิกัด</span><strong>{selectedProperty.latitude.toFixed(5)}, {selectedProperty.longitude.toFixed(5)}</strong></div>
              </section>

              <Suspense fallback={<div className="field-map-gallery-skeleton" />}>
                <PropertyGallery images={selectedProperty.images} title={selectedProperty.owner} />
              </Suspense>

              <section className="field-map-sheet-actions">
                <button type="button" onClick={() => navigate(`/property/${selectedProperty.id}`)}>ดูรายละเอียด</button>
                <button type="button" onClick={() => navigate('/camera')}>บันทึกเพิ่ม</button>
                <button type="button" onClick={centerOnCurrentLocation}>ตำแหน่งของฉัน</button>
              </section>
            </div>
          ) : null}
        </BottomSheet>

        {actionMessage ? <div className="field-map-toast" role="status" aria-live="polite">{actionMessage}</div> : null}
      </div>
    </Layout>
  )
}
