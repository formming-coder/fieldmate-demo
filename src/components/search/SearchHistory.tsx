import React, { memo } from 'react'
import { motion } from 'framer-motion'

export type SearchHistoryItem = {
  id: string
  query: string
  pinned: boolean
}

type SearchHistoryProps = {
  items: SearchHistoryItem[]
  onSelect: (query: string) => void
  onDelete: (id: string) => void
  onPin: (id: string) => void
}

function SearchHistory({ items, onSelect, onDelete, onPin }: SearchHistoryProps) {
  return (
    <section className="ais-block">
      <div className="ais-block-title">Recent Search</div>
      <div className="ais-history-list">
        {items.map((item) => (
          <motion.div key={item.id} className="ais-history-item" drag="x" dragConstraints={{ left: 0, right: 0 }} whileDrag={{ scale: 0.98 }}>
            <button type="button" className="ais-history-main" onClick={() => onSelect(item.query)}>
              <strong>{item.query}</strong>
              <span>{item.pinned ? 'Pinned' : 'Recent'}</span>
            </button>
            <div className="ais-history-actions">
              <button type="button" onClick={() => onPin(item.id)}>{item.pinned ? 'Unpin' : 'Pin'}</button>
              <button type="button" onClick={() => onDelete(item.id)}>Delete</button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export default memo(SearchHistory)
