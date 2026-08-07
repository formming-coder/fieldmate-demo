import React, { memo } from 'react'

type OfflineDownloadProps = {
  downloaded: boolean
  pendingUpload: number
  cachedRecords: number
  onDownload: () => void
}

function OfflineDownload({ downloaded, pendingUpload, cachedRecords, onDownload }: OfflineDownloadProps) {
  return (
    <section className="rp-card">
      <div className="rp-eyebrow">รองรับออฟไลน์</div>
      <h2>แพ็กเกจเส้นทาง</h2>
      <div className="rp-info-list">
        <div><span>แผนที่ออฟไลน์</span><strong>{downloaded ? 'ดาวน์โหลดแล้ว' : 'พร้อมใช้งาน'}</strong></div>
        <div><span>คิวอัปโหลด</span><strong>{pendingUpload}</strong></div>
        <div><span>ข้อมูลทรัพย์ในแคช</span><strong>{cachedRecords}</strong></div>
      </div>
      <button type="button" className="rp-primary-btn" onClick={onDownload}>ดาวน์โหลดเส้นทาง</button>
    </section>
  )
}

export default memo(OfflineDownload)
