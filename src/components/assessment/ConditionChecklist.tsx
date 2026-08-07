import React, { memo } from 'react'

type ConditionItem = {
  key: string
  checked: boolean
}

type ConditionChecklistProps = {
  items: ConditionItem[]
  onToggle: (key: string) => void
}

function ConditionChecklist({ items, onToggle }: ConditionChecklistProps) {
  return (
    <section className="as-card">
      <h2>รายการตรวจสภาพ</h2>
      <div className="as-check-list">
        {items.map((item) => (
          <label key={item.key}>
            <input type="checkbox" checked={item.checked} onChange={() => onToggle(item.key)} />
            <span>{item.key}</span>
          </label>
        ))}
      </div>
    </section>
  )
}

export default memo(ConditionChecklist)
