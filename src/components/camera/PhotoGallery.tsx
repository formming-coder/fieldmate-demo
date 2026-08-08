import React from 'react'
import { SurveyPhoto } from '../../types'

const statusLabel = { idle: 'ยังไม่วิเคราะห์', processing: 'กำลังวิเคราะห์', completed: 'อ่าน OCR แล้ว', failed: 'OCR ไม่สำเร็จ', pending: 'รอวิเคราะห์' }
const categoryLabel = { front: 'ด้านหน้า', side: 'ด้านข้าง', rear: 'ด้านหลัง', road: 'ถนน', surroundings: 'บริเวณโดยรอบ', sign: 'ป้ายประกาศ', document: 'เอกสาร', other: 'อื่น ๆ' }

type PhotoGalleryProps = {
  photos: SurveyPhoto[]
  onView: (photo: SurveyPhoto) => void
  onRetake: (photo: SurveyPhoto) => void
  onDelete: (photo: SurveyPhoto) => void
  onAnalyze: (photo: SurveyPhoto) => void
}

export default function PhotoGallery({ photos, onView, onRetake, onDelete, onAnalyze }: PhotoGalleryProps) {
  return (
    <div className="survey-linked-gallery">
      {photos.map((photo) => <article key={photo.id}>
        <button type="button" className="survey-linked-image" onClick={() => onView(photo)}><img src={photo.thumbnailDataUrl || photo.dataUrl} alt={`รูป ${photo.type}`} /></button>
        <div className="survey-linked-meta"><strong>{categoryLabel[photo.type]}</strong><span>{statusLabel[photo.ocrStatus || 'idle']}</span><small>GPS {photo.latitude?.toFixed(4) || '-'}, {photo.longitude?.toFixed(4) || '-'}</small><small>{new Date(photo.capturedAt).toLocaleString('th-TH')}</small></div>
        <div className="survey-linked-actions"><button type="button" onClick={() => onRetake(photo)}>ถ่ายใหม่</button><button type="button" onClick={() => onDelete(photo)}>ลบ</button><button type="button" onClick={() => onAnalyze(photo)}>วิเคราะห์ OCR</button></div>
      </article>)}
    </div>
  )
}