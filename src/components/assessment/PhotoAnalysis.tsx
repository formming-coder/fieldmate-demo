import React, { useState } from 'react'
import { SurveyPhoto } from '../../types'

const categoryLabel = { front: 'ภาพด้านหน้า', side: 'ภาพด้านข้าง', rear: 'ภาพด้านหลัง', road: 'ภาพถนน', surroundings: 'ภาพโดยรอบ', sign: 'ภาพป้ายประกาศ', document: 'เอกสาร', other: 'อื่น ๆ' }

export default function PhotoAnalysis({ photos, onAdd, onRetake }: { photos: SurveyPhoto[]; onAdd: () => void; onRetake: (photo: SurveyPhoto) => void }) {
  const [active, setActive] = useState<SurveyPhoto | null>(null)
  return (
    <section className="as-card aa-photo-analysis">
      <div className="aa-section-heading"><div><h2>วิเคราะห์รูปภาพ</h2><p>รูปภาพทั้งหมด {photos.length} รูป</p></div><button type="button" onClick={onAdd}>เพิ่มรูป</button></div>
      <div className="aa-photo-grid">
        {photos.map((photo) => <article key={photo.id}><button type="button" onClick={() => setActive(photo)}><img src={photo.thumbnailDataUrl || photo.dataUrl} alt={categoryLabel[photo.type]} /></button><strong>{categoryLabel[photo.type]}</strong><span>OCR: {photo.ocrStatus === 'completed' ? 'อ่านแล้ว' : photo.ocrStatus === 'pending' ? 'รอวิเคราะห์' : 'ยังไม่ยืนยัน'}</span><button type="button" onClick={() => onRetake(photo)}>ถ่ายใหม่</button></article>)}
      </div>
      {!photos.length ? <div className="aa-empty">ยังไม่มีรูปจากแบบสำรวจ</div> : null}
      {active ? <div className="aa-photo-modal" role="dialog" aria-modal="true"><img src={active.dataUrl} alt={categoryLabel[active.type]} /><button type="button" onClick={() => setActive(null)} aria-label="ปิด"><span className="material-symbols-rounded">close</span></button></div> : null}
    </section>
  )
}