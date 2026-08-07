import React, { Suspense, lazy, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Notification, Property, Task } from '../types'
import { EmptyState } from '../components/ui'
import { useCurrentOfficerQuery, useNotificationsQuery, usePropertiesQuery, useTasksQuery } from '../hooks/useBackendQueries'
import { staggerItem, staggerList } from '../theme/motion'
import '../styles/dashboard.css'

const DashboardHeader = lazy(() => import('../components/dashboard/DashboardHeader'))
const WelcomeCard = lazy(() => import('../components/dashboard/WelcomeCard'))
const KPICard = lazy(() => import('../components/dashboard/KPICard'))
const QuickAction = lazy(() => import('../components/dashboard/QuickAction'))
const RecentActivity = lazy(() => import('../components/dashboard/RecentActivity'))
const AIRecommendation = lazy(() => import('../components/dashboard/AIRecommendation'))
const MarketSnapshot = lazy(() => import('../components/dashboard/MarketSnapshot'))
const PerformanceCard = lazy(() => import('../components/dashboard/PerformanceCard'))
const TaskSummary = lazy(() => import('../components/dashboard/TaskSummary'))
const WeatherCard = lazy(() => import('../components/dashboard/WeatherCard'))
const KnowledgeCard = lazy(() => import('../components/dashboard/KnowledgeCard'))
const NotificationCard = lazy(() => import('../components/dashboard/NotificationCard'))
const MiniCalendar = lazy(() => import('../components/dashboard/MiniCalendar'))
const FavoriteLocation = lazy(() => import('../components/dashboard/FavoriteLocation'))
const NearbyProperty = lazy(() => import('../components/dashboard/NearbyProperty'))
const BottomNavigation = lazy(() => import('../components/dashboard/BottomNavigation'))

function formatThaiDate(date: Date) {
  return new Intl.DateTimeFormat('th-TH', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function getRecentActivities(notifications: Notification[], tasks: Task[], properties: Property[]) {
  const fromTasks = tasks.slice(0, 2).map((task) => ({
    id: `activity-task-${task.id}`,
    title: 'Assessment completed',
    detail: task.title,
    time: new Date(task.scheduledAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    tone: 'success' as const,
  }))

  const fromNotifications = notifications.slice(0, 1).map((note) => ({
    id: `activity-note-${note.id}`,
    title: 'AI generated report',
    detail: note.title,
    time: new Date(note.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    tone: 'warning' as const,
  }))

  const fromProperties = properties.slice(0, 1).map((property) => ({
    id: `activity-prop-${property.id}`,
    title: 'Property updated',
    detail: property.owner,
    time: new Date(property.lastInspection).toLocaleDateString('th-TH'),
    tone: 'neutral' as const,
  }))

  return [
    ...fromTasks,
    {
      id: 'activity-photos',
      title: 'Photo uploaded',
      detail: '12 new field captures synced to shared intelligence',
      time: '10:20',
      tone: 'primary' as const,
    },
    {
      id: 'activity-map',
      title: 'Map viewed',
      detail: 'GIS route and spatial context reviewed',
      time: '11:05',
      tone: 'neutral' as const,
    },
    ...fromNotifications,
    ...fromProperties,
  ]
}

function SectionSkeleton() {
  return (
    <div className="dashboard-skeleton" aria-hidden="true">
      <div className="dashboard-skeleton-line" />
      <div className="dashboard-skeleton-line dashboard-skeleton-line-short" />
      <div className="dashboard-skeleton-box" />
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { data: properties = [], isLoading: isPropertiesLoading, isError: isPropertiesError, refetch: refetchProperties } = usePropertiesQuery()
  const { data: tasks = [], isLoading: isTasksLoading, isError: isTasksError, refetch: refetchTasks } = useTasksQuery()
  const { data: notifications = [], isLoading: isNotificationsLoading, isError: isNotificationsError, refetch: refetchNotifications } = useNotificationsQuery()
  const { data: user, isLoading: isOfficerLoading, isError: isOfficerError, refetch: refetchOfficer } = useCurrentOfficerQuery()
  const isLoading = isPropertiesLoading || isTasksLoading || isNotificationsLoading || isOfficerLoading
  const hasError = isPropertiesError || isTasksError || isNotificationsError || isOfficerError

  const todayLabel = useMemo(() => formatThaiDate(new Date()), [])
  const activities = useMemo(() => getRecentActivities(notifications, tasks, properties), [notifications, tasks, properties])
  const weeklySeries = useMemo(() => [8, 9, 7, 12, 10, 14, 12], [])
  const userName = user?.name || 'คุณฟอร์ม'
  const todayTasks = tasks.filter((task) => new Date(task.scheduledAt).toDateString() === new Date().toDateString())
  const completedCount = tasks.filter((task) => task.status === 'completed').length
  const pendingCount = tasks.filter((task) => task.status === 'pending').length
  const reviewCount = tasks.filter((task) => task.status !== 'completed' && task.status !== 'pending').length
  const rejectedCount = Math.max(1, notifications.filter((item) => !item.read).length - 1)
  const pendingUploads = properties.filter((property) => property.status === 'pending').length
  const nearbyItems = properties.slice(0, 3).map((property, index) => ({
    title: property.owner,
    distance: `${(0.7 + index * 0.6).toFixed(1)} km`,
    travelTime: `${9 + index * 5} min`,
    image: property.images[0],
  }))
  const quickActions = useMemo(
    () => [
      { icon: 'map', title: 'Smart Map', subtitle: 'สำรวจพื้นที่', path: '/map' },
      { icon: 'photo_camera', title: 'AI Camera', subtitle: 'บันทึกภาพทรัพย์', path: '/camera' },
      { icon: 'assignment', title: 'Assessment', subtitle: 'เปิดงานประเมิน', path: '/assessment' },
      { icon: 'route', title: 'Route Planner', subtitle: 'วางแผนเส้นทาง', path: '/route-planner' },
      { icon: 'search', title: 'Search', subtitle: 'ค้นหาข้อมูล', path: '/search' },
      { icon: 'database', title: 'Shared Intelligence', subtitle: 'ฐานข้อมูลกลาง', path: '/shared-intelligence' },
      { icon: 'public', title: 'GIS', subtitle: 'วิเคราะห์เชิงพื้นที่', path: '/gis' },
      { icon: 'notifications', title: 'Notifications', subtitle: 'ศูนย์แจ้งเตือน', path: '/notifications' },
      { icon: 'person', title: 'Profile', subtitle: 'บัญชีของฉัน', path: '/profile' },
    ],
    []
  )
  const overviewCards = useMemo(
    () => [
      { title: 'งานของวันนี้', value: `${todayTasks.length} งาน`, meta: `เสร็จแล้ว ${completedCount} งาน` },
      { title: 'งานเร่งด่วน', value: `${Math.max(1, pendingCount)} งาน`, meta: 'กำหนดส่งภายในวันนี้' },
      { title: 'AI แจ้งเตือน', value: `${notifications.filter((item) => !item.read).length} รายการ`, meta: 'ต้องติดตามทันที' },
      { title: 'สำรวจใกล้ฉัน', value: `${nearbyItems.length} จุด`, meta: 'พร้อมออกสำรวจได้ทันที' },
    ],
    [todayTasks.length, completedCount, pendingCount, notifications, nearbyItems.length]
  )

  return (
    <div className="home-shell">
      <motion.main className="home-content" variants={staggerList} initial="hidden" animate="visible">
        {hasError ? (
          <motion.section className="db-card" variants={staggerItem}>
            <div className="db-eyebrow">เชื่อมต่อข้อมูลไม่สำเร็จ</div>
            <h2>กรุณาลองเชื่อมต่ออีกครั้ง</h2>
            <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: 13 }}>ระบบยังคงแสดงข้อมูลล่าสุดที่มีอยู่ และจะซิงก์ให้อัตโนมัติเมื่อเชื่อมต่อได้</p>
            <button type="button" className="db-continue-button" onClick={() => { void refetchProperties(); void refetchTasks(); void refetchNotifications(); void refetchOfficer() }}>ลองอีกครั้ง</button>
          </motion.section>
        ) : null}

        <motion.div variants={staggerItem}>
        <Suspense fallback={<SectionSkeleton />}>
          <DashboardHeader userName={userName} greeting="สวัสดี คุณฟอร์ม" onNotifications={() => navigate('/notifications')} onAssistant={() => navigate('/search')} />
        </Suspense>
        </motion.div>

        <motion.section className="dashboard-section" variants={staggerItem}>
          <h2 className="dashboard-section-title">Daily Dashboard</h2>
          <div className="db-overview-grid">
            {overviewCards.map((card) => (
              <article key={card.title} className="db-overview-card">
                <div className="db-overview-title">{card.title}</div>
                <strong>{card.value}</strong>
                <span>{card.meta}</span>
              </article>
            ))}
          </div>
        </motion.section>

        <Suspense fallback={<SectionSkeleton />}>
          <WelcomeCard
            hours="08:30 - 17:30"
            location="Bangkok CBD"
            weather={`${todayLabel} • 31C`}
            summary={`Welcome back. ${todayTasks.length} scheduled visits today, current location ready, and ${pendingUploads} uploads pending sync.`}
          />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <KPICard total={todayTasks.length} completed={completedCount} pending={pendingCount} review={reviewCount} rejected={rejectedCount} target={12} />
        </Suspense>

        <motion.section className="dashboard-section" variants={staggerItem}>
          <h2 className="dashboard-section-title">Quick Action</h2>
          <div className="db-quick-grid">
            {quickActions.map((item) => (
              <Suspense key={item.title} fallback={null}>
                <QuickAction icon={item.icon} title={item.title} subtitle={item.subtitle} onClick={() => navigate(item.path)} />
              </Suspense>
            ))}
          </div>
        </motion.section>

        <motion.section className="dashboard-section" variants={staggerItem}>
          <h2 className="dashboard-section-title">Recent properties</h2>
          {properties.length ? (
            <div className="db-property-list">
              {properties.slice(0, 4).map((property, index) => (
                <article key={property.id} className="db-property-card" onClick={() => navigate(`/property/${property.id}`)} role="button" tabIndex={0}>
                  <img src={property.images[0]} alt={property.owner} className="db-property-image" />
                  <div className="db-property-body">
                    <div className="db-property-head">
                      <span className="db-property-type"><span className="material-symbols-rounded" aria-hidden="true">home_work</span>{property.type || 'Residential'}</span>
                      <span className={`db-property-status ${property.status === 'pending' ? 'is-pending' : 'is-ready'}`}>{property.status === 'pending' ? 'รอตรวจสอบ' : 'พร้อมใช้งาน'}</span>
                    </div>
                    <strong className="db-property-owner">{property.owner}</strong>
                    <div className="db-property-price">THB {property.marketPrice.toLocaleString()}</div>
                    <div className="db-property-meta">
                      <span>{(0.6 + index * 0.5).toFixed(1)} กม.</span>
                      <span>อัปเดต {new Date(property.lastInspection).toLocaleDateString('th-TH')}</span>
                      <span>เจ้าหน้าที่ {userName}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : !isLoading ? (
            <EmptyState title="ยังไม่มีทรัพย์สินในวันนี้" description="เริ่มต้นบันทึกทรัพย์จาก AI Camera เพื่อสร้างข้อมูลสำรวจล่าสุด" action={<button type="button" className="db-empty-cta" onClick={() => navigate('/camera')}>เริ่มบันทึกทรัพย์</button>} />
          ) : null}
        </motion.section>

        <motion.section className="db-card db-continue-card" variants={staggerItem}>
          <div className="db-eyebrow">Continue last inspection</div>
          <h2>ทำงานต่อจากครั้งล่าสุด</h2>
          <p>ต่อเนื่องงานสำรวจที่ค้างไว้ พร้อมข้อมูลและรูปภาพล่าสุดครบถ้วน</p>
          <button type="button" className="db-continue-button" onClick={() => navigate('/assessment')}>ดำเนินการต่อ</button>
        </motion.section>

        <Suspense fallback={<SectionSkeleton />}>
          <RecentActivity items={activities} />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <AIRecommendation
            recommendation="Start with the Bangna and Sukhumvit cluster before rain probability rises this afternoon."
            nearbyTasks={`${todayTasks.length} nearby tasks`}
            riskAlert="2 flood alerts • 1 market volatility alert"
            route="Bangna -> Sukhumvit -> Rama 9"
            travelTime="42 min"
          />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <MarketSnapshot
            average={7420000}
            segments={[
              { label: 'Condo', value: '5.6M', trend: 'Stable' },
              { label: 'House', value: '8.9M', trend: 'Up' },
              { label: 'Townhome', value: '6.1M', trend: 'Up' },
              { label: 'Land', value: '4.4M', trend: 'Down' },
              { label: 'Commercial', value: '9.8M', trend: 'Stable' },
            ]}
          />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <PerformanceCard values={weeklySeries} weeklyScore={92} monthlyScore={89} completedJobs={completedCount} averageTime="36 min" travelDistance="126 km" accuracy="96%" />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <KnowledgeCard recentKnowledge={properties[0]?.owner || 'Amber Fields'} popularProperty="Crown Residence Bangna" recentlyShared="4 property packs" bookmarks={18} />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <TaskSummary today={todayTasks.length} week={Math.min(tasks.length, 7)} month={tasks.length} completed={completedCount} pending={pendingCount} cancelled={rejectedCount} />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <NotificationCard unread={notifications.filter((item) => !item.read).length} priority="High" aiAlerts={3} marketAlerts={2} forestAlerts={1} floodAlerts={2} />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <MiniCalendar
            items={[
              { time: '09:00', title: 'Property Visits', type: 'Bangna cluster' },
              { time: '11:30', title: 'Training', type: 'AI workflow' },
              { time: '14:00', title: 'Assessment Review', type: 'Senior valuer' },
              { time: '16:15', title: 'Meeting', type: 'Market sync' },
            ]}
          />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <FavoriteLocation
            items={[
              { title: 'Bangna Cluster', subtitle: 'Recently visited', tag: 'Pinned' },
              { title: 'Rama 9 Corridor', subtitle: 'Frequently visited', tag: 'Route' },
              { title: 'Sukhumvit Prime', subtitle: 'High-value zone', tag: 'Favorite' },
            ]}
          />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <NearbyProperty items={nearbyItems} />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <WeatherCard temperature={31} rainChance={64} summary="Moderate rain probability. Good inspection window before 13:00." />
        </Suspense>

        <section className="db-card db-offline-card">
          <div className="db-eyebrow">Offline Status</div>
          <h2>Sync health</h2>
          <div className="db-info-list">
            <div><span>Last Sync</span><strong>5 min ago</strong></div>
            <div><span>Pending Upload</span><strong>{pendingUploads}</strong></div>
            <div><span>Cached Records</span><strong>{properties.length}</strong></div>
          </div>
        </section>

        {isLoading ? <SectionSkeleton /> : null}
      </motion.main>

      <Suspense fallback={null}>
        <BottomNavigation />
      </Suspense>
    </div>
  )
}