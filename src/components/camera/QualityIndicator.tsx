import React, { memo } from 'react'

type QualityMetrics = {
  blur: number
  brightness: number
  exposure: number
  angle: number
  distance: number
  resolution: number
  gpsAvailable: boolean
}

type QualityIndicatorProps = {
  metrics: QualityMetrics
}

function meterLabel(value: number) {
  if (value > 84) return 'Excellent'
  if (value > 68) return 'Good'
  if (value > 52) return 'Fair'
  return 'Poor'
}

function QualityIndicator({ metrics }: QualityIndicatorProps) {
  const avg = Math.round((metrics.blur + metrics.brightness + metrics.exposure + metrics.angle + metrics.distance + metrics.resolution) / 6)
  const warn = avg < 62 || !metrics.gpsAvailable

  return (
    <section className="cam-quality">
      <div className="cam-section-title-row">
        <h3>Image Quality</h3>
        <span className={`cam-score ${warn ? 'is-warn' : ''}`}>{meterLabel(avg)} {avg}%</span>
      </div>
      <div className="cam-quality-grid">
        <div><span>Blur</span><strong>{metrics.blur}%</strong></div>
        <div><span>Brightness</span><strong>{metrics.brightness}%</strong></div>
        <div><span>Exposure</span><strong>{metrics.exposure}%</strong></div>
        <div><span>Angle</span><strong>{metrics.angle}%</strong></div>
        <div><span>Distance</span><strong>{metrics.distance}%</strong></div>
        <div><span>Resolution</span><strong>{metrics.resolution}%</strong></div>
      </div>
      {warn ? <p className="cam-warning">Quality warning: retake recommended for valuation accuracy.</p> : <p className="cam-ok">Quality ready for AI valuation pipeline.</p>}
    </section>
  )
}

export default memo(QualityIndicator)
