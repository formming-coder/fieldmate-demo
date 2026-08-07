import React, { memo } from 'react'

type TrendingCardProps = {
  title: string
  subtitle: string
  value: string
  onSelect: () => void
}

function TrendingCard({ title, subtitle, value, onSelect }: TrendingCardProps) {
  return (
    <button type="button" className="ais-trending-card" onClick={onSelect}>
      <strong>{title}</strong>
      <span>{subtitle}</span>
      <em>{value}</em>
    </button>
  )
}

export default memo(TrendingCard)
