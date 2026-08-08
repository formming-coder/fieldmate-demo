import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import { useDeviceCamera } from '../../hooks/useDeviceCamera'
import { SurveyLocation, SurveyPhoto, SurveyPhotoType } from '../../types'
import PhotoGallery from '../camera/PhotoGallery'

const categories: Array<{ id: SurveyPhotoType; label: string }> = [
  { id: 'front', label: 'ด้านหน้า' }, { id: 'side', label: 'ด้านข้าง' },
  { id: 'rear', label: 'ด้านหลัง' }, { id: 'road', label: 'ถนน' },
  { id: 'surroundings', label: 'บริเวณโดยรอบ' }, { id: 'sign', label: 'ป้ายประกาศ' },
  { id: 'document', label: 'เอกสาร' }, { id: 'other', label: 'อื่น ๆ' },
]

function fileToCompressedDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์รูปภาพได้'))
    reader.onload = () => {
      const image = new Image()
      image.onerror = () => reject(new Error('ไม่สามารถเปิดรูปภาพได้'))
      image.onload = () => {
        const scale = Math.min(1, 1280 / Math.max(image.width, image.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(image.width * scale)
        canvas.height = Math.round(image.height * scale)
        canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.68))
      }
      image.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}

type SurveyPhotoGridProps = {
  propertyId: string
  surveyId: string
  location: SurveyLocation | null
  photos: SurveyPhoto[]
  onChange: (photos: SurveyPhoto[]) => void
  onAnalyze: (photo: SurveyPhoto) => void
}

export default function SurveyPhotoGrid({ propertyId, surveyId, location, photos, onChange, onAnalyze }: SurveyPhotoGridProps) {
  const [category, setCategory] = useState<SurveyPhotoType>('front')
  const [cameraOpen, setCameraOpen] = useState(false)
  const [fullPhoto, setFullPhoto] = useState<SurveyPhoto | null>(null)
  const [replaceId, setReplaceId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)
  const { videoRef, permission, error: cameraError, loading, requestCamera, capturePhoto, switchCamera, stopCamera } = useDeviceCamera()

  useEffect(() => {
    if (cameraOpen) void requestCamera('environment')
    else stopCamera()
  }, [cameraOpen, requestCamera, stopCamera])

  const addFile = async (file: File) => {
    try {
      setError('')
      const dataUrl = await fileToCompressedDataUrl(file)
      const now = new Date().toISOString()
      const photo: SurveyPhoto = {
        id: `${propertyId}-${Date.now()}`,
        dataUrl,
        latitude: location?.latitude ?? null,
        longitude: location?.longitude ?? null,
        capturedAt: now,
        propertyId,
        surveyId,
        type: category,
        ocrStatus: 'idle',
      }
      onChange(replaceId ? photos.filter((item) => item.id !== replaceId).concat(photo) : photos.concat(photo))
      setReplaceId(null)
      setCameraOpen(false)
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'ไม่สามารถเพิ่มรูปภาพได้')
    }
  }

  const takePhoto = async () => {
    const result = await capturePhoto()
    if (!result) { setError('กล้องยังไม่พร้อม กรุณาลองใหม่'); return }
    await addFile(result.file)
    URL.revokeObjectURL(result.url)
  }

  const selectFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) void addFile(file)
    event.target.value = ''
  }

  return (
    <section className="survey-card survey-photo-card">
      <div className="survey-card-heading"><span className="material-symbols-rounded" aria-hidden="true">photo_camera</span><div><h2>ถ่ายรูปทรัพย์</h2><p>เลือกประเภทรูปก่อนถ่ายหรือเลือกจากคลัง</p></div></div>
      <div className="survey-category-list" role="tablist" aria-label="ประเภทรูปภาพ">
        {categories.map((item) => <button type="button" key={item.id} className={category === item.id ? 'active' : ''} onClick={() => setCategory(item.id)}>{item.label}</button>)}
      </div>
      <div className="survey-photo-actions">
        <button type="button" onClick={() => setCameraOpen(true)}><span className="material-symbols-rounded" aria-hidden="true">photo_camera</span>ถ่ายรูป</button>
        <button type="button" onClick={() => inputRef.current?.click()}><span className="material-symbols-rounded" aria-hidden="true">photo_library</span>เลือกจากคลังรูปภาพ</button>
        <input ref={inputRef} type="file" accept="image/*" className="survey-hidden-input" onChange={selectFile} />
      </div>
      {error ? <div className="survey-inline-error" role="alert">{error}</div> : null}
      <PhotoGallery
        photos={photos}
        onView={setFullPhoto}
        onRetake={(photo) => { setCategory(photo.type); setReplaceId(photo.id); setCameraOpen(true) }}
        onDelete={(photo) => onChange(photos.filter((item) => item.id !== photo.id))}
        onAnalyze={onAnalyze}
      />

      {cameraOpen ? <div className="survey-camera-modal" role="dialog" aria-modal="true" aria-label="กล้องถ่ายรูปทรัพย์">
        <video ref={videoRef} autoPlay muted playsInline />
        {(permission === 'denied' || permission === 'unsupported') ? <div className="survey-camera-error"><p>{cameraError}</p><button type="button" onClick={() => void requestCamera('environment')}>ลองเปิดกล้องอีกครั้ง</button></div> : null}
        <div className="survey-camera-top"><button type="button" aria-label="ปิดกล้อง" onClick={() => { setCameraOpen(false); setReplaceId(null) }}><span className="material-symbols-rounded">close</span></button><span>{categories.find((item) => item.id === category)?.label}</span><button type="button" aria-label="สลับกล้อง" onClick={() => void switchCamera()}><span className="material-symbols-rounded">cameraswitch</span></button></div>
        <button type="button" className="survey-shutter" aria-label="ถ่ายรูป" disabled={permission !== 'granted' || loading} onClick={() => void takePhoto()}><span /></button>
      </div> : null}

      {fullPhoto ? <div className="survey-full-photo" role="dialog" aria-modal="true"><img src={fullPhoto.dataUrl} alt="ดูรูปเต็มจอ" /><button type="button" aria-label="ปิดรูปเต็มจอ" onClick={() => setFullPhoto(null)}><span className="material-symbols-rounded">close</span></button><small>{new Date(fullPhoto.capturedAt).toLocaleString('th-TH')}<br />GPS {fullPhoto.latitude?.toFixed(5) || '-'}, {fullPhoto.longitude?.toFixed(5) || '-'}</small></div> : null}
    </section>
  )
}