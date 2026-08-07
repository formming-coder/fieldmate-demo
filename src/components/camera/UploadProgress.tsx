import React, { memo } from 'react'

type UploadItem = {
  id: string
  name: string
  progress: number
  status: 'queued' | 'uploading' | 'done' | 'error'
}

type UploadProgressProps = {
  items: UploadItem[]
  onRetry: (id: string) => void
}

function UploadProgress({ items, onRetry }: UploadProgressProps) {
  return (
    <section className="cam-upload">
      <div className="cam-section-title-row">
        <h3>Background Upload</h3>
        <span className="cam-score">{items.filter((item) => item.status === 'done').length}/{items.length}</span>
      </div>
      <div className="cam-upload-list">
        {items.map((item) => (
          <div key={item.id} className="cam-upload-item">
            <div className="cam-upload-top">
              <span>{item.name}</span>
              <span>{item.status}</span>
            </div>
            <div className="cam-upload-bar"><span style={{ width: `${item.progress}%` }} /></div>
            {item.status === 'error' ? <button type="button" onClick={() => onRetry(item.id)}>Retry upload</button> : null}
          </div>
        ))}
      </div>
    </section>
  )
}

export default memo(UploadProgress)
