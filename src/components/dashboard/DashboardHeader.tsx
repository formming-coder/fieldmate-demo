import React, { memo } from 'react'
import BrandMark from '../BrandMark'
import { Avatar, IconButton } from '../ui'

type DashboardHeaderProps = {
  userName: string
  greeting: string
  onNotifications: () => void
  onAssistant: () => void
}

function DashboardHeader({ userName, greeting, onNotifications, onAssistant }: DashboardHeaderProps) {
  return (
    <header className="db-header">
      <div className="db-header-leading">
        <BrandMark size="small" />
        <div>
          <div className="db-header-greeting">{greeting}</div>
          <div className="db-header-name">{userName}</div>
        </div>
      </div>
      <div className="db-header-actions">
        <IconButton label="Notifications" onClick={onNotifications}>🔔</IconButton>
        <IconButton label="AI Assistant" onClick={onAssistant}>✨</IconButton>
        <Avatar name={userName} size={44} />
      </div>
    </header>
  )
}

export default memo(DashboardHeader)
