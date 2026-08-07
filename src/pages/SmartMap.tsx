import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { fetchProperties, subscribeProperties, saveProperty } from '../api/mockApi'
import { Property } from '../types'
import teamMock from '../mock/team.json'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './smartmap.css'

const DEFAULT_CENTER: [number, number] = [13.736717, 100.523186]

type FilterState = {
  propertyType: string
  surveyDate: string
  priceRange: string
  surveyOfficer: string
  onlyMine: boolean
  team: boolean
  radius: number
  sort: 'newest' | 'oldest'
}

function LocationMarker({ onLocate }: { onLocate?: (lat: number, lon: number) => void }) {
  const [pos, setPos] = useState<[number, number] | null>(null)
  useMapEvents({
    locationfound(e) { setPos([e.latlng.lat, e.latlng.lng]); onLocate?.(e.latlng.lat, e.latlng.lng) },
  })
  return pos ? <Marker position={pos} icon={L.divIcon({ className: 'user-marker' })}><Popup>You are here</Popup></Marker> : null
}

export default function SmartMap() {
  const navigate = useNavigate()
  const [propsList, setPropsList] = useState<Property[]>([])
  const [center, setCenter] = useState<[number, number] | null>(null)
  const [selected, setSelected] = useState<Property | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterState>({
    propertyType: 'All',
    surveyDate: 'All',
    priceRange: 'All',
    surveyOfficer: 'All',
    onlyMine: false,
    team: true,
    radius: 3,
    sort: 'newest',
  })

  function cluster(list: Property[]) {
    const map = new Map<string, { lat: number; lon: number; count: number; items: Property[] }>()
    list.forEach((p) => {
      const key = `${p.latitude.toFixed(3)}|${p.longitude.toFixed(3)}`
      const entry = map.get(key)
      if (entry) {
        entry.count += 1
        entry.items.push(p)
      } else {
        map.set(key, { lat: p.latitude, lon: p.longitude, count: 1, items: [p] })
      }
    })
    return Array.from(map.values())
  }

  function typeColor(t?: string) {
    if (!t) return '#f59e0b'
    const lower = t.toLowerCase()
    if (lower.includes('land')) return '#16a34a'
    if (lower.includes('house')) return '#3b82f6'
    if (lower.includes('twin') || lower.includes('semi')) return '#8b5cf6'
    if (lower.includes('town')) return '#f59e0b'
    if (lower.includes('commercial')) return '#ef4444'
    if (lower.includes('condo') || lower.includes('condominium')) return '#eab308'
    return '#f59e0b'
  }

  useEffect(() => {
    let mounted = true
    fetchProperties().then((list) => { if (mounted) setPropsList(list) })
    const unsub = subscribeProperties((p) => setPropsList((prev) => [p, ...prev]))
    return () => { mounted = false; unsub() }
  }, [])

  const onLocate = (lat: number, lon: number) => { if (!center) setCenter([lat, lon]) }

  const onFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const urls = Array.from(files).map((f) => URL.createObjectURL(f))
    let lat = 0
    let lon = 0
    if (navigator.geolocation) {
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej))
        lat = pos.coords.latitude
        lon = pos.coords.longitude
      } catch (error) {
        // ignore
      }
    }
    await saveProperty({ owner: 'Field Officer', province: 'Unknown', latitude: lat, longitude: lon, marketPrice: 0, appraisalPrice: 0, status: 'inspected', lastInspection: new Date().toISOString(), images: urls })
    if (fileRef.current) fileRef.current.value = ''
  }

  const filteredProperties = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return propsList
      .filter((item) => {
        const matchesType = filters.propertyType === 'All' || item.type?.toLowerCase().includes(filters.propertyType.toLowerCase())
        const matchesOfficer = filters.surveyOfficer === 'All' || item.owner.toLowerCase().includes(filters.surveyOfficer.toLowerCase())
        const matchesPrice = filters.priceRange === 'All' || (filters.priceRange === 'Under 5M' ? item.marketPrice < 5000000 : item.marketPrice >= 5000000)
        const matchesQuery = !query || [item.owner, item.province, item.type || '', item.marketPrice.toString()].join(' ').toLowerCase().includes(query)
        return matchesType && matchesOfficer && matchesPrice && matchesQuery
      })
      .sort((a, b) => filters.sort === 'newest' ? new Date(b.lastInspection).getTime() - new Date(a.lastInspection).getTime() : new Date(a.lastInspection).getTime() - new Date(b.lastInspection).getTime())
  }, [propsList, searchQuery, filters])

  const clusters = cluster(filteredProperties)

  return (
    <Layout title="แผนที่อัจฉริยะ">
      <div className="map-shell">
        <div className="floating-search">
          <input placeholder="ค้นหาตำบล จังหวัด ราคา หรือเจ้าหน้าที่" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <div className="prop-count">{filteredProperties.length} จุด</div>
        </div>

        <div className="summary-card">
          <div>
            <div className="summary-label">ความครอบคลุมสำรวจสด</div>
            <div className="summary-title">วันนี้: <span>18</span> จุดบันทึกใกล้เคียง</div>
          </div>
          <div className="summary-badges">
            <button className="pill-button">3 กม.</button>
            <button className="pill-button active">5 กม.</button>
            <button className="pill-button">10 กม.</button>
          </div>
        </div>

        <div className="filter-strip">
          <select value={filters.propertyType} onChange={(e) => setFilters((prev) => ({ ...prev, propertyType: e.target.value }))}>
            <option value="All">ประเภททรัพย์สิน</option>
            <option value="Land">ที่ดินว่าง</option>
            <option value="House">บ้านเดี่ยว</option>
            <option value="Twin">ทาวน์เฮาส์คู่</option>
            <option value="Town">ทาวน์เฮาส์</option>
            <option value="Commercial">พาณิชย์</option>
            <option value="Condo">คอนโดมิเนียม</option>
          </select>
          <select value={filters.priceRange} onChange={(e) => setFilters((prev) => ({ ...prev, priceRange: e.target.value }))}>
            <option value="All">ช่วงราคา</option>
            <option value="Under 5M">ต่ำกว่า 5 ล้าน</option>
            <option value="5M+">5 ล้านขึ้นไป</option>
          </select>
          <select value={filters.surveyOfficer} onChange={(e) => setFilters((prev) => ({ ...prev, surveyOfficer: e.target.value }))}>
            <option value="All">เจ้าหน้าที่สำรวจ</option>
            <option value="Field Officer">เจ้าหน้าที่ภาคสนาม</option>
            <option value="Nina">นีนา</option>
            <option value="Korn">กร</option>
          </select>
          <select value={filters.sort} onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value as FilterState['sort'] }))}>
            <option value="newest">ล่าสุด</option>
            <option value="oldest">เก่าสุด</option>
          </select>
        </div>

        <div className="map-frame">
          <MapContainer center={center || DEFAULT_CENTER} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <LocationMarker onLocate={onLocate} />
            <Circle center={center || DEFAULT_CENTER} radius={filters.radius * 1000} pathOptions={{ color: '#f59e0b', fillColor: '#fde68a', fillOpacity: 0.12 }} />
            {clusters.map((c, idx) => {
              if (c.count > 1) {
                const clusterIcon = L.divIcon({ className: 'cluster-pin', html: `<div class="cluster-count">${c.count}</div>` })
                return <Marker key={`cluster-${idx}`} position={[c.lat, c.lon]} icon={clusterIcon} eventHandlers={{ click: () => setSelected(c.items[0]) }} />
              }
              const p = c.items[0]
              const color = typeColor(p.type)
              const propertyIcon = L.divIcon({ className: 'property-pin', html: `<div class="property-dot" style="background:${color}"></div>` })
              return <Marker key={p.id} position={[p.latitude, p.longitude]} icon={propertyIcon} eventHandlers={{ click: () => setSelected(p) }} />
            })}
            {filters.team ? teamMock.map((t) => <Marker key={t.id} position={[t.latitude, t.longitude]} icon={L.divIcon({ className: 'team-pin', html: `<img src="${t.avatar}" alt="team" />` })} />) : null}
          </MapContainer>

          <input type="file" ref={fileRef} accept="image/*" multiple style={{ display: 'none' }} onChange={onFiles} />
          <button className="fab-camera" onClick={() => fileRef.current?.click()} aria-label="ถ่ายภาพ">+</button>
          <button className="fab-small fab-loc" title="ศูนย์กลางที่ฉันอยู่">📍</button>
          <button className="fab-small fab-filter" title="ตัวกรองรัศมี">⚪</button>
        </div>
      </div>

      {selected && (
        <div className="bottom-sheet">
          <div className="sheet-handle" onClick={() => setSelected(null)} />
          <div className="sheet-content">
            <div className="sheet-image" style={{ backgroundImage: `url(${selected.images[0]})` }} />
            <div className="sheet-body">
              <div className="sheet-title">{selected.owner}</div>
              <div className="sheet-meta">{selected.province} • {selected.type || 'Property'}</div>
              <div className="sheet-meta">บันทึกเมื่อ {new Date(selected.lastInspection).toLocaleDateString('th-TH')}</div>
            </div>
          </div>
          <div className="sheet-actions">
            <button className="btn" onClick={() => navigate(`/property/${selected.id}`)}>เปิดรายละเอียด</button>
            <button className="btn ghost" onClick={() => navigator.clipboard?.writeText(`${selected.latitude},${selected.longitude}`)}>คัดลอกพิกัด</button>
          </div>
        </div>
      )}
    </Layout>
  )
}
