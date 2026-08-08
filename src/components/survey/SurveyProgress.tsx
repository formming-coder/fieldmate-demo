import React from 'react'

export default function SurveyProgress({ current, total, percent }: { current: number; total: number; percent: number }) {
  return (
    <div className="survey-progress" aria-label={`ขั้นตอน ${current} จาก ${total}`}>
      <div><span>ขั้นตอน {current}/{total}</span><strong>{percent}%</strong></div>
      <div className="survey-progress-track"><span style={{ width: `${percent}%` }} /></div>
    </div>
  )
}