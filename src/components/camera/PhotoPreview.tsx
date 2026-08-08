import React from 'react'

type PhotoPreviewProps = { image: string; onRetake: () => void; onUse: () => void }

export default function PhotoPreview({ image, onRetake, onUse }: PhotoPreviewProps) {
  return (
    <section className="survey-ai-photo-preview">
      <img src={image} alt="ตัวอย่างภาพถ่าย" />
      <div><button type="button" onClick={onRetake}>ถ่ายใหม่</button><button type="button" className="primary" onClick={onUse}>ใช้รูปนี้</button></div>
    </section>
  )
}