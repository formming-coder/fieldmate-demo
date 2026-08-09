import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import CameraView from '../components/camera/CameraView'
import { useCurrentOfficerQuery, useSavePropertyMutation } from '../hooks/useBackendQueries'
import { useDeviceCamera } from '../hooks/useDeviceCamera'
import { useLiveLocation } from '../hooks/useLiveLocation'
import { Property } from '../types'
import s from './AICameraV2.module.css'

const propertyTypes = [
  { key: 'land', label: 'ที่ดิน', emoji: '🏞' },
  { key: 'house', label: 'บ้านเดี่ยว', emoji: '🏠' },
  { key: 'semi', label: 'บ้านแฝด', emoji: '🏡' },
  { key: 'townhouse', label: 'ทาวน์เฮาส์', emoji: '🏘' },
  { key: 'commercial', label: 'อาคารพาณิชย์', emoji: '🏬' },
  { key: 'condo', label: 'คอนโดมิเนียม', emoji: '🏢' },
] as const

type PropertyTypeKey = typeof propertyTypes[number]['key']

type PhotoItem = {
  id: string
  url: string
  file: File
}

const propertyTypeLabels: Record<PropertyTypeKey, string> = {
  land: 'ที่ดิน',
  house: 'บ้านเดี่ยว',
  semi: 'บ้านแฝด',
  townhouse: 'ทาวน์เฮาส์',
  commercial: 'อาคารพาณิชย์',
  condo: 'คอนโดมิเนียม',
}

function revokeIfBlob(url: string) {
  if (url.startsWith('blob:')) URL.revokeObjectURL(url)
}

export default function AICameraV2() {
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement | null>(null)
  const photosRef = useRef<PhotoItem[]>([])
  const { videoRef, permission, error, loading, requestCamera, capturePhoto, switchCamera, stopCamera } = useDeviceCamera()
  const { location, accuracyLevel, requestCurrentPosition } = useLiveLocation({ highAccuracy: true, watch: true, timeoutMs: 12000 })
  const { data: currentOfficer } = useCurrentOfficerQuery()
  const savePropertyMutation = useSavePropertyMutation()

  const [propertyType, setPropertyType] = useState<PropertyTypeKey | ''>('')
  const [sellerPhone, setSellerPhone] = useState('')
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [saving, setSaving] = useState(false)
  const [savedId, setSavedId] = useState('')
  const [toast, setToast] = useState('')
  const [flashActive, setFlashActive] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    void requestCamera('environment')
  }, [requestCamera])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2400)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(() => setMessage(''), 2600)
    return () => window.clearTimeout(timer)
  }, [message])

  useEffect(() => {
    photosRef.current = photos
  }, [photos])

  useEffect(() => {
    return () => {
      stopCamera()
      photosRef.current.forEach((photo) => revokeIfBlob(photo.url))
    }
  }, [stopCamera])

  const activePhoto = photos[activeIndex]

  const currentTypeLabel = useMemo(() => {
    if (!propertyType) return 'ยังไม่เลือกประเภท'
    return propertyTypeLabels[propertyType]
  }, [propertyType])

  const addPhoto = async (file: File, url?: string) => {
    const nextUrl = url || URL.createObjectURL(file)
    setPhotos((current) => [{ id: `photo-${Date.now()}`, url: nextUrl, file }, ...current])
    setActiveIndex(0)
  }

  const capture = async () => {
    setMessage('')
    if (permission !== 'granted') {
      setToast('อนุญาตกล้องก่อนถ่ายภาพ')
      return
    }

    const captureResult = await capturePhoto()
    if (!captureResult) {
      setToast('ไม่สามารถถ่ายภาพได้')
      return
    }

    setFlashActive(true)
    window.setTimeout(() => setFlashActive(false), 180)
    await addPhoto(captureResult.file, captureResult.url)
    setToast('บันทึกภาพแล้ว')
  }

  const openGallery = () => fileRef.current?.click()

  const onFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []).filter((file) => file.type.startsWith('image/'))
    event.target.value = ''
    if (!files.length) return
    await Promise.all(files.map(async (file) => addPhoto(file)))
    setToast('เพิ่มภาพจากเครื่องแล้ว')
  }

  const removePhoto = (index: number) => {
    setPhotos((current) => {
      const target = current[index]
      if (target) revokeIfBlob(target.url)
      return current.filter((_, photoIndex) => photoIndex !== index)
    })
    setActiveIndex((current) => Math.max(0, current - 1))
  }

  const saveCapture = async () => {
    if (!propertyType) {
      setMessage('กรุณาเลือกประเภททรัพย์')
      return
    }
    if (!photos.length) {
      setMessage('กรุณาถ่ายหรือเพิ่มรูปอย่างน้อย 1 รูป')
      return
    }
    if (!location) {
      setMessage('กำลังรอ GPS อัตโนมัติ')
      return
    }

    setSaving(true)
    try {
      const saved = await savePropertyMutation.mutateAsync({
        owner: currentOfficer?.name ? `ทรัพย์ใหม่โดย${currentOfficer.name}` : 'ทรัพย์ใหม่',
        province: 'ไม่ระบุจังหวัด',
        address: 'บันทึกภาคสนาม',
        areaSqm: 0,
        latitude: location.latitude,
        longitude: location.longitude,
        marketPrice: 0,
        appraisalPrice: 0,
        status: 'pending',
        type: propertyTypeLabels[propertyType],
        lastInspection: new Date().toISOString(),
        images: photos.map((photo) => photo.url),
        sellerPhone: sellerPhone.trim() || undefined,
      } as Partial<Property>)
      setSavedId(saved.id)
      setToast('บันทึกทรัพย์แล้ว')
      navigate('/album', { replace: true })
    } catch {
      setMessage('ไม่สามารถบันทึกทรัพย์ได้')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Layout title="บันทึกทรัพย์" immersive hideAssistant hideBottomNavigation>
      <div className={s.pageWrap}>
        <input ref={fileRef} type="file" accept="image/*" multiple className="cam-hidden-input" onChange={onFiles} />

        <section className={s.heroSection}>
          <div className={s.heroTopBar}>
            <button className={s.iconBtn} type="button" onClick={() => navigate('/map')}>←</button>
            <div className={s.heroTitle}>Capture First</div>
            <div className={s.heroActions}>
              <button className={s.iconBtn} type="button" onClick={() => void requestCurrentPosition()}>📍</button>
              <button className={s.iconBtn} type="button" onClick={() => void switchCamera()}>↻</button>
            </div>
          </div>

          <CameraView
            flashActive={flashActive}
            media={(
              activePhoto ? (
                <div className={s.previewFrame} style={{ backgroundImage: `url(${activePhoto.url})` }} />
              ) : (
                <div className={s.cameraFrame}>
                  <video ref={videoRef} muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 24 }} />
                  <div className={s.cameraOverlay}>
                    <div className={s.statusPill}>GPS อัตโนมัติ</div>
                    <div className={s.statusPill}>{permission === 'granted' ? 'กล้องพร้อม' : loading ? 'กำลังเปิดกล้อง' : 'รอกล้อง'}</div>
                  </div>
                </div>
              )
            )}
          />

          <div className={s.cameraFooter}>
            <button type="button" className={s.captureBtn} onClick={() => void capture()}>●</button>
            <button type="button" className={s.galleryThumb} onClick={openGallery}>แกลเลอรี</button>
          </div>

          <div className={s.infoStrip}>
            <div><div className={s.infoLabel}>ประเภท</div><div>{currentTypeLabel}</div></div>
            <div><div className={s.infoLabel}>GPS</div><div>{location ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}` : 'กำลังจับพิกัด'}</div></div>
            <div><div className={s.infoLabel}>ความแม่นยำ</div><div>{location ? `${location.accuracy} m • ${accuracyLevel}` : '—'}</div></div>
          </div>
        </section>

        <section className={s.section}>
          <div className={s.sectionHeader}>
            <div>
              <div className={s.stepTitle}>ขั้นตอนที่ 1</div>
              <div className={s.sectionTitle}>เลือกประเภททรัพย์</div>
            </div>
            <span className={s.muted}>บังคับ</span>
          </div>
          <div className={s.typeGrid}>
            {propertyTypes.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`${s.typeCard} ${propertyType === item.key ? s.typeSelected : ''}`}
                onClick={() => setPropertyType(item.key)}
              >
                <div className={s.typeEmoji}>{item.emoji}</div>
                <div>{item.label}</div>
              </button>
            ))}
          </div>
        </section>

        <section className={s.section}>
          <div className={s.sectionHeader}>
            <div>
              <div className={s.stepTitle}>ขั้นตอนที่ 2</div>
              <div className={s.sectionTitle}>เบอร์ผู้ขาย (ไม่บังคับ)</div>
            </div>
          </div>
          <div className={s.fieldColumn}>
            <label className={s.fieldLabel}>เบอร์โทร</label>
            <input
              className={s.input}
              inputMode="tel"
              placeholder="080-123-4567"
              value={sellerPhone}
              onChange={(event) => setSellerPhone(event.target.value)}
            />
          </div>
        </section>

        <section className={s.section}>
          <div className={s.sectionHeader}>
            <div>
              <div className={s.stepTitle}>ขั้นตอนที่ 3</div>
              <div className={s.sectionTitle}>รูปภาพภาคสนาม</div>
            </div>
            <span className={s.muted}>{photos.length} รูป</span>
          </div>
          <div className={s.photoGallery}>
            <button type="button" className={s.photoAdd} onClick={openGallery}>+ เพิ่มรูป</button>
            {photos.map((photo, index) => (
              <div key={photo.id} className={s.photoCard} style={{ backgroundImage: `url(${photo.url})` }}>
                <div className={s.photoActions}>
                  <button type="button" onClick={() => setActiveIndex(index)}>ดู</button>
                  <button type="button" onClick={() => removePhoto(index)}>ลบ</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={s.section}>
          <div className={s.sectionHeader}>
            <div>
              <div className={s.stepTitle}>ขั้นตอนที่ 4</div>
              <div className={s.sectionTitle}>สรุป GPS</div>
            </div>
          </div>
          <div className={s.gpsInfo}>
            <div><span>สถานะ</span><strong>{location ? 'จับพิกัดอัตโนมัติแล้ว' : 'กำลังรอ GPS'}</strong></div>
            <div><span>พิกัด</span><strong>{location ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}` : '—'}</strong></div>
            <div><span>ความแม่นยำ</span><strong>{location ? `${location.accuracy} m` : '—'}</strong></div>
          </div>
        </section>

        {savedId ? (
          <section className={s.section}>
            <div className={s.sectionHeader}>
              <div>
                <div className={s.stepTitle}>บันทึกแล้ว</div>
                <div className={s.sectionTitle}>พร้อมไปที่รายการทรัพย์</div>
              </div>
            </div>
            <div className={s.mapActions}>
              <button type="button" className={s.primaryBtn} onClick={() => navigate('/album')}>ไปที่รายการทรัพย์</button>
              <button type="button" className={s.secondaryBtn} onClick={() => navigate(`/property/${savedId}`)}>เปิดรายละเอียด</button>
            </div>
          </section>
        ) : null}

        {message ? <div className={s.muted}>{message}</div> : null}

        <div className={s.actionFooter}>
          <button type="button" className={s.secondaryBtn} onClick={() => navigate('/map')}>ย้อนกลับ</button>
          <button type="button" className={s.primaryBtn} disabled={saving} onClick={() => void saveCapture()}>{saving ? 'กำลังบันทึก...' : 'บันทึกทรัพย์'}</button>
        </div>

        {toast ? <div className="entry-toast">{toast}</div> : null}
      </div>
    </Layout>
  )
}
