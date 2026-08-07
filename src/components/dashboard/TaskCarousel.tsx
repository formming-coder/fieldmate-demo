import React, { memo } from 'react'
import { motion } from 'framer-motion'

type TaskItem = {
  id: string
  owner: string
  province: string
  propertyType: string
  appointmentTime: string
  status: string
  distanceKm: number
  image: string
  propertyId: string
}

type TaskCarouselProps = {
  tasks: TaskItem[]
  onOpenTask: (propertyId: string) => void
}

function statusLabel(status: string) {
  if (status === 'completed') return 'Completed'
  if (status === 'pending') return 'Pending'
  return 'Open'
}

function TaskCarousel({ tasks, onOpenTask }: TaskCarouselProps) {
  return (
    <section className="dashboard-section">
      <h2 className="dashboard-section-title">Today's Tasks</h2>
      <div className="task-carousel" role="list">
        {tasks.map((task, index) => (
          <motion.button
            key={task.id}
            type="button"
            className="task-card"
            whileTap={{ scale: 0.98 }}
            onClick={() => onOpenTask(task.propertyId)}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.06 }}
          >
            <img src={task.image} alt={task.owner} className="task-image" loading="lazy" />
            <div className="task-body">
              <div className="task-topline">
                <strong>{task.owner}</strong>
                <span className={`task-status task-status-${task.status}`}>{statusLabel(task.status)}</span>
              </div>
              <div className="task-meta">{task.province} • {task.propertyType}</div>
              <div className="task-meta">นัดหมาย {task.appointmentTime}</div>
              <div className="task-distance">{task.distanceKm} km</div>
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  )
}

export default memo(TaskCarousel)
