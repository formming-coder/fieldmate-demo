import React, { memo } from 'react'

type OCRPreviewProps = {
  text: string[]
  documentDetected: boolean
  progress?: number
  status?: 'idle' | 'running' | 'done' | 'error'
}

function OCRPreview({ text, documentDetected, progress = 0, status = 'idle' }: OCRPreviewProps) {
  return (
    <section className="cam-ocr">
      <div className="cam-section-title-row">
        <h3>ผลลัพธ์ OCR</h3>
        <span className={`cam-score ${documentDetected ? '' : 'is-warn'}`}>{status === 'running' ? `${progress}%` : documentDetected ? 'พร้อมอ่านเอกสาร' : 'รอภาพเอกสาร'}</span>
      </div>
      <p className="cam-ocr-meta">{status === 'running' ? 'กำลังวิเคราะห์ภาพและจัดแนว OCR...' : 'โครงสร้างพร้อมเชื่อมต่อ OCR API ในอนาคต โดยใช้ผลจำลองสำหรับเดโมในตอนนี้'}</p>
      <div className="cam-ocr-lines">
        {text.map((line, index) => (
          <mark key={`${line}-${index}`}>{line}</mark>
        ))}
      </div>
    </section>
  )
}

export default memo(OCRPreview)
