import React from 'react'
import { AssessmentConfidence } from '../../types'

const labels: Array<[keyof AssessmentConfidence, string]> = [['dataCompleteness', 'ความครบถ้วนของข้อมูล'], ['photoQuality', 'คุณภาพรูปภาพ'], ['locationConfidence', 'ความมั่นใจด้านทำเล'], ['comparableQuality', 'คุณภาพทรัพย์เปรียบเทียบ'], ['ocrConfidence', 'ความมั่นใจ OCR'], ['overallConfidence', 'ความมั่นใจโดยรวม']]

export default function ConfidenceScore({ confidence }: { confidence: AssessmentConfidence }) {
  const level = confidence.overallConfidence >= 80 ? 'สูง' : confidence.overallConfidence >= 60 ? 'ปานกลาง' : 'ต่ำ'
  return <section className="as-card"><div className="aa-confidence-head"><div><span>ความมั่นใจ</span><strong>{confidence.overallConfidence}%</strong></div><b>{level}</b></div><div className="aa-score-list">{labels.map(([key, label]) => <div key={key}><span>{label}</span><div><i style={{ width: `${confidence[key]}%` }} /></div><strong>{confidence[key]}%</strong></div>)}</div></section>
}