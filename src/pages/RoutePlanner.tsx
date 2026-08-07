import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { usePropertiesQuery } from '../hooks/useBackendQueries'
import { Property } from '../types'
import { Circle, MapContainer, Marker, Polyline, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import RouteCard from '../components/route-planner/RouteCard'
import TripSummary from '../components/route-planner/TripSummary'
import PropertyStop, { RouteStop } from '../components/route-planner/PropertyStop'
import TravelAnalytics from '../components/route-planner/TravelAnalytics'
import OfflineDownload from '../components/route-planner/OfflineDownload'
import RiskAlert from '../components/route-planner/RiskAlert'
import NavigationBottomSheet from '../components/route-planner/NavigationBottomSheet'
import 'leaflet/dist/leaflet.css'
import '../styles/route-planner.css'

const AIRecommendation = lazy(() => import('../components/route-planner/AIRecommendation'))
const NearbyProperty = lazy(() => import('../components/route-planner/NearbyProperty'))

const DEFAULT_CENTER: [number, number] = [13.736717, 100.523186]
const STREET_TILES = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const itemHeight = 168

type OptimizeMode = 'Shortest Distance' | 'Fastest Time' | 'Lowest Fuel' | 'Highest Priority' | 'Balanced'
type RouteMode = 'Driving' | 'Walking' | 'Motorcycle' | 'Public Transport'

function optimizeModeLabel(mode: OptimizeMode) {
  if (mode === 'Shortest Distance') return 'ระยะทางสั้นที่สุด'
  if (mode === 'Fastest Time') return 'เร็วที่สุด'
  if (mode === 'Lowest Fuel') return 'ประหยัดน้ำมันที่สุด'
  if (mode === 'Highest Priority') return 'ลำดับความสำคัญสูงสุด'
  return 'สมดุล'
}

function routeModeLabel(mode: RouteMode) {
  if (mode === 'Driving') return 'รถยนต์'
  if (mode === 'Walking') return 'เดินเท้า'
  if (mode === 'Motorcycle') return 'รถจักรยานยนต์'
  return 'ขนส่งสาธารณะ'
}

function MapFlyTo({ center, zoom }: { center: [number, number] | null; zoom: number }) {
  const map = useMap()

  useEffect(() => {
    if (!center) return
    map.flyTo(center, zoom, { duration: 0.7 })
  }, [center, zoom, map])

  return null
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

  return position ? <Marker position={position} icon={L.divIcon({ className: 'rp-user-pulse' })} /> : null
}

function stopIcon(status: RouteStop['status'], index: number) {
  const cls = status === 'completed' ? 'rp-marker-completed' : status === 'visited' ? 'rp-marker-visited' : 'rp-marker-pending'
  return L.divIcon({
    className: 'rp-marker-wrap',
    html: `<div class="rp-marker ${cls}">${index + 1}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  })
}

function buildStops(properties: Property[]): RouteStop[] {
  const owners = ['สมชาย', 'นีนา', 'กร', 'มะลิ', 'อ้อม', 'พงศ์', 'สุดา', 'อนันต์', 'ปรีชา', 'เมย์']
  const roads = ['สุขุมวิท', 'บางนา-ตราด', 'พระราม 9', 'เพชรบุรี', 'สีลม', 'อ่อนนุช']
  return properties.slice(0, 30).map((property, index) => ({
    id: property.id,
    title: `${index + 1}. ${property.owner}`,
    address: `${index + 8}/${index + 22} ${roads[index % roads.length]}, ${property.province}`,
    owner: owners[index % owners.length],
    phone: `08${(772300 + index).toString()}`,
    priority: index % 4 === 0 ? 'High' : index % 3 === 0 ? 'Medium' : 'Low',
    arrivalTime: `${String(9 + Math.floor(index / 2)).padStart(2, '0')}:${index % 2 === 0 ? '05' : '40'}`,
    inspectionTime: `${25 + (index % 4) * 5} นาที`,
    status: index < 2 ? 'completed' : index < 4 ? 'visited' : 'pending',
    image: property.images[0],
  }))
}

export default function RoutePlanner() {
  const navigate = useNavigate()
  const { data: properties = [] } = usePropertiesQuery()
  const [stops, setStops] = useState<RouteStop[]>([])
  const [center, setCenter] = useState<[number, number] | null>(DEFAULT_CENTER)
  const [zoom, setZoom] = useState(12)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [optimizeMode, setOptimizeMode] = useState<OptimizeMode>('Balanced')
  const [routeMode, setRouteMode] = useState<RouteMode>('Driving')
  const [downloaded, setDownloaded] = useState(false)
  const [showTraffic] = useState(true)
  const [showFlood] = useState(true)
  const [showForest] = useState(true)
  const [scrollTop, setScrollTop] = useState(0)
  const [actionMessage, setActionMessage] = useState('')

  useEffect(() => {
    setStops(buildStops(properties))
    if (!selectedId) {
      setSelectedId(properties[0]?.id || null)
    }
  }, [properties, selectedId])

  const selectedStop = stops.find((stop) => stop.id === selectedId) || null
  const routeLine = useMemo(() => {
    return properties.slice(0, stops.length).map((property) => [property.latitude, property.longitude] as [number, number])
  }, [properties, stops.length])

  const optimizedStops = useMemo(() => {
    const next = [...stops]
    if (optimizeMode === 'Highest Priority') {
      next.sort((a, b) => a.priority.localeCompare(b.priority))
    } else if (optimizeMode === 'Lowest Fuel') {
      next.sort((a, b) => a.address.localeCompare(b.address))
    } else if (optimizeMode === 'Fastest Time') {
      next.sort((a, b) => a.arrivalTime.localeCompare(b.arrivalTime))
    } else if (optimizeMode === 'Shortest Distance') {
      next.reverse()
    }
    return next
  }, [optimizeMode, stops])

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 2)
  const visibleCount = 6
  const visibleStops = optimizedStops.slice(startIndex, startIndex + visibleCount)
  const totalHeight = optimizedStops.length * itemHeight

  const nearbySuggestions = useMemo(() => [
      { title: 'ทรัพย์สินใกล้เคียง', type: 'ข้อมูลภาคสนาม', distance: '0.7 กม.' },
      { title: 'ข้อมูลตลาดใกล้เคียง', type: 'ราคาทรัพย์เปรียบเทียบ', distance: '1.1 กม.' },
      { title: 'ข้อมูลส่วนกลางใกล้เคียง', type: 'อัปโหลดล่าสุด', distance: '0.9 กม.' },
      { title: 'ทรัพย์เปรียบเทียบใกล้เคียง', type: 'อ้างอิงการประเมิน', distance: '1.4 กม.' },
      { title: 'สถานที่สำคัญใกล้เคียง', type: 'โรงเรียน / ตลาด', distance: '0.5 กม.' },
  ], [])

  const timelineItems = useMemo(() => [
    { time: '08:30', title: 'ออกจากสำนักงาน' },
    { time: '09:05', title: 'ทรัพย์จุดที่ 1' },
    { time: '09:45', title: 'ทรัพย์จุดที่ 2' },
    { time: '10:40', title: 'ทรัพย์จุดที่ 3' },
    { time: '12:00', title: 'พักกลางวัน' },
    { time: '13:10', title: 'เดินทางต่อ' },
    { time: '17:20', title: 'สิ้นสุดภารกิจ' },
  ], [])

  const onLocate = (lat: number, lon: number) => {
    setCenter([lat, lon])
    setZoom(14)
  }

  useEffect(() => {
    if (!actionMessage) return
    const timer = window.setTimeout(() => setActionMessage(''), 2200)
    return () => window.clearTimeout(timer)
  }, [actionMessage])

  const requestCurrentLocation = () => {
    if (!navigator.geolocation) {
      setActionMessage('อุปกรณ์นี้ไม่รองรับ GPS')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocate(position.coords.latitude, position.coords.longitude)
        setActionMessage('อัปเดตตำแหน่งปัจจุบันแล้ว')
      },
      () => setActionMessage('ไม่สามารถดึงตำแหน่งปัจจุบันได้ กรุณาตรวจสอบสิทธิ์ GPS')
    )
  }

  const applyRouteOptimization = () => {
    if (!optimizedStops.length) {
      setActionMessage('ยังไม่มีข้อมูลเส้นทางให้ปรับ')
      return
    }

    const first = optimizedStops[0]
    const firstProperty = properties.find((item) => item.id === first.id)
    if (firstProperty) {
      setCenter([firstProperty.latitude, firstProperty.longitude])
      setZoom(14)
    }
    setActionMessage(`ปรับเส้นทางเป็นโหมด${optimizeModeLabel(optimizeMode)} (${routeModeLabel(routeMode)}) แล้ว`)
  }

  return (
    <Layout title="วางแผนเส้นทาง" immersive hideAssistant>
      <div className="rp-page">
        <div className="rp-map-shell">
          <MapContainer center={center || DEFAULT_CENTER} zoom={zoom} zoomControl={false} style={{ height: '100%', width: '100%' }}>
            <TileLayer attribution="&copy; OpenStreetMap contributors" url={STREET_TILES} />
            <MapFlyTo center={center} zoom={zoom} />
            <UserPulseMarker onLocate={onLocate} />
            {showTraffic ? <Polyline positions={[[13.731, 100.503], [13.737, 100.514], [13.744, 100.528], [13.756, 100.541]]} pathOptions={{ color: '#ea6a2b', weight: 6, opacity: 0.6 }} /> : null}
            {showForest ? <Circle center={[13.759, 100.49]} radius={1400} pathOptions={{ color: '#1c8f49', fillColor: '#45bf72', fillOpacity: 0.18, weight: 2 }} /> : null}
            {showFlood ? <Circle center={[13.727, 100.543]} radius={1100} pathOptions={{ color: '#3b83ff', fillColor: '#6fa8ff', fillOpacity: 0.16, weight: 2 }} /> : null}
            <Polyline positions={routeLine} pathOptions={{ color: '#141922', weight: 4, opacity: 0.8 }} />
            {properties.slice(0, stops.length).map((property, index) => {
              const stop = optimizedStops.find((item) => item.id === property.id)
              if (!stop) return null
              return (
                <Marker
                  key={property.id}
                  position={[property.latitude, property.longitude]}
                  icon={stopIcon(stop.status, index)}
                  eventHandlers={{
                    click: () => {
                      setSelectedId(property.id)
                      setCenter([property.latitude, property.longitude])
                      setZoom(15)
                    },
                  }}
                />
              )
            })}
          </MapContainer>

          <div className="rp-floating-top">
            <RouteCard title="ตารางงานวันนี้" startLocation="ศูนย์ปฏิบัติการหลัก" currentGps="13.7367, 100.5232" finishTime="17:20" stopCount={optimizedStops.length} />
            <TripSummary properties={12} distanceKm={42} estimatedTime="5 ชม. 40 นาที" fuelCost={320} efficiency={94} />
          </div>

          <div className="rp-floating-controls">
            <button type="button" aria-label="ระบุตำแหน่งปัจจุบัน" onClick={requestCurrentLocation}>📍</button>
            <button type="button" aria-label="เปิดแผนที่อัจฉริยะ" onClick={() => navigate('/map')}>🗺</button>
            <button type="button" aria-label="รีเซ็ตการซูม" onClick={() => setZoom(12)}>🧭</button>
          </div>

          <div className="rp-ai-float">
            <strong>ผู้ช่วย AI</strong>
            <span>มีเส้นทางสำรองผ่านพระราม 9 เพื่อหลีกเลี่ยงการจราจรหนาแน่นช่วง 10:00 น.</span>
          </div>
        </div>

        <div className="rp-content">
          <section className="rp-card">
            <div className="rp-eyebrow">ปรับเส้นทาง</div>
            <h2>กลยุทธ์เส้นทางด้วย AI</h2>
            <div className="rp-chip-row">
              {(['Shortest Distance', 'Fastest Time', 'Lowest Fuel', 'Highest Priority', 'Balanced'] as OptimizeMode[]).map((mode) => (
                <button key={mode} type="button" className={optimizeMode === mode ? 'is-active' : ''} onClick={() => setOptimizeMode(mode)}>{optimizeModeLabel(mode)}</button>
              ))}
            </div>
            <div className="rp-chip-row">
              {(['Driving', 'Walking', 'Motorcycle', 'Public Transport'] as RouteMode[]).map((mode) => (
                <button key={mode} type="button" className={routeMode === mode ? 'is-active' : ''} onClick={() => setRouteMode(mode)}>{routeModeLabel(mode)}</button>
              ))}
            </div>
            <button type="button" className="rp-primary-btn" onClick={applyRouteOptimization}>ปรับเส้นทางแบบ {optimizeModeLabel(optimizeMode)}</button>
          </section>

          <Suspense fallback={<div className="rp-card">กำลังโหลดคำแนะนำจาก AI...</div>}>
            <AIRecommendation items={[
              'ควรเข้าทรัพย์จุดที่ 4 ก่อน เนื่องจากเจ้าของอยู่ถึงเวลา 14:00 น.',
              'คาดว่าการจราจรจะหนาแน่นหลัง 10:00 น. แถวแนวสุขุมวิท',
              'มีโอกาสฝนหลังเที่ยง ควรเร่งงานภายนอกให้เสร็จก่อนช่วงบ่าย',
              'มีคำเตือนเส้นทางใกล้พื้นที่ป่าทางตอนเหนือ ควรคงลำดับปัจจุบันเพื่อความปลอดภัย',
              'ความเสี่ยงน้ำท่วมใกล้แนวคลองอาจเพิ่มเวลาอีก 12 นาที หากเลื่อนไปช่วงบ่าย',
            ]} />
          </Suspense>

          <section className="rp-card">
            <div className="rp-eyebrow">ไทม์ไลน์อัจฉริยะ</div>
            <h2>ลำดับการลงพื้นที่</h2>
            <div className="rp-timeline-list">
              {timelineItems.map((item) => (
                <div key={`${item.time}-${item.title}`} className="rp-timeline-item">
                  <strong>{item.time}</strong>
                  <span>{item.title}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rp-card">
            <div className="rp-eyebrow">จุดหมายทรัพย์สิน</div>
            <h2>คิวงานตรวจสอบ</h2>
            <div className="rp-virtual-list" onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}>
              <div style={{ height: totalHeight, position: 'relative' }}>
                {visibleStops.map((stop, index) => {
                  const absoluteIndex = startIndex + index
                  return (
                    <div key={stop.id} style={{ position: 'absolute', top: absoluteIndex * itemHeight, left: 0, right: 0 }}>
                      <PropertyStop
                        stop={stop}
                        onOpen={() => setSelectedId(stop.id)}
                        onCall={() => {
                          window.location.href = `tel:${stop.phone}`
                          setActionMessage(`กำลังโทรหา ${stop.owner}`)
                        }}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          <TravelAnalytics distance="42 กม." drivingTime="3 ชม. 05 นาที" idleTime="22 นาที" inspectionTime="2 ชม. 13 นาที" fuelEstimate="320 บาท" carbonSaving="11%" />

          <Suspense fallback={<div className="rp-card">กำลังโหลดคำแนะนำใกล้เคียง...</div>}>
            <NearbyProperty items={nearbySuggestions} />
          </Suspense>

          <RiskAlert items={[
            { title: 'พื้นที่เสี่ยงน้ำท่วม', detail: 'มีน้ำขังปานกลางใกล้เส้นทางแนวคลอง', tone: 'flood' },
            { title: 'พื้นที่ป่า', detail: 'มีแนวกันชนริมถนนใกล้จุดหมายเลข 9', tone: 'forest' },
            { title: 'ปิดการจราจร', detail: 'มีการก่อสร้างและลดช่องทางหลังเวลา 15:00 น.', tone: 'road' },
            { title: 'จุดเสี่ยง', detail: 'ทางเข้ามีแสงน้อยหลังพระอาทิตย์ตก', tone: 'danger' },
            { title: 'งานก่อสร้าง', detail: 'การขยายเส้นทางในอนาคตอาจทำให้การลงทางด่วนล่าช้า', tone: 'construction' },
          ]} />

          <OfflineDownload downloaded={downloaded} pendingUpload={4} cachedRecords={optimizedStops.length} onDownload={() => setDownloaded(true)} />

          {actionMessage ? <div className="rp-toast" role="status" aria-live="polite">{actionMessage}</div> : null}
        </div>
      </div>

      <NavigationBottomSheet open={Boolean(selectedStop)} stop={selectedStop} onClose={() => setSelectedId(null)} onAssessment={() => navigate('/assessment')} />
    </Layout>
  )
}
