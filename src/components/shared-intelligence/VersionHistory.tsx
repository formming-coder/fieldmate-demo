import React, { memo } from 'react'

export type VersionItem = {
  id: string
  officer: string
  changed: string
  when: string
}

type VersionHistoryProps = {
  items: VersionItem[]
  onCompare: (id: string) => void
}

function VersionHistory({ items, onCompare }: VersionHistoryProps) {
  return (
    <section className="spi-section">
      <div className="spi-section-title">Version History</div>
      <div className="spi-version-list">
        {items.map((item) => (
          <div key={item.id} className="spi-version-item">
            <div>
              <strong>{item.officer}</strong>
              <p>{item.changed}</p>
            </div>
            <div>
              <time>{item.when}</time>
              <button type="button" onClick={() => onCompare(item.id)}>Compare</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default memo(VersionHistory)
