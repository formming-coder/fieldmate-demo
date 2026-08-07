import React, { memo } from 'react'

type KnowledgeCardProps = {
  recentKnowledge: string
  popularProperty: string
  recentlyShared: string
  bookmarks: number
}

function KnowledgeCard({ recentKnowledge, popularProperty, recentlyShared, bookmarks }: KnowledgeCardProps) {
  return (
    <section className="db-card">
      <div className="db-eyebrow">Knowledge Center</div>
      <h2>Shared intelligence</h2>
      <div className="db-info-list">
        <div><span>Recent knowledge</span><strong>{recentKnowledge}</strong></div>
        <div><span>Popular property</span><strong>{popularProperty}</strong></div>
        <div><span>Recently shared</span><strong>{recentlyShared}</strong></div>
        <div><span>Bookmarks</span><strong>{bookmarks}</strong></div>
      </div>
    </section>
  )
}

export default memo(KnowledgeCard)
