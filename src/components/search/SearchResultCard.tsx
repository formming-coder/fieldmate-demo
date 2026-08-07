import React, { memo } from 'react'

export type SearchResult = {
  id: string
  title: string
  image: string
  price: number
  distance: string
  officer: string
  aiConfidence: number
  bookmarked: boolean
  category: string
  subtitle: string
}

type SearchResultCardProps = {
  result: SearchResult
  onOpen: () => void
  onBookmark: () => void
}

function SearchResultCard({ result, onOpen, onBookmark }: SearchResultCardProps) {
  return (
    <article className="ais-result-card">
      <img src={result.image} alt={result.title} className="ais-result-image" />
      <div className="ais-result-body">
        <div className="ais-result-head">
          <div>
            <span className="ais-result-category">{result.category}</span>
            <h3>{result.title}</h3>
            <p>{result.subtitle}</p>
          </div>
          <strong>{result.price.toLocaleString()} บาท</strong>
        </div>
        <div className="ais-result-meta">
          <span>{result.distance}</span>
          <span>{result.officer}</span>
          <span>AI {result.aiConfidence}%</span>
        </div>
        <div className="ais-result-actions">
          <button type="button" onClick={onBookmark}>{result.bookmarked ? 'บันทึกแล้ว' : 'บันทึก'}</button>
          <button type="button" className="is-primary" onClick={onOpen}>เปิดรายละเอียด</button>
        </div>
      </div>
    </article>
  )
}

export default memo(SearchResultCard)
