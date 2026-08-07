import React, { memo } from 'react'

type AISuggestionProps = {
  suggestions: string[]
  onSelect: (value: string) => void
}

function AISuggestion({ suggestions, onSelect }: AISuggestionProps) {
  if (!suggestions.length) return null

  return (
    <section className="ais-block">
      <div className="ais-block-title">AI Suggestions</div>
      <div className="ais-suggestion-list">
        {suggestions.map((suggestion) => (
          <button type="button" key={suggestion} className="ais-suggestion" onClick={() => onSelect(suggestion)}>
            {suggestion}
          </button>
        ))}
      </div>
    </section>
  )
}

export default memo(AISuggestion)
