import React, { memo } from 'react'

type OfficerCardProps = {
  name: string
  role: string
  updates: number
}

function OfficerCard({ name, role, updates }: OfficerCardProps) {
  return (
    <section className="spi-officer-card">
      <div className="spi-officer-avatar">{name.slice(0, 2).toUpperCase()}</div>
      <div>
        <strong>{name}</strong>
        <p>{role}</p>
      </div>
      <span>{updates} updates</span>
    </section>
  )
}

export default memo(OfficerCard)
