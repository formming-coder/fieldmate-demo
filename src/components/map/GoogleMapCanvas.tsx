import React, { useEffect, useRef, useState } from 'react'
import { Property } from '../../types'

type GoogleLatLng = { lat: number; lng: number }
type GoogleMapInstance = {
  setCenter: (center: GoogleLatLng) => void
  setZoom: (zoom: number) => void
  setMapTypeId: (mapTypeId: string) => void
}
type GoogleMarker = { setMap: (map: GoogleMapInstance | null) => void }
type GoogleCircle = { setMap: (map: GoogleMapInstance | null) => void }
type GoogleTrafficLayer = { setMap: (map: GoogleMapInstance | null) => void }
type GoogleMapsApi = {
  Map: new (element: HTMLElement, options: Record<string, unknown>) => GoogleMapInstance
  Marker: new (options: Record<string, unknown>) => GoogleMarker
  Circle: new (options: Record<string, unknown>) => GoogleCircle
  TrafficLayer: new () => GoogleTrafficLayer
  event: { addListener: (target: unknown, eventName: string, handler: (event?: { latLng?: { lat: () => number; lng: () => number } }) => void) => void }
}

declare global {
  interface Window {
    google?: { maps: GoogleMapsApi }
    gm_authFailure?: () => void
    __fieldmateGoogleMapsPromise?: Promise<GoogleMapsApi>
  }
}

const SCRIPT_ID = 'fieldmate-google-maps-api'
const LOAD_TIMEOUT_MS = 15000

function loadGoogleMaps(apiKey: string) {
  if (window.google?.maps) return Promise.resolve(window.google.maps)
  if (window.__fieldmateGoogleMapsPromise) return window.__fieldmateGoogleMapsPromise

  window.__fieldmateGoogleMapsPromise = new Promise<GoogleMapsApi>((resolve, reject) => {
    const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null
    const timeout = window.setTimeout(() => reject(new Error('Maps JavaScript API loading failure')), LOAD_TIMEOUT_MS)
    const finish = () => {
      window.clearTimeout(timeout)
      if (window.google?.maps) resolve(window.google.maps)
      else reject(new Error('Maps JavaScript API loading failure'))
    }

    window.gm_authFailure = () => {
      window.clearTimeout(timeout)
      reject(new Error('Google Maps authentication failure: InvalidKeyMapError, RefererNotAllowedMapError, ApiNotActivatedMapError, BillingNotEnabledMapError, or ExpiredKey'))
    }

    if (existingScript) {
      existingScript.addEventListener('load', finish, { once: true })
      existingScript.addEventListener('error', () => reject(new Error('Maps JavaScript API loading failure')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.async = true
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly&loading=async`
    script.addEventListener('load', finish, { once: true })
    script.addEventListener('error', () => {
      window.clearTimeout(timeout)
      reject(new Error('Maps JavaScript API loading failure'))
    }, { once: true })
    document.head.appendChild(script)
  }).catch((error) => {
    document.getElementById(SCRIPT_ID)?.remove()
    window.__fieldmateGoogleMapsPromise = undefined
    window.google = undefined
    throw error
  })

  return window.__fieldmateGoogleMapsPromise
}

type GoogleMapCanvasProps = {
  apiKey: string
  center: [number, number]
  zoom: number
  mapMode: 'street' | 'satellite' | 'terrain'
  showTraffic: boolean
  properties: Property[]
  selectedId: string | null
  currentLocation: { latitude: number; longitude: number; accuracy: number } | null
  retrySeed: number
  measureMode: boolean
  onMeasurePoint: (latitude: number, longitude: number) => void
  onPropertySelect: (property: Property) => void
  onReady: () => void
  onError: (error: Error) => void
}

export default function GoogleMapCanvas({ apiKey, center, zoom, mapMode, showTraffic, properties, selectedId, currentLocation, retrySeed, measureMode, onMeasurePoint, onPropertySelect, onReady, onError }: GoogleMapCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<GoogleMapInstance | null>(null)
  const mapsRef = useRef<GoogleMapsApi | null>(null)
  const markersRef = useRef<GoogleMarker[]>([])
  const locationMarkerRef = useRef<GoogleMarker | null>(null)
  const accuracyCircleRef = useRef<GoogleCircle | null>(null)
  const trafficLayerRef = useRef<GoogleTrafficLayer | null>(null)
  const measureModeRef = useRef(measureMode)
  const [mapGeneration, setMapGeneration] = useState(0)

  useEffect(() => { measureModeRef.current = measureMode }, [measureMode])

  useEffect(() => {
    let active = true
    if (!apiKey || !containerRef.current) return

    loadGoogleMaps(apiKey).then((maps) => {
      if (!active || !containerRef.current) return
      mapsRef.current = maps
      const map = new maps.Map(containerRef.current, {
        center: { lat: center[0], lng: center[1] },
        zoom,
        mapTypeId: mapMode === 'street' ? 'roadmap' : mapMode,
        disableDefaultUI: true,
        clickableIcons: false,
        gestureHandling: 'greedy',
        keyboardShortcuts: true,
      })
      mapRef.current = map
      setMapGeneration((current) => current + 1)
      maps.event.addListener(map, 'idle', onReady)
      maps.event.addListener(map, 'click', (event) => {
        if (!measureModeRef.current || !event?.latLng) return
        onMeasurePoint(event.latLng.lat(), event.latLng.lng())
      })
    }).catch((error) => {
      const technicalError = error instanceof Error ? error : new Error(String(error))
      console.error('[Fieldmate Smart Map] Google Maps load failed', technicalError)
      if (active) onError(technicalError)
    })

    return () => { active = false }
  }, [apiKey, retrySeed])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    map.setCenter({ lat: center[0], lng: center[1] })
    map.setZoom(zoom)
  }, [center, zoom, mapGeneration])

  useEffect(() => {
    mapRef.current?.setMapTypeId(mapMode === 'street' ? 'roadmap' : mapMode)
  }, [mapMode, mapGeneration])

  useEffect(() => {
    const maps = mapsRef.current
    const map = mapRef.current
    if (!maps || !map) return
    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = properties.map((property) => {
      const selected = property.id === selectedId
      const marker = new maps.Marker({
        map,
        position: { lat: property.latitude, lng: property.longitude },
        title: `${property.id} ${property.address}`,
        label: { text: property.id.replace('FM-', ''), color: '#173d35', fontSize: selected ? '12px' : '10px', fontWeight: '700' },
        zIndex: selected ? 20 : 10,
      })
      maps.event.addListener(marker, 'click', () => onPropertySelect(property))
      return marker
    })
  }, [properties, selectedId, retrySeed, mapGeneration])

  useEffect(() => {
    const maps = mapsRef.current
    const map = mapRef.current
    if (!maps || !map) return
    locationMarkerRef.current?.setMap(null)
    accuracyCircleRef.current?.setMap(null)
    if (!currentLocation) return

    const position = { lat: currentLocation.latitude, lng: currentLocation.longitude }
    locationMarkerRef.current = new maps.Marker({ map, position, title: 'ตำแหน่งปัจจุบัน', zIndex: 100 })
    accuracyCircleRef.current = new maps.Circle({
      map,
      center: position,
      radius: Math.max(20, currentLocation.accuracy),
      strokeColor: '#1677ff',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#4da3ff',
      fillOpacity: 0.2,
    })
  }, [currentLocation, retrySeed, mapGeneration])

  useEffect(() => {
    const maps = mapsRef.current
    const map = mapRef.current
    if (!maps || !map) return
    if (!trafficLayerRef.current) trafficLayerRef.current = new maps.TrafficLayer()
    trafficLayerRef.current.setMap(showTraffic ? map : null)
  }, [showTraffic, retrySeed, mapGeneration])

  useEffect(() => () => {
    markersRef.current.forEach((marker) => marker.setMap(null))
    locationMarkerRef.current?.setMap(null)
    accuracyCircleRef.current?.setMap(null)
    trafficLayerRef.current?.setMap(null)
  }, [])

  return <div ref={containerRef} className="smart-google-map" aria-label="Google Maps แสดงตำแหน่งทรัพย์" />
}
