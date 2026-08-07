import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { usePropertiesQuery } from '../hooks/useBackendQueries'
import { Property } from '../types'
import { Circle, MapContainer, Marker, Polyline, Rectangle, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import BottomSheet from '../components/map/BottomSheet'
import { createClusterIcon } from '../components/map/Cluster'
import { createPropertyMarkerIcon } from '../components/map/Marker'
import GISLayerPanel, { GISLayerKey, GISLayerState } from '../components/gis/GISLayerPanel'
import ForestOverlay from '../components/gis/ForestOverlay'
import FloodOverlay from '../components/gis/FloodOverlay'
import UrbanOverlay from '../components/gis/UrbanOverlay'
import ExpropriationOverlay from '../components/gis/ExpropriationOverlay'
import LegendCard from '../components/gis/LegendCard'
import { formatThaiCurrency } from '../lib/locale'
import 'leaflet/dist/leaflet.css'
import '../styles/gis.css'

const NearbyAnalysis = lazy(() => import('../components/gis/NearbyAnalysis'))
const SpatialInsight = lazy(() => import('../components/gis/SpatialInsight'))
const RiskDashboard = lazy(() => import('../components/gis/RiskDashboard'))
const GISSummary = lazy(() => import('../components/gis/GISSummary'))

const DEFAULT_CENTER: [number, number] = [13.736717, 100.523186]
const SATELLITE_TILES = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
const STREET_TILES = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

type ClusterNode = {
  lat: number
  lon: number
  items: Property[]
}

function MapFlyTo({ center, zoom }: { center: [number, number] | null; zoom: number }) {
  const map = useMap()

  useEffect(() => {
    if (!center) return
    map.flyTo(center, zoom, { duration: 0.85 })
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

  return position ? <Marker position={position} icon={L.divIcon({ className: 'gis-user-pulse' })} /> : null
}

function mapTypeLabel(type?: string) {
  const lower = (type || '').toLowerCase()
  if (lower.includes('land')) return 'ที่ดิน'
  if (lower.includes('condo')) return 'คอนโดมิเนียม'
  if (lower.includes('commercial')) return 'พาณิชยกรรม'
  if (lower.includes('town')) return 'ทาวน์โฮม'
  return 'บ้านเดี่ยว'
}

function poiIcon(label: string) {
  return L.divIcon({
    className: 'gis-poi-wrap',
    html: `<div class="gis-poi-marker">${label}</div>`,
    iconSize: [76, 28],
    iconAnchor: [38, 14],
  })
}

export default function GISHome() {
  const navigate = useNavigate()
  const { data: properties = [], refetch } = usePropertiesQuery()
  const [center, setCenter] = useState<[number, number] | null>(DEFAULT_CENTER)
  const [zoom, setZoom] = useState(13)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showLayers, setShowLayers] = useState(true)
  const [satelliteOn, setSatelliteOn] = useState(true)
  const [radius, setRadius] = useState('1km')
  const [offline, setOffline] = useState(() => !navigator.onLine)
  const [layers, setLayers] = useState<GISLayerState>({
    forest: { active: true, opacity: 0.78, description: 'เขตคุ้มครอง ป่าสงวน และแนวกันชน' },
    flood: { active: true, opacity: 0.7, description: 'ความเสี่ยงน้ำท่วม ทางระบายน้ำ และระดับน้ำย้อนหลัง' },
    urban: { active: true, opacity: 0.75, description: 'ที่อยู่อาศัย พาณิชยกรรม อุตสาหกรรม และผังเมืองแบบผสม' },
    expropriation: { active: true, opacity: 0.72, description: 'แนวขยายถนน แนวรถไฟ และโครงสร้างพื้นฐานในอนาคต' },
    landuse: { active: true, opacity: 0.66, description: 'เขตการใช้ที่ดินและตัวชี้วัดการใช้ประโยชน์แบบผสม' },
    government: { active: false, opacity: 0.6, description: 'ที่ดินภาครัฐและแปลงจำกัดการใช้' },
    satellite: { active: true, opacity: 1, description: 'ภาพถ่ายดาวเทียมความละเอียดสูง' },
    road: { active: true, opacity: 0.82, description: 'การเข้าถึงโครงข่ายถนนและการจัดประเภทถนน' },
    railway: { active: true, opacity: 0.7, description: 'แนวเส้นทางรถไฟและอิทธิพลสถานี' },
    transit: { active: true, opacity: 0.74, description: 'แนว BTS / MRT และพื้นที่อิทธิพลของสถานี' },
    expressway: { active: true, opacity: 0.76, description: 'การเข้าถึงทางด่วนและทางขึ้นลงในอนาคต' },
    river: { active: true, opacity: 0.58, description: 'อิทธิพลของแม่น้ำสายหลักและบริบทระยะร่น' },
    canal: { active: true, opacity: 0.55, description: 'โครงข่ายคลองและแนวทางระบายน้ำ' },
    utility: { active: false, opacity: 0.68, description: 'แนวสาธารณูปโภคไฟฟ้า น้ำประปา และโครงข่ายบริการ' },
  })

  useEffect(() => {
    if (properties.length && !selectedId) {
      setSelectedId(properties[0]?.id || null)
    }
  }, [properties, selectedId])

  useEffect(() => {

    const onNetwork = () => setOffline(!navigator.onLine)
    window.addEventListener('online', onNetwork)
    window.addEventListener('offline', onNetwork)

    return () => {
      window.removeEventListener('online', onNetwork)
      window.removeEventListener('offline', onNetwork)
    }
  }, [])

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

  const selectedProperty = useMemo(() => properties.find((item) => item.id === selectedId) || properties[0] || null, [properties, selectedId])

  const nearbyPlaces = useMemo(() => {
    const scale = radius === '500m' ? 0.5 : radius === '1km' ? 1 : radius === '3km' ? 3 : 5
    return [
      { label: 'โรงพยาบาลบางนาเจเนอรัล', distance: `${(0.6 * scale).toFixed(1)} กม.`, type: 'โรงพยาบาล' },
      { label: 'โรงเรียนสุขุมวิท', distance: `${(0.8 * scale).toFixed(1)} กม.`, type: 'โรงเรียน' },
      { label: 'สถานีตำรวจเขต', distance: `${(0.9 * scale).toFixed(1)} กม.`, type: 'ตำรวจ' },
      { label: 'สำนักงานที่ดิน', distance: `${(1.2 * scale).toFixed(1)} กม.`, type: 'หน่วยงานรัฐ' },
      { label: 'เมก้าพลาซ่า', distance: `${(1.4 * scale).toFixed(1)} กม.`, type: 'ศูนย์การค้า' },
      { label: 'สถานีบริการน้ำมัน', distance: `${(0.7 * scale).toFixed(1)} กม.`, type: 'ปั๊มน้ำมัน' },
      { label: 'ตลาดชุมชน', distance: `${(0.5 * scale).toFixed(1)} กม.`, type: 'ตลาด' },
    ]
  }, [radius])

  const nearbyMapMarkers = useMemo(() => {
    if (!selectedProperty) return []
    return nearbyPlaces.slice(0, 5).map((item, index) => ({
      ...item,
      lat: selectedProperty.latitude + 0.004 * (index + 1),
      lon: selectedProperty.longitude + (index % 2 === 0 ? 0.0035 : -0.003),
    }))
  }, [nearbyPlaces, selectedProperty])

  const riskItems = useMemo(() => [
    { key: 'น้ำท่วม', score: 42 },
    { key: 'พื้นที่ป่า', score: 18 },
    { key: 'กฎหมาย', score: 56 },
    { key: 'สิ่งแวดล้อม', score: 38 },
    { key: 'การเข้าถึง', score: 27 },
    { key: 'สาธารณูปโภค', score: 35 },
  ], [])

  const onLocate = (lat: number, lon: number) => {
    setCenter([lat, lon])
    setZoom(15)
  }

  const refreshMap = async () => {
    await refetch()
  }

  const toggleLayer = (key: GISLayerKey) => {
    setLayers((current) => {
      const next = { ...current, [key]: { ...current[key], active: !current[key].active } }
      if (key === 'satellite') setSatelliteOn(next[key].active)
      return next
    })
  }

  const updateOpacity = (key: GISLayerKey, value: number) => {
    setLayers((current) => ({ ...current, [key]: { ...current[key], opacity: value } }))
  }

  return (
    <Layout title="GIS อัจฉริยะ" immersive hideAssistant>
      <div className="gis-page">
        <header className="gis-header">
          <div>
            <div className="gis-title">GIS อัจฉริยะ</div>
            <div className="gis-subtitle">{selectedProperty ? `${selectedProperty.owner} • ${selectedProperty.province}` : 'ทรัพย์สินปัจจุบัน'}</div>
          </div>
          <div className="gis-header-actions">
            <button type="button" onClick={refreshMap}>รีเฟรช</button>
            <button type="button" onClick={() => setShowLayers((current) => !current)}>ชั้นข้อมูล</button>
          </div>
        </header>

        <div className="gis-map-frame">
          <MapContainer center={center || DEFAULT_CENTER} zoom={zoom} zoomControl={false} style={{ height: '100%', width: '100%' }}>
            <TileLayer attribution={satelliteOn ? '&copy; Esri' : '&copy; OpenStreetMap contributors'} url={satelliteOn ? SATELLITE_TILES : STREET_TILES} />
            <MapFlyTo center={center} zoom={zoom} />
            <UserPulseMarker onLocate={onLocate} />
            {selectedProperty ? <Circle center={[selectedProperty.latitude, selectedProperty.longitude]} radius={radius === '500m' ? 500 : radius === '1km' ? 1000 : radius === '3km' ? 3000 : 5000} pathOptions={{ color: '#ffbf24', fillColor: '#ffe188', fillOpacity: 0.08 }} /> : null}
            {layers.forest.active ? <ForestOverlay opacity={layers.forest.opacity} /> : null}
            {layers.flood.active ? <FloodOverlay opacity={layers.flood.opacity} /> : null}
            {layers.urban.active ? <UrbanOverlay opacity={layers.urban.opacity} /> : null}
            {layers.expropriation.active ? <ExpropriationOverlay opacity={layers.expropriation.opacity} /> : null}
            {layers.government.active ? <Rectangle bounds={[[13.751, 100.517], [13.759, 100.529]]} pathOptions={{ color: '#7f5bc9', fillColor: '#9c84dd', fillOpacity: layers.government.opacity * 0.22, weight: 2 }} /> : null}
            {layers.road.active ? <Polyline positions={[[13.728, 100.501], [13.737, 100.512], [13.749, 100.526], [13.766, 100.543]]} pathOptions={{ color: '#484848', weight: 4, opacity: Math.max(0.45, layers.road.opacity) }} /> : null}
            {layers.railway.active ? <Polyline positions={[[13.733, 100.494], [13.748, 100.509], [13.764, 100.523]]} pathOptions={{ color: '#5c3b22', weight: 3, opacity: Math.max(0.45, layers.railway.opacity), dashArray: '10 6' }} /> : null}
            {layers.transit.active ? <Polyline positions={[[13.725, 100.516], [13.739, 100.525], [13.753, 100.537]]} pathOptions={{ color: '#0aa4d8', weight: 5, opacity: Math.max(0.45, layers.transit.opacity) }} /> : null}
            {layers.expressway.active ? <Polyline positions={[[13.741, 100.487], [13.751, 100.505], [13.762, 100.526], [13.774, 100.545]]} pathOptions={{ color: '#e5742b', weight: 5, opacity: Math.max(0.45, layers.expressway.opacity) }} /> : null}
            {layers.river.active ? <Polyline positions={[[13.721, 100.496], [13.729, 100.506], [13.741, 100.519], [13.751, 100.532]]} pathOptions={{ color: '#2f93d2', weight: 6, opacity: Math.max(0.4, layers.river.opacity) }} /> : null}
            {layers.canal.active ? <Polyline positions={[[13.744, 100.499], [13.748, 100.515], [13.753, 100.531]]} pathOptions={{ color: '#69b7ef', weight: 3, opacity: Math.max(0.35, layers.canal.opacity), dashArray: '4 7' }} /> : null}
            {layers.utility.active ? <Polyline positions={[[13.737, 100.508], [13.746, 100.517], [13.757, 100.528]]} pathOptions={{ color: '#ffd24e', weight: 3, opacity: Math.max(0.4, layers.utility.opacity), dashArray: '2 8' }} /> : null}
            {clusters.map((node, index) => {
              if (node.items.length > 1) {
                return (
                  <Marker
                    key={`gis-cluster-${index}`}
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
              const selected = property.id === selectedId
              return (
                <Marker
                  key={property.id}
                  position={[property.latitude, property.longitude]}
                  icon={createPropertyMarkerIcon(property, selected)}
                  eventHandlers={{ click: () => {
                    setSelectedId(property.id)
                    setCenter([property.latitude, property.longitude])
                    setZoom(15)
                  } }}
                />
              )
            })}
            {nearbyMapMarkers.map((item) => (
              <Marker key={`${item.label}-${item.distance}`} position={[item.lat, item.lon]} icon={poiIcon(item.type.slice(0, 2))} />
            ))}
          </MapContainer>

          <GISLayerPanel open={showLayers} layers={layers} onToggle={toggleLayer} onOpacityChange={updateOpacity} />

          <div className="gis-floating-actions">
            <button type="button" onClick={() => navigator.geolocation?.getCurrentPosition((position) => onLocate(position.coords.latitude, position.coords.longitude))}>📍</button>
            <button type="button" onClick={() => setZoom(13)}>🧭</button>
            <button type="button" onClick={() => navigate('/map')}>🗺</button>
          </div>

          <div className="gis-status-pills">
            <span>{offline ? 'ข้อมูลแคชออฟไลน์' : 'ชั้นข้อมูลสด'}</span>
            <span>{properties.length} แปลง</span>
          </div>
        </div>
      </div>

      <BottomSheet open={Boolean(selectedProperty)} onClose={() => setSelectedId(null)}>
        {selectedProperty ? (
          <div className="gis-sheet-content">
            <section className="gis-hero-card">
              <div>
                <div className="gis-property-type">{mapTypeLabel(selectedProperty.type)}</div>
                <h2>{selectedProperty.owner}</h2>
                <p>{selectedProperty.province} • {selectedProperty.latitude.toFixed(4)}, {selectedProperty.longitude.toFixed(4)}</p>
              </div>
              <strong>{formatThaiCurrency(selectedProperty.marketPrice)}</strong>
            </section>

            <LegendCard title="ชั้นข้อมูลป่า" items={[{ label: 'พื้นที่คุ้มครอง', color: '#39b86a' }, { label: 'ป่าสงวน', color: '#0f8a46' }, { label: 'แนวกันชน', color: '#83d27d' }]} />
            <LegendCard title="ชั้นข้อมูลน้ำท่วม" items={[{ label: 'ต่ำ', color: '#8ec2ff' }, { label: 'ปานกลาง', color: '#5f9cff' }, { label: 'สูง', color: '#3d7dff' }]} />
            <LegendCard title="ผังเมือง" items={[{ label: 'ที่อยู่อาศัย', color: '#ffd35a' }, { label: 'พาณิชย์', color: '#ef9b5f' }, { label: 'เกษตรกรรม', color: '#8bc16e' }]} />

            <Suspense fallback={<div className="gis-panel-card">กำลังโหลดการวิเคราะห์ใกล้เคียง...</div>}>
              <NearbyAnalysis radius={radius} onRadiusChange={setRadius} items={nearbyPlaces} />
              <SpatialInsight
                riskScore={44}
                text={[
                  'มีประวัติน้ำท่วมในแนวระบายน้ำฝั่งตะวันออก แต่จุดศูนย์กลางของแปลงยังอยู่นอกพื้นที่เสี่ยงสูงสุด',
                  'การขยายทางด่วนและรถไฟในอนาคตอาจช่วยเพิ่มการเข้าถึง แต่ทำให้การตรวจสอบด้านกฎหมายซับซ้อนขึ้น',
                  'ข้อจำกัดด้านพื้นที่ป่าอยู่ในระดับต่ำ แต่ความใกล้คลองอาจมีผลต่อระยะร่นและการจัดการน้ำ',
                ]}
              />
              <RiskDashboard items={riskItems} />
              <GISSummary
                findings={[
                  'ทรัพย์สินตั้งอยู่ในแนวเติบโตแบบผสมระหว่างที่อยู่อาศัยและคมนาคม',
                  'การเข้าถึงถนนหลักและระบบขนส่งอยู่ในเกณฑ์ดีภายในรัศมี 1 กิโลเมตร',
                  'ความเสี่ยงน้ำท่วมอยู่ในระดับปานกลางและควรสะท้อนในข้อคิดเห็นการประเมิน',
                ]}
                warnings={[
                  'แนวเวนคืนตัดผ่านพื้นที่ขยายถนนในอนาคต',
                  'แนวระบายน้ำต้องได้รับการตรวจสอบด้านกฎหมายและโครงสร้างพื้นฐานก่อนสรุปมูลค่า',
                ]}
                recommendation="สามารถดำเนินการประเมินต่อได้โดยใช้สมมติฐานความเสี่ยงระดับปานกลาง และควรขอแผนที่ทางกฎหมายยืนยันแนวขยายถนนเพิ่มเติม"
              />
            </Suspense>

            <section className="gis-panel-card">
              <div className="gis-section-title">เปรียบเทียบทรัพย์สิน</div>
              <div className="gis-compare-row">
                <div><span>รายการปัจจุบัน</span><strong>{selectedProperty.owner}</strong><em>น้ำท่วม 42 • การเข้าถึง 27</em></div>
                <div><span>ทรัพย์เปรียบเทียบ A</span><strong>บางนา ไพรม์ A</strong><em>น้ำท่วม 35 • การเข้าถึง 31</em></div>
                <div><span>ทรัพย์เปรียบเทียบ B</span><strong>สุขุมวิท โกรท B</strong><em>น้ำท่วม 48 • การเข้าถึง 22</em></div>
              </div>
            </section>

            <section className="gis-panel-card">
              <div className="gis-section-title">ไทม์ไลน์</div>
              <div className="gis-timeline-list">
                <div><strong>ข้อมูลย้อนหลัง</strong><span>ร่องรอยน้ำท่วมลดลงหลังการปรับปรุงระบบระบายน้ำในปี 2566</span></div>
                <div><strong>แผนในอนาคต</strong><span>การปรับปรุงผังเมืองชี้ว่าพื้นที่นี้จะเป็นแนวเติบโตแบบผสมภายในปี 2571</span></div>
                <div><strong>โครงสร้างพื้นฐาน</strong><span>รถไฟและทางด่วนในอนาคตอาจช่วยเพิ่มคะแนนการเข้าถึง</span></div>
              </div>
            </section>

            <div className="gis-inline-actions">
              <button type="button" onClick={() => navigate(`/property/${selectedProperty.id}`)}>รายละเอียดทรัพย์</button>
              <button type="button" onClick={() => navigate('/map')}>เปิดแผนที่อัจฉริยะ</button>
              <button type="button" onClick={() => navigate('/assessment')}>เปิดหน้าประเมิน</button>
            </div>
          </div>
        ) : null}
      </BottomSheet>
    </Layout>
  )
}
