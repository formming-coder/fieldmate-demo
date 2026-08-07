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
      <div className="db-eyebrow">Task Summary</div>
      <h2>Workload overview</h2>
      <div className="db-stat-grid">
        <div><span>Today's Jobs</span><strong>{today}</strong></div>
        <div><span>This Week</span><strong>{week}</strong></div>
        <div><span>This Month</span><strong>{month}</strong></div>
        <div><span>Completed</span><strong>{completed}</strong></div>
        <div><span>Pending</span><strong>{pending}</strong></div>
        <div><span>Cancelled</span><strong>{cancelled}</strong></div>
      </div>
    </section>
  )
}

export default memo(TaskSummary)
