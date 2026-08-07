import React, { memo } from 'react'

type TaskSummaryProps = {
  today: number
  week: number
  month: number
  completed: number
  pending: number
  cancelled: number
}

function TaskSummary({ today, week, month, completed, pending, cancelled }: TaskSummaryProps) {
  return (
    <section className="db-card">
      <div className="db-eyebrow">สรุปงาน</div>
      <h2>ภาพรวมภาระงาน</h2>
      <div className="db-stat-grid">
        <div><span>งานวันนี้</span><strong>{today}</strong></div>
        <div><span>สัปดาห์นี้</span><strong>{week}</strong></div>
        <div><span>เดือนนี้</span><strong>{month}</strong></div>
        <div><span>เสร็จแล้ว</span><strong>{completed}</strong></div>
        <div><span>รอดำเนินการ</span><strong>{pending}</strong></div>
        <div><span>ยกเลิก</span><strong>{cancelled}</strong></div>
      </div>
    </section>
  )
}

export default memo(TaskSummary)
