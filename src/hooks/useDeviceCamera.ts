import { useCallback, useEffect, useRef, useState } from 'react'

export type CameraPermissionState = 'idle' | 'requesting' | 'granted' | 'denied' | 'unsupported'
export type CameraFacingMode = 'user' | 'environment'

type CaptureResult = {
  file: File
  url: string
}

export function useDeviceCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [permission, setPermission] = useState<CameraPermissionState>('idle')
  const [error, setError] = useState('')
  const [facingMode, setFacingMode] = useState<CameraFacingMode>('environment')
  const [torchEnabled, setTorchEnabled] = useState(false)
  const [torchAvailable, setTorchAvailable] = useState(false)
  const [loading, setLoading] = useState(false)

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setTorchAvailable(false)
    setTorchEnabled(false)
  }, [])

  const attachStream = useCallback(async (stream: MediaStream) => {
    streamRef.current = stream
    const video = videoRef.current
    if (!video) return
    video.srcObject = stream
    video.playsInline = true
    video.muted = true
    await video.play()

    const [track] = stream.getVideoTracks()
    const capabilities = (track.getCapabilities?.() || {}) as MediaTrackCapabilities & { torch?: boolean }
    setTorchAvailable(Boolean(capabilities.torch))
  }, [])

  const requestCamera = useCallback(async (nextFacingMode?: CameraFacingMode) => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setPermission('unsupported')
      setError('อุปกรณ์นี้ไม่รองรับการเปิดกล้อง')
      return
    }

    const targetFacingMode = nextFacingMode || facingMode
    setLoading(true)
    setPermission('requesting')
    setError('')

    try {
      stopCamera()
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: targetFacingMode },
          width: { ideal: 1280 },
          height: { ideal: 1920 },
        },
      })
      await attachStream(stream)
      setFacingMode(targetFacingMode)
      setPermission('granted')
    } catch {
      setPermission('denied')
      setError('ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตการใช้งานกล้องแล้วลองใหม่')
    } finally {
      setLoading(false)
    }
  }, [attachStream, facingMode, stopCamera])

  const switchCamera = useCallback(async () => {
    const nextMode: CameraFacingMode = facingMode === 'environment' ? 'user' : 'environment'
    await requestCamera(nextMode)
  }, [facingMode, requestCamera])

  const toggleTorch = useCallback(async () => {
    const track = streamRef.current?.getVideoTracks()[0]
    if (!track || !torchAvailable) return

    try {
      const next = !torchEnabled
      await track.applyConstraints({ advanced: [{ torch: next } as MediaTrackConstraintSet] })
      setTorchEnabled(next)
    } catch {
      setError('อุปกรณ์นี้ไม่รองรับแฟลชขณะเปิดกล้อง')
    }
  }, [torchAvailable, torchEnabled])

  const capturePhoto = useCallback(async (): Promise<CaptureResult | null> => {
    const video = videoRef.current
    if (!video) return null

    const width = video.videoWidth
    const height = video.videoHeight
    if (!width || !height) return null

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) return null

    context.drawImage(video, 0, 0, width, height)

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92))
    if (!blob) return null

    const file = new File([blob], `fieldmate-${Date.now()}.jpg`, { type: 'image/jpeg' })
    return {
      file,
      url: URL.createObjectURL(blob),
    }
  }, [])

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  return {
    videoRef,
    permission,
    error,
    facingMode,
    torchEnabled,
    torchAvailable,
    loading,
    requestCamera,
    switchCamera,
    toggleTorch,
    capturePhoto,
    stopCamera,
  }
}
