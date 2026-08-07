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
  if (lower.includes('land')) return 'Land'
  if (lower.includes('condo')) return 'Condominium'
  if (lower.includes('commercial')) return 'Commercial'
  if (lower.includes('town')) return 'Townhome'
  return 'House'
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
    forest: { active: true, opacity: 0.78, description: 'Protected area, reserved forest and buffer zone.' },
    flood: { active: true, opacity: 0.7, description: 'Flood risk, drainage and historical water level.' },
    urban: { active: true, opacity: 0.75, description: 'Residential, commercial, industrial and mixed city plan.' },
    expropriation: { active: true, opacity: 0.72, description: 'Road expansion, railway and future infrastructure lines.' },
    landuse: { active: true, opacity: 0.66, description: 'Land use zoning and mixed-use indicators.' },
    government: { active: false, opacity: 0.6, description: 'Government land and restricted parcels.' },
    satellite: { active: true, opacity: 1, description: 'High-resolution satellite imagery.' },
    road: { active: true, opacity: 0.82, description: 'Road network accessibility and classification.' },
    railway: { active: true, opacity: 0.7, description: 'Railway alignment and station influence.' },
    transit: { active: true, opacity: 0.74, description: 'BTS / MRT corridors and station catchments.' },
    expressway: { active: true, opacity: 0.76, description: 'Expressway access and future ramps.' },
    river: { active: true, opacity: 0.58, description: 'Main river influence and setback context.' },
    canal: { active: true, opacity: 0.55, description: 'Canal network and drainage corridors.' },
    utility: { active: false, opacity: 0.68, description: 'Power, water and utility corridors.' },
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
      { label: 'Bangna General Hospital', distance: `${(0.6 * scale).toFixed(1)} km`, type: 'Hospital' },
      { label: 'Sukhumvit School', distance: `${(0.8 * scale).toFixed(1)} km`, type: 'School' },
      { label: 'District Police', distance: `${(0.9 * scale).toFixed(1)} km`, type: 'Police' },
      { label: 'Land Office', distance: `${(1.2 * scale).toFixed(1)} km`, type: 'Government' },
      { label: 'Mega Plaza', distance: `${(1.4 * scale).toFixed(1)} km`, type: 'Shopping Mall' },
      { label: 'PTT Station', distance: `${(0.7 * scale).toFixed(1)} km`, type: 'Fuel Station' },
      { label: 'Community Market', distance: `${(0.5 * scale).toFixed(1)} km`, type: 'Market' },
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
    { key: 'Flood', score: 42 },
    { key: 'Forest', score: 18 },
    { key: 'Legal', score: 56 },
    { key: 'Environment', score: 38 },
    { key: 'Access', score: 27 },
    { key: 'Utilities', score: 35 },
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
    <Layout title="GIS Intelligence" immersive hideAssistant>
      <div className="gis-page">
        <header className="gis-header">
          <div>
            <div className="gis-title">GIS Intelligence</div>
            <div className="gis-subtitle">{selectedProperty ? `${selectedProperty.owner} • ${selectedProperty.province}` : 'Current Property'}</div>
          </div>
          <div className="gis-header-actions">
            <button type="button" onClick={refreshMap}>Refresh</button>
            <button type="button" onClick={() => setShowLayers((current) => !current)}>Layers</button>
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
            <span>{offline ? 'Offline cache' : 'Live layers'}</span>
            <span>{properties.length} parcels</span>
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
              <strong>THB {selectedProperty.marketPrice.toLocaleString()}</strong>
            </section>

            <LegendCard title="Forest Layer" items={[{ label: 'Protected Area', color: '#39b86a' }, { label: 'Reserved Forest', color: '#0f8a46' }, { label: 'Buffer Zone', color: '#83d27d' }]} />
            <LegendCard title="Flood Layer" items={[{ label: 'Low', color: '#8ec2ff' }, { label: 'Medium', color: '#5f9cff' }, { label: 'High', color: '#3d7dff' }]} />
            <LegendCard title="Urban Planning" items={[{ label: 'Residential', color: '#ffd35a' }, { label: 'Commercial', color: '#ef9b5f' }, { label: 'Agriculture', color: '#8bc16e' }]} />

            <Suspense fallback={<div className="gis-panel-card">Loading nearby analysis...</div>}>
              <NearbyAnalysis radius={radius} onRadiusChange={setRadius} items={nearbyPlaces} />
              <SpatialInsight
                riskScore={44}
                text={[
                  'Historical flood traces exist within the eastern drainage corridor but parcel center remains outside the highest-risk pocket.',
                  'Future expressway and railway expansion could improve access while increasing legal review complexity.',
                  'Forest constraint is low, but canal proximity may affect setback and water management discussions.',
                ]}
              />
              <RiskDashboard items={riskItems} />
              <GISSummary
                findings={[
                  'Property sits in a mixed residential-transport growth corridor.',
                  'Main road and transit access are strong within 1 km radius.',
                  'Flood exposure is moderate and should be priced into review comments.',
                ]}
                warnings={[
                  'Expropriation alignment intersects future road expansion corridor.',
                  'Drainage corridor requires legal and infrastructure verification before final valuation.',
                ]}
                recommendation="Proceed with valuation using moderate-risk assumption and request legal map confirmation for the expansion corridor."
              />
            </Suspense>

            <section className="gis-panel-card">
              <div className="gis-section-title">Property Comparison</div>
              <div className="gis-compare-row">
                <div><span>Current</span><strong>{selectedProperty.owner}</strong><em>Flood 42 • Access 27</em></div>
                <div><span>Comparable A</span><strong>Bangna Prime A</strong><em>Flood 35 • Access 31</em></div>
                <div><span>Comparable B</span><strong>Sukhum Growth B</strong><em>Flood 48 • Access 22</em></div>
              </div>
            </section>

            <section className="gis-panel-card">
              <div className="gis-section-title">Timeline</div>
              <div className="gis-timeline-list">
                <div><strong>Historical map</strong><span>Flood traces reduced after drainage upgrade in 2023.</span></div>
                <div><strong>Future plan</strong><span>Urban plan update indicates mixed-use uplift corridor by 2028.</span></div>
                <div><strong>Infrastructure development</strong><span>Future railway and expressway interchange may improve accessibility score.</span></div>
              </div>
            </section>

            <div className="gis-inline-actions">
              <button type="button" onClick={() => navigate(`/property/${selectedProperty.id}`)}>Property Detail</button>
              <button type="button" onClick={() => navigate('/map')}>Open Smart Map</button>
              <button type="button" onClick={() => navigate('/assessment')}>Open Assessment</button>
            </div>
          </div>
        ) : null}
      </BottomSheet>
    </Layout>
  )
}
