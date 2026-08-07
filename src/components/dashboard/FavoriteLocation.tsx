import React, { memo } from 'react'

type FavoriteLocationProps = {
  items: Array<{ title: string; subtitle: string; tag: string }>
}

function FavoriteLocation({ items }: FavoriteLocationProps) {
  return (
    <section className="db-card">
      <div className="db-eyebrow">Favorite Locations</div>
      <h2>Visited and pinned</h2>
      <div className="db-inline-cards">
        {items.map((item) => (
          <article key={`${item.title}-${item.tag}`} className="db-inline-card">
            <strong>{item.title}</strong>
            <span>{item.subtitle}</span>
            <em>{item.tag}</em>
          </article>
        ))}
      </div>
    </section>
  )
}

export default memo(FavoriteLocation)
