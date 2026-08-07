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
  if (value > 84) return 'ยอดเยี่ยม'
  if (value > 68) return 'ดี'
  if (value > 52) return 'พอใช้'
  return 'ควรถ่ายใหม่'
}

function QualityIndicator({ metrics }: QualityIndicatorProps) {
  const avg = Math.round((metrics.blur + metrics.brightness + metrics.exposure + metrics.angle + metrics.distance + metrics.resolution) / 6)
  const warn = avg < 62 || !metrics.gpsAvailable

  return (
    <section className="cam-quality">
      <div className="cam-section-title-row">
        <h3>คุณภาพภาพถ่าย</h3>
        <span className={`cam-score ${warn ? 'is-warn' : ''}`}>{meterLabel(avg)} {avg}%</span>
      </div>
      <div className="cam-quality-grid">
        <div><span>ความคมชัด</span><strong>{metrics.blur}%</strong></div>
        <div><span>ความสว่าง</span><strong>{metrics.brightness}%</strong></div>
        <div><span>แสง</span><strong>{metrics.exposure}%</strong></div>
        <div><span>มุมกล้อง</span><strong>{metrics.angle}%</strong></div>
        <div><span>ระยะถ่าย</span><strong>{metrics.distance}%</strong></div>
        <div><span>ความละเอียด</span><strong>{metrics.resolution}%</strong></div>
      </div>
      {warn ? <p className="cam-warning">คุณภาพภาพยังไม่พร้อม แนะนำให้ถ่ายใหม่เพื่อความแม่นยำในการประเมิน</p> : <p className="cam-ok">คุณภาพภาพพร้อมสำหรับการวิเคราะห์ AI</p>}
    </section>
  )
}

export default memo(QualityIndicator)
