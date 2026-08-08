import React from 'react'
import { ImageQuality } from '../../types'

type ImageQualityCheckProps = { quality: ImageQuality; onRetake: () => void; onUse: () => void }

export default function ImageQualityCheck({ quality, onRetake, onUse }: ImageQualityCheckProps) {
  if (!quality.recommendations.length) return null
  return (
    <section className="survey-ai-quality" role="alert">
      <span className="material-symbols-rounded" aria-hidden="true">warning</span>
      <div><h2>คุณภาพภาพควรปรับปรุง</h2>{quality.recommendations.map((message) => <p key={message}>{message}</p>)}</div>
      <div><button type="button" onClick={onRetake}>ถ่ายใหม่</button><button type="button" onClick={onUse}>ใช้รูปนี้</button></div>
    </section>
  )
}