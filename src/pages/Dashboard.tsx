import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import s from './Dashboard.module.css'
import { fetchProperties, fetchTasks, fetchUser, fetchNotifications } from '../api/mockApi'
import { Property, Task, Notification, User } from '../types'
import { SurfaceCard, StatPill } from '../components/SurveySurface'

type KPIProps = { label: string; value: string | number; icon?: React.ReactNode }
function KPI({ label, value, icon }: KPIProps){
  return (
    <div className={s.kpiCard}>
      <div className={s.kpiIcon}>{icon}</div>
      <div className={s.kpiContent}>
        <div className={s.kpiValue}>{value}</div>
        <div className={s.kpiLabel}>{label}</div>
      </div>
    </div>
  )
}

export default function Dashboard(){
  const nav = useNavigate()
  const [properties, setProperties] = useState<Property[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [notes, setNotes] = useState<Notification[]>([])

  useEffect(() => {
    let mounted = true
    Promise.all([fetchProperties(), fetchTasks(), fetchUser(), fetchNotifications()])
      .then(([p, t, u, n]) => {
        if(!mounted) return
        setProperties(p)
        setTasks(t)
        setUser(u || null)
        setNotes(n)
      })
    return () => { mounted = false }
  }, [])

  const go = (path: string) => () => nav(path)

  const todaysTasks = tasks.filter(t => new Date(t.scheduledAt).toDateString() === new Date().toDateString())
  const completedCount = tasks.filter(t => t.status === 'completed').length
  const pendingCount = tasks.filter(t => t.status === 'pending' || t.status === 'open').length
  const aiSuggestions = notes.length
  const progress = Math.min(74 / 120 * 100, 100)

  return (
    <Layout title="ภาพรวม">
      <div className={s.wrap}>
        <SurfaceCard variant="glass" className={s.heroCard}>
          <div>
            <div className={s.hello}>สวัสดีตอนเช้า</div>
            <div className={s.username}>{user?.name || 'นีนา'}</div>
            <div className={s.subtitle}>เจ้าหน้าที่ประเมินทรัพย์สิน • พร้อมสำหรับการบันทึกภาคสนาม</div>
          </div>
          <div className={s.heroRight}>
            <div className={s.avatar}>{(user?.name || 'นีนา').split(' ').map(part => part[0]).slice(0,2).join('').toUpperCase()}</div>
            <button className={s.captureButton} onClick={go('/camera')}>บันทึกด่วน</button>
          </div>
        </SurfaceCard>

        <SurfaceCard variant="elevated" className={s.missionCard}>
          <div className={s.missionHeader}>
            <div>
              <div className={s.eyebrow}>เดือนนี้</div>
              <div className={s.missionTitle}>เป้าหมาย 120 ป้ายขาย</div>
            </div>
            <div className={s.badge}>นักสำรวจ</div>
          </div>
          <div className={s.missionStats}>
            <StatPill label="เก็บแล้ว" value="74" />
            <StatPill label="เหลือ" value="46" />
            <StatPill label="เลเวล" value="7" />
            <StatPill label="EXP" value="3,250 / 4,000" />
          </div>
          <div className={s.progressWrap}>
            <div className={s.progressBar}><span style={{ width: `${progress}%` }} /></div>
            <div className={s.progressMeta}>บันทึกแล้ว 74 จาก 120 ป้าย • {Math.round(progress)}% แล้วเสร็จ</div>
          </div>
        </SurfaceCard>

        <div className={s.kpiRow}>
          <KPI label="ภารกิจวันนี้" value={todaysTasks.length} icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 7h18"/><path d="M3 12h18"/><path d="M3 17h18"/></svg>} />
          <KPI label="เสร็จแล้ว" value={completedCount} icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 6L9 17l-5-5"/></svg>} />
          <KPI label="ค้างอยู่" value={pendingCount} icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/></svg>} />
          <KPI label="คำแนะนำ AI" value={aiSuggestions} icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v6"/><path d="M12 22v-6"/><path d="M2 12h6"/><path d="M22 12h-6"/></svg>} />
        </div>

        <SurfaceCard variant="glass" className={s.aiSummary}>
          <strong>จุดเน้นภารกิจ</strong>
          <p>ให้ความสำคัญกับกลุ่มป้ายมูลค่าสูงใกล้ย่านศูนย์กลางและรักษาคุณภาพการบันทึกให้เหนือ 90%</p>
          <div className={s.aiActions}>
            <button className={s.primaryButton} onClick={go('/camera')}>เปิดกล้อง</button>
            <button className={s.secondaryButton} onClick={go('/map')}>เปิดแผนที่</button>
          </div>
        </SurfaceCard>

        <div>
          <h4 className={s.sectionTitle}>การดำเนินการด่วน</h4>
          <div className={s.quickGrid}>
            <div className={s.quickItem} onClick={go('/camera')}>
              <div className={s.quickIcon}>📷</div>
              <div>ถ่ายภาพ</div>
            </div>
            <div className={s.quickItem} onClick={go('/map')}>
              <div className={s.quickIcon}>🗺️</div>
              <div>แผนที่</div>
            </div>
            <div className={s.quickItem} onClick={go('/shared-intelligence')}>
              <div className={s.quickIcon}>🧠</div>
              <div>ข้อมูลกลาง</div>
            </div>
            <div className={s.quickItem} onClick={go('/search')}>
              <div className={s.quickIcon}>🔎</div>
              <div>ค้นหา</div>
            </div>
            <div className={s.quickItem} onClick={go('/notifications')}>
              <div className={s.quickIcon}>🔔</div>
              <div>แจ้งเตือน</div>
            </div>
            <div className={s.quickItem} onClick={go('/profile')}>
              <div className={s.quickIcon}>👤</div>
              <div>โปรไฟล์</div>
            </div>
          </div>
        </div>

        <div className={s.tasks}>
          <h4 className={s.sectionTitle}>คิวภารกิจวันนี้</h4>
          {tasks.map(t => (
            <div key={t.id} className={s.taskItem} onClick={go(`/assessment`)}>
              <div>
                <div className={s.taskTitle}>{t.title}</div>
                <div className={s.taskMeta}>ทรัพย์สิน: {t.propertyId}</div>
              </div>
              <div className={s.taskTime}>{new Date(t.scheduledAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
            </div>
          ))}
        </div>

        <div className={s.recent}>
          <h4 className={s.sectionTitle}>ภาพบันทึกล่าสุด</h4>
          {properties.map(p => (
            <div key={p.id} className={s.property} onClick={go(`/property/${p.id}`)}>
              <div className={s.propThumb} style={{backgroundImage: p.images?.[0] ? `url(${p.images[0]})` : undefined, backgroundSize:'cover', backgroundPosition:'center'}} />
              <div className={s.propMeta}>
                <div className={s.propTitle}>{p.owner}</div>
                <div className={s.propSub}>{p.province} • {new Date(p.lastInspection).toLocaleDateString('th-TH')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
