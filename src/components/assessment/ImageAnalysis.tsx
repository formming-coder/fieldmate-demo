import React, { memo } from 'react'

type DetectionItem = {
  id: string
  label: string
  confidence: number
}

type ImageAnalysisProps = {
  image: string
  detections: DetectionItem[]
}

function ImageAnalysis({ image, detections }: ImageAnalysisProps) {
  return (
    <section className="as-card">
      <h2>AI Image Analysis</h2>
      <div className="as-analysis-frame">
        <img src={image} alt="analysis" />
        {detections.slice(0, 4).map((item, index) => (
          <div key={item.id} className="as-box" style={{ left: `${10 + index * 17}%`, top: `${12 + index * 10}%` }}>
            <span>{item.label} {Math.round(item.confidence * 100)}%</span>
          </div>
        ))}
      </div>
      <div className="as-chip-row">
        {detections.map((item) => <span key={item.id} className="as-chip">{item.label} {Math.round(item.confidence * 100)}%</span>)}
      </div>
    </section>
  )
}

export default memo(ImageAnalysis)
