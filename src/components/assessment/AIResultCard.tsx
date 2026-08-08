import React from 'react'
import { AIAnalysis } from '../../types'

const percent = (value: number) => `${value >= 0 ? '+' : ''}${(value * 100).toFixed(1)}%`

export default function AIResultCard({ analysis }: { analysis: AIAnalysis }) {
  const { result, calculation } = analysis
  return <section className="as-card aa-ai-result"><span>ผลวิเคราะห์เบื้องต้นจาก AI</span><h2>{result.estimatedValue.toLocaleString('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 })}</h2><p>ช่วงราคา {result.minimumValue.toLocaleString('th-TH')} – {result.maximumValue.toLocaleString('th-TH')} บาท</p><div className="aa-reasoning"><strong>เหตุผลประกอบการประเมิน</strong><p>{result.reasoning}</p></div><div className="aa-calculation"><h3>รายละเอียดการคำนวณ</h3><div><span>ราคาเฉลี่ยทรัพย์เปรียบเทียบ</span><strong>{calculation.comparableAverage.toLocaleString('th-TH')} บาท</strong></div><div><span>ปรับตามราคา</span><strong>{percent(calculation.priceAdjustment)}</strong></div><div><span>ปรับตามทำเล</span><strong>{percent(calculation.locationAdjustment)}</strong></div><div><span>ปรับตามสภาพทรัพย์</span><strong>{percent(calculation.propertyConditionAdjustment)}</strong></div><div><span>ปรับตามพื้นที่</span><strong>{percent(calculation.areaAdjustment)}</strong></div><div><span>ช่วงราคาที่ AI แนะนำ</span><strong>{calculation.finalMinimum.toLocaleString('th-TH')} – {calculation.finalMaximum.toLocaleString('th-TH')} บาท</strong></div></div></section>
}