import React, { useState } from 'react'
import { CameraPermissionState } from '../../hooks/useDeviceCamera'
import { cameraService } from '../../services/camera/cameraService'

type CameraPermissionProps = {
  permission: CameraPermissionState
  error: string
  onRetry: () => void
  onGallery: () => void
}

export default function CameraPermission({ permission, error, onRetry, onGallery }: CameraPermissionProps) {
  const [showInstructions, setShowInstructions] = useState(false)
  const denied = permission === 'denied'
  return (
    <div className="survey-ai-permission" role="alert">
      <span className="material-symbols-rounded" aria-hidden="true">no_photography</span>
      <h2>{denied ? 'Fieldmate AI ต้องใช้กล้องเพื่อถ่ายภาพทรัพย์' : permission === 'unsupported' ? 'เบราว์เซอร์นี้ไม่รองรับกล้อง' : 'กำลังขอสิทธิ์ใช้งานกล้อง'}</h2>
      <p>{error || 'อนุญาตการใช้กล้องเพื่อถ่ายภาพจริงและบันทึกลงแบบสำรวจ'}</p>
      {showInstructions ? <p className="survey-ai-settings-help">{cameraService.permissionInstructions()}</p> : null}
      <div>
        {denied ? <button type="button" onClick={() => setShowInstructions(true)}>เปิดการตั้งค่า</button> : <button type="button" onClick={onRetry}>ลองเปิดกล้องอีกครั้ง</button>}
        <button type="button" onClick={onGallery}>เลือกจากคลังรูปภาพ</button>
      </div>
    </div>
  )
}