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
  const owners = ['Somchai', 'Nina', 'Korn', 'Mali', 'Aom', 'Pong', 'Suda', 'Anan', 'Preecha', 'May']
  const roads = ['Sukhumvit', 'Bangna-Trad', 'Rama 9', 'Phetchaburi', 'Silom', 'On Nut']
  return properties.slice(0, 30).map((property, index) => ({
    id: property.id,
    title: `${index + 1}. ${property.owner}`,
    address: `${index + 8}/${index + 22} ${roads[index % roads.length]}, ${property.province}`,
    owner: owners[index % owners.length],
    phone: `08${(772300 + index).toString()}`,
    priority: index % 4 === 0 ? 'High' : index % 3 === 0 ? 'Medium' : 'Low',
    arrivalTime: `${String(9 + Math.floor(index / 2)).padStart(2, '0')}:${index % 2 === 0 ? '05' : '40'}`,
    inspectionTime: `${25 + (index % 4) * 5} min`,
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
    { title: 'Nearby Properties', type: 'Field records', distance: '0.7 km' },
    { title: 'Nearby Market Data', type: 'Comparable pricing', distance: '1.1 km' },
    { title: 'Nearby Shared Intelligence', type: 'Recent uploads', distance: '0.9 km' },
    { title: 'Nearby Comparables', type: 'Appraisal references', distance: '1.4 km' },
    { title: 'Nearby Amenities', type: 'School / Market', distance: '0.5 km' },
  ], [])

  const timelineItems = useMemo(() => [
    { time: '08:30', title: 'Leave Office' },
    { time: '09:05', title: 'Property 1' },
    { time: '09:45', title: 'Property 2' },
    { time: '10:40', title: 'Property 3' },
    { time: '12:00', title: 'Lunch' },
    { time: '13:10', title: 'Continue' },
    { time: '17:20', title: 'Finish' },
  ], [])

  const onLocate = (lat: number, lon: number) => {
    setCenter([lat, lon])
    setZoom(14)
  }

  return (
    <Layout title="Route Planner" immersive hideAssistant>
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
            <RouteCard title="Today's Schedule" startLocation="Fieldmate HQ" currentGps="13.7367, 100.5232" finishTime="17:20" stopCount={optimizedStops.length} />
            <TripSummary properties={12} distanceKm={42} estimatedTime="5h 40m" fuelCost={320} efficiency={94} />
          </div>

          <div className="rp-floating-controls">
            <button type="button" onClick={() => navigator.geolocation?.getCurrentPosition((position) => onLocate(position.coords.latitude, position.coords.longitude))}>📍</button>
            <button type="button" onClick={() => navigate('/map')}>🗺</button>
            <button type="button" onClick={() => setZoom(12)}>🧭</button>
          </div>

          <div className="rp-ai-float">
            <strong>AI Assistant</strong>
            <span>Alternative route available via Rama 9 to avoid 10 AM congestion.</span>
          </div>
        </div>

        <div className="rp-content">
          <section className="rp-card">
            <div className="rp-eyebrow">Optimize Route</div>
            <h2>AI route strategy</h2>
            <div className="rp-chip-row">
              {(['Shortest Distance', 'Fastest Time', 'Lowest Fuel', 'Highest Priority', 'Balanced'] as OptimizeMode[]).map((mode) => (
                <button key={mode} type="button" className={optimizeMode === mode ? 'is-active' : ''} onClick={() => setOptimizeMode(mode)}>{mode}</button>
              ))}
            </div>
            <div className="rp-chip-row">
              {(['Driving', 'Walking', 'Motorcycle', 'Public Transport'] as RouteMode[]).map((mode) => (
                <button key={mode} type="button" className={routeMode === mode ? 'is-active' : ''} onClick={() => setRouteMode(mode)}>{mode}</button>
              ))}
            </div>
            <button type="button" className="rp-primary-btn">Optimize by {optimizeMode}</button>
          </section>

          <Suspense fallback={<div className="rp-card">Loading AI suggestions...</div>}>
            <AIRecommendation items={[
              'Visit Property 4 first. Owner available until 14:00.',
              'Heavy traffic expected after 10 AM near Sukhumvit corridor.',
              'Rain expected after lunch. Prioritize exterior inspections before noon.',
              'Forest road warning on the northern branch. Keep current sequence for safety.',
              'Flood risk near canal segment adds 12 minutes if delayed to afternoon.',
            ]} />
          </Suspense>

          <section className="rp-card">
            <div className="rp-eyebrow">Smart Timeline</div>
            <h2>Field trip flow</h2>
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
            <div className="rp-eyebrow">Property Stops</div>
            <h2>Inspection queue</h2>
            <div className="rp-virtual-list" onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}>
              <div style={{ height: totalHeight, position: 'relative' }}>
                {visibleStops.map((stop, index) => {
                  const absoluteIndex = startIndex + index
                  return (
                    <div key={stop.id} style={{ position: 'absolute', top: absoluteIndex * itemHeight, left: 0, right: 0 }}>
                      <PropertyStop stop={stop} onOpen={() => setSelectedId(stop.id)} onCall={() => undefined} />
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          <TravelAnalytics distance="42 km" drivingTime="3h 05m" idleTime="22 min" inspectionTime="2h 13m" fuelEstimate="320 THB" carbonSaving="11%" />

          <Suspense fallback={<div className="rp-card">Loading nearby suggestions...</div>}>
            <NearbyProperty items={nearbySuggestions} />
          </Suspense>

          <RiskAlert items={[
            { title: 'Flood Area', detail: 'Moderate water accumulation near canal route.', tone: 'flood' },
            { title: 'Forest Area', detail: 'Protected roadside buffer around stop 9.', tone: 'forest' },
            { title: 'Road Closure', detail: 'Construction lane reduction after 15:00.', tone: 'road' },
            { title: 'Danger Zone', detail: 'Low-light access road after sunset.', tone: 'danger' },
            { title: 'Construction', detail: 'Future widening may delay expressway exit.', tone: 'construction' },
          ]} />

          <OfflineDownload downloaded={downloaded} pendingUpload={4} cachedRecords={optimizedStops.length} onDownload={() => setDownloaded(true)} />
        </div>
      </div>

      <NavigationBottomSheet open={Boolean(selectedStop)} stop={selectedStop} onClose={() => setSelectedId(null)} onAssessment={() => navigate('/assessment')} />
    </Layout>
  )
}
