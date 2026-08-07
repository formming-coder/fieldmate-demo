import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export type LocationPermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported'

export type LiveLocation = {
  latitude: number
  longitude: number
  accuracy: number
  altitude: number | null
  heading: number | null
  speed: number | null
  timestamp: number
}

type UseLiveLocationOptions = {
  highAccuracy?: boolean
  timeoutMs?: number
  maximumAgeMs?: number
  watch?: boolean
}

export function useLiveLocation(options: UseLiveLocationOptions = {}) {
  const {
    highAccuracy = true,
    timeoutMs = 10000,
    maximumAgeMs = 3000,
    watch = true,
  } = options

  const [permission, setPermission] = useState<LocationPermissionState>('prompt')
  const [location, setLocation] = useState<LiveLocation | null>(null)
  const [error, setError] = useState('')
  const [watching, setWatching] = useState(false)
  const watchIdRef = useRef<number | null>(null)

  const geoOptions = useMemo<PositionOptions>(() => ({
    enableHighAccuracy: highAccuracy,
    timeout: timeoutMs,
    maximumAge: maximumAgeMs,
  }), [highAccuracy, maximumAgeMs, timeoutMs])

  const handlePosition = useCallback((position: GeolocationPosition) => {
    setError('')
    setPermission('granted')
    setLocation({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: Number(position.coords.accuracy.toFixed(1)),
      altitude: position.coords.altitude,
      heading: position.coords.heading,
      speed: position.coords.speed,
      timestamp: position.timestamp,
    })
  }, [])

  const handleError = useCallback((nextError: GeolocationPositionError) => {
    if (nextError.code === 1) {
      setPermission('denied')
      setError('ไม่ได้รับสิทธิ์การเข้าถึงตำแหน่ง')
      return
    }

    if (nextError.code === 2) {
      setError('ไม่สามารถระบุตำแหน่งปัจจุบันได้')
      return
    }

    setError('หมดเวลาการขอตำแหน่ง กรุณาลองใหม่')
  }, [])

  const requestCurrentPosition = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setPermission('unsupported')
      setError('อุปกรณ์นี้ไม่รองรับ GPS')
      return
    }

    navigator.geolocation.getCurrentPosition(handlePosition, handleError, geoOptions)
  }, [geoOptions, handleError, handlePosition])

  const startWatching = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setPermission('unsupported')
      setError('อุปกรณ์นี้ไม่รองรับ GPS')
      return
    }

    if (watchIdRef.current !== null) return

    const id = navigator.geolocation.watchPosition(handlePosition, handleError, geoOptions)
    watchIdRef.current = id
    setWatching(true)
  }, [geoOptions, handleError, handlePosition])

  const stopWatching = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return
    if (watchIdRef.current === null) return
    navigator.geolocation.clearWatch(watchIdRef.current)
    watchIdRef.current = null
    setWatching(false)
  }, [])

  useEffect(() => {
    if (!watch) {
      requestCurrentPosition()
      return
    }

    startWatching()
    return () => stopWatching()
  }, [requestCurrentPosition, startWatching, stopWatching, watch])

  const accuracyLevel = useMemo(() => {
    const accuracy = location?.accuracy ?? Number.POSITIVE_INFINITY
    if (accuracy <= 8) return 'high'
    if (accuracy <= 20) return 'medium'
    return 'low'
  }, [location?.accuracy])

  return {
    permission,
    location,
    accuracyLevel,
    error,
    watching,
    requestCurrentPosition,
    startWatching,
    stopWatching,
  }
}
