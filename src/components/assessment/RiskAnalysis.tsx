import React from 'react'
import { RiskAnalysis as RiskAnalysisType } from '../../types'

export default function RiskAnalysis({ analysis }: { analysis: RiskAnalysisType }) {
  return <section className="as-card"><div className="aa-section-heading"><div><h2>ความเสี่ยงเบื้องต้น</h2><p>ภาพรวม {analysis.overallLevel}</p></div></div><div className="aa-risk-list">{analysis.items.map((item) => <div key={item.id}><div><strong>{item.label}</strong><span>{item.detail}</span></div><b className={`level-${item.level}`}>{item.level}</b></div>)}</div></section>
}