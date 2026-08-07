import React, { memo } from 'react'

type AITipsProps = {
  confidence: number
}

function AITips({ confidence }: AITipsProps) {
  return (
    <aside className="smart-ai-panel" aria-label="AI วิเคราะห์พื้นที่">
      <div className="smart-ai-title">AI วิเคราะห์พื้นที่</div>
      <ul>
        <li>ตลาดใกล้เคียง: ความเคลื่อนไหวสูง</li>
        <li>ความเสี่ยงน้ำท่วม: ต่ำ</li>
        <li>พื้นที่ป่า: รัศมีระดับปานกลาง</li>
        <li>การใช้ประโยชน์ที่ดิน: ที่อยู่อาศัยผสมผสาน</li>
      </ul>
      <div className="smart-ai-confidence">ความมั่นใจ {confidence}%</div>
    </aside>
  )
}

export default memo(AITips)
