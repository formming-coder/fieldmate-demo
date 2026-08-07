import React, { memo } from 'react'

type AITipsProps = {
  confidence: number
}

function AITips({ confidence }: AITipsProps) {
  return (
    <aside className="smart-ai-panel" aria-label="AI วิเคราะห์พื้นที่">
      <div className="smart-ai-title">AI วิเคราะห์พื้นที่</div>
      <ul>
        <li>Nearby market: High activity</li>
        <li>Flood risk: Low</li>
        <li>Forest area: Medium radius</li>
        <li>Land use: Residential mixed-use</li>
      </ul>
      <div className="smart-ai-confidence">Confidence {confidence}%</div>
    </aside>
  )
}

export default memo(AITips)
