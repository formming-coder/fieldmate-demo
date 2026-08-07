import React, { memo } from 'react'

type QuickActionProps = {
  icon: string
  title: string
  subtitle: string
  onClick: () => void
}

function QuickAction({ icon, title, subtitle, onClick }: QuickActionProps) {
  return (
    <button type="button" className="db-quick-action" onClick={onClick}>
      <div className="db-quick-icon"><span className="material-symbols-rounded" aria-hidden="true">{icon}</span></div>
      <div className="db-quick-title">{title}</div>
      <div className="db-quick-subtitle">{subtitle}</div>
    </button>
  )
}

export default memo(QuickAction)
