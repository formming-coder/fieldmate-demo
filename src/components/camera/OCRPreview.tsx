import React, { memo } from 'react'

type OCRPreviewProps = {
  text: string[]
  documentDetected: boolean
}

function OCRPreview({ text, documentDetected }: OCRPreviewProps) {
  return (
    <section className="cam-ocr">
      <div className="cam-section-title-row">
        <h3>Document OCR</h3>
        <span className={`cam-score ${documentDetected ? '' : 'is-warn'}`}>{documentDetected ? 'Auto-crop Ready' : 'Searching'}</span>
      </div>
      <p className="cam-ocr-meta">Perspective correction and line detection are simulated in realtime.</p>
      <div className="cam-ocr-lines">
        {text.map((line, index) => (
          <mark key={`${line}-${index}`}>{line}</mark>
        ))}
      </div>
    </section>
  )
}

export default memo(OCRPreview)
