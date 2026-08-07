import React, { memo } from 'react'
import { BottomSheet } from '../ui'
import { SearchResult } from './SearchResultCard'

type DetailData = SearchResult & {
  timeline: Array<{ id: string; title: string; meta: string }>
  assessment: string
  comparable: Array<{ id: string; label: string; price: number }>
  mapText: string
  officerRole: string
  gallery: string[]
}

type ResultBottomSheetProps = {
  open: boolean
  result: DetailData | null
  onClose: () => void
  onOpenMap: () => void
  onOpenCamera: () => void
  onOpenAssessment: () => void
  onShare: () => void
  onCopy: () => void
  onBookmark: () => void
}

function ResultBottomSheet({ open, result, onClose, onOpenMap, onOpenCamera, onOpenAssessment, onShare, onCopy, onBookmark }: ResultBottomSheetProps) {
  if (!result) return <BottomSheet open={open} onClose={onClose}><div /></BottomSheet>

  return (
    <BottomSheet open={open} onClose={onClose} snapPoints={[0.34, 0.72, 0.94]} initialSnap={1}>
      <div className="ais-detail-sheet">
        <img src={result.image} alt={result.title} className="ais-detail-image" />
        <div className="ais-detail-head">
          <div>
            <span className="ais-result-category">{result.category}</span>
            <h3>{result.title}</h3>
            <p>{result.subtitle}</p>
          </div>
          <strong>{result.price.toLocaleString()} บาท</strong>
        </div>
        <div className="ais-detail-grid">
          <div><span>ผู้รับผิดชอบ</span><strong>{result.officer}</strong></div>
          <div><span>ความมั่นใจ AI</span><strong>{result.aiConfidence}%</strong></div>
          <div><span>ผลประเมิน</span><strong>{result.assessment}</strong></div>
          <div><span>แผนที่</span><strong>{result.mapText}</strong></div>
        </div>
        <div className="ais-subsection">
          <div className="ais-block-title">ไทม์ไลน์</div>
          <div className="ais-detail-list">
            {result.timeline.map((item) => (
              <div key={item.id} className="ais-detail-list-item">
                <strong>{item.title}</strong>
                <span>{item.meta}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="ais-subsection">
          <div className="ais-block-title">ทรัพย์เปรียบเทียบ</div>
          <div className="ais-inline-rail">
            {result.comparable.map((item) => (
              <div key={item.id} className="ais-inline-card">
                <strong>{item.label}</strong>
                <span>{item.price.toLocaleString()} บาท</span>
              </div>
            ))}
          </div>
        </div>
        <div className="ais-subsection">
          <div className="ais-block-title">แกลเลอรีภาพ</div>
          <div className="ais-inline-rail">
            {result.gallery.map((image, index) => <img key={`${image}-${index}`} src={image} alt={`gallery-${index + 1}`} className="ais-gallery-thumb" />)}
          </div>
        </div>
        <div className="ais-officer-row">
          <div className="ais-officer-avatar">{result.officer.slice(0, 2).toUpperCase()}</div>
          <div>
            <strong>{result.officer}</strong>
            <span>{result.officerRole}</span>
          </div>
        </div>
        <div className="ais-inline-actions">
          <button type="button" onClick={onOpenMap}>แผนที่อัจฉริยะ</button>
          <button type="button" onClick={onOpenCamera}>กล้อง AI</button>
          <button type="button" onClick={onOpenAssessment}>ประเมิน</button>
          <button type="button" onClick={onShare}>แชร์</button>
          <button type="button" onClick={onCopy}>คัดลอก</button>
          <button type="button" className="is-primary" onClick={onBookmark}>บันทึก</button>
        </div>
      </div>
    </BottomSheet>
  )
}

export default memo(ResultBottomSheet)
