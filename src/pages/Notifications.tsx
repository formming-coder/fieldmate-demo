import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Layout from '../components/Layout'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNotificationsQuery, queryKeys } from '../hooks/useBackendQueries'
import { notificationRepository } from '../repositories'

type NotificationFilter = 'all' | 'unread' | 'read'

function getTone(title: string) {
  const lower = title.toLowerCase()
  if (lower.includes('ตลาด')) return 'market'
  if (lower.includes('น้ำท่วม')) return 'flood'
  if (lower.includes('ป่า')) return 'forest'
  return 'ai'
}

export default function Notifications() {
  const queryClient = useQueryClient()
  const { data: notifications = [] } = useNotificationsQuery()
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all')
  const items = useMemo(() => notifications.map((item) => ({ ...item, detail: item.body, unread: !item.read, tone: getTone(item.title) })), [notifications])

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationRepository.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
  })

  const dismissMutation = useMutation({
    mutationFn: (id: string) => notificationRepository.dismiss(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
  })

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationRepository.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
  })

  const grouped = useMemo(
    () => ({
      unread: items.filter((item) => item.unread),
      read: items.filter((item) => !item.unread),
    }),
    [items]
  )

  const listByFilter = useMemo(() => {
    if (activeFilter === 'unread') return grouped.unread
    if (activeFilter === 'read') return grouped.read
    return items
  }, [activeFilter, grouped.read, grouped.unread, items])

  return (
    <Layout title="การแจ้งเตือน">
      <div className="notifications-page">
        <section className="notifications-hero">
          <div>
            <div className="notifications-kicker">ศูนย์การแจ้งเตือน</div>
            <h1>ยังไม่ได้อ่าน {items.filter((item) => item.unread).length} รายการ</h1>
            <p>ระบบจัดลำดับความสำคัญให้ AI การเปลี่ยนแปลงของตลาด และการเตือนภัยน้ำท่วมหรือพื้นที่ป่าเพื่อรองรับงานภาคสนาม</p>
          </div>
          <div className="notifications-badge">เร่งด่วน</div>
        </section>

        <section className="notification-group">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            <button type="button" onClick={() => setActiveFilter('all')}>ทั้งหมด ({items.length})</button>
            <button type="button" onClick={() => setActiveFilter('unread')}>ยังไม่อ่าน ({grouped.unread.length})</button>
            <button type="button" onClick={() => setActiveFilter('read')}>อ่านแล้ว ({grouped.read.length})</button>
            <button type="button" onClick={() => markAllReadMutation.mutate()} disabled={!grouped.unread.length}>อ่านทั้งหมด</button>
          </div>
        </section>

        <div className="notifications-list">
          {activeFilter !== 'read' ? <section className="notification-group">
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
                  <span className="notification-unread">ยังไม่อ่าน</span>
                  <button type="button" onClick={() => markReadMutation.mutate(item.id)}>เก็บถาวร</button>
                  <button type="button" onClick={() => dismissMutation.mutate(item.id)}>ลบ</button>
                </div>
              </motion.article>
            ))}
            {!grouped.unread.length ? <p style={{ margin: 0, color: '#7a6c5b' }}>ไม่มีรายการยังไม่อ่าน</p> : null}
          </section> : null}

          {activeFilter !== 'unread' ? <section className="notification-group">
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
                  <span className="notification-read">อ่านแล้ว</span>
                  <button type="button" onClick={() => dismissMutation.mutate(item.id)}>ลบ</button>
                </div>
              </motion.article>
            ))}
            {!grouped.read.length ? <p style={{ margin: 0, color: '#7a6c5b' }}>ยังไม่มีรายการที่อ่านแล้ว</p> : null}
          </section> : null}

          {!listByFilter.length ? (
            <section className="notification-group">
              <p style={{ margin: 0, color: '#7a6c5b' }}>ไม่มีการแจ้งเตือนในตัวกรองนี้</p>
            </section>
          ) : null}
        </div>
      </div>
    </Layout>
  )
}
