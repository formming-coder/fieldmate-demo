import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import Layout from '../components/Layout'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNotificationsQuery, queryKeys } from '../hooks/useBackendQueries'
import { notificationRepository } from '../repositories'

function getTone(title: string) {
  const lower = title.toLowerCase()
  if (lower.includes('market')) return 'market'
  if (lower.includes('flood')) return 'flood'
  if (lower.includes('forest')) return 'forest'
  return 'ai'
}

export default function Notifications() {
  const queryClient = useQueryClient()
  const { data: notifications = [] } = useNotificationsQuery()
  const items = useMemo(() => notifications.map((item) => ({ ...item, detail: item.body, unread: !item.read, tone: getTone(item.title) })), [notifications])

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationRepository.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
  })

  const dismissMutation = useMutation({
    mutationFn: (id: string) => notificationRepository.dismiss(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
  })

  const grouped = useMemo(
    () => ({
      unread: items.filter((item) => item.unread),
      read: items.filter((item) => !item.unread),
    }),
    [items]
  )

  return (
    <Layout title="Notifications">
      <div className="notifications-page">
        <section className="notifications-hero">
          <div>
            <div className="notifications-kicker">Notification Center</div>
            <h1>{items.filter((item) => item.unread).length} unread updates</h1>
            <p>AI alerts, market changes, flood and forest warnings are prioritized for field execution.</p>
          </div>
          <div className="notifications-badge">Priority</div>
        </section>

        <div className="notifications-list">
          <section className="notification-group">
            <h2>ยังไม่อ่าน</h2>
            {grouped.unread.map((item) => (
              <motion.article
                key={item.id}
                className={`notification-card notification-${item.tone}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                drag="x"
                dragConstraints={{ left: -120, right: 120 }}
                onDragEnd={(_, info) => {
                  if (info.offset.x > 86) {
                    markReadMutation.mutate(item.id)
                  }
                  if (info.offset.x < -86) {
                    dismissMutation.mutate(item.id)
                  }
                }}
              >
                <div className="notification-main">
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </div>
                <div className="notification-actions">
                  <span className="notification-unread">Unread</span>
                  <button type="button" onClick={() => markReadMutation.mutate(item.id)}>เก็บถาวร</button>
                  <button type="button" onClick={() => dismissMutation.mutate(item.id)}>ลบ</button>
                </div>
              </motion.article>
            ))}
          </section>

          <section className="notification-group">
            <h2>อ่านแล้ว</h2>
            {grouped.read.map((item) => (
              <motion.article
                key={item.id}
                className={`notification-card notification-${item.tone}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                drag="x"
                dragConstraints={{ left: -120, right: 120 }}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -86) {
                    dismissMutation.mutate(item.id)
                  }
                }}
              >
                <div className="notification-main">
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </div>
                <div className="notification-actions">
                  <span className="notification-read">Read</span>
                  <button type="button" onClick={() => dismissMutation.mutate(item.id)}>ลบ</button>
                </div>
              </motion.article>
            ))}
          </section>
        </div>
      </div>
    </Layout>
  )
}
