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
      <div className="rp-eyebrow">Offline Support</div>
      <h2>Route package</h2>
      <div className="rp-info-list">
        <div><span>Offline Maps</span><strong>{downloaded ? 'Downloaded' : 'Ready'}</strong></div>
        <div><span>Queue Upload</span><strong>{pendingUpload}</strong></div>
        <div><span>Cached Property Data</span><strong>{cachedRecords}</strong></div>
      </div>
      <button type="button" className="rp-primary-btn" onClick={onDownload}>Download Route</button>
    </section>
  )
}

export default memo(OfflineDownload)
