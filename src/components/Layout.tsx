import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth/useAuth'
import FloatingAssistant from './FloatingAssistant'
import { Avatar, BottomNavigation, IconButton, TopNavigation } from './ui'
import { canAccessAnyRoute } from '../lib/auth/rbac'

const titleMap: Record<string, string> = {
  '/home': 'หน้าหลัก',
  '/dashboard': 'ภาพรวม',
  '/map': 'แผนที่',
  '/camera': 'ถ่ายภาพ',
  '/album': 'อัลบั้ม',
  '/shared-intelligence': 'ข้อมูลทรัพย์สินส่วนกลาง',
  '/search': 'ค้นหา',
  '/property': 'ทรัพย์สิน',
  '/notifications': 'การแจ้งเตือน',
  '/profile': 'โปรไฟล์',
  '/settings': 'ตั้งค่า',
  '/gis': 'GIS อัจฉริยะ',
  '/route-planner': 'วางแผนเส้นทาง',
}

const navItems = [
  { label: 'แผนที่', to: '/map', icon: 'map' },
  { label: 'ถ่ายภาพ', to: '/camera', icon: 'photo_camera' },
  { label: 'คลังข้อมูล', to: '/album', icon: 'photo_library' },
  { label: 'ค้นหา', to: '/search', icon: 'search' },
  { label: 'โปรไฟล์', to: '/profile', icon: 'person' },
]

export default function Layout({ children, title, immersive = false, hideAssistant = false, hideBottomNavigation = false }: { children: React.ReactNode; title?: string; immersive?: boolean; hideAssistant?: boolean; hideBottomNavigation?: boolean }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, currentRole } = useAuth()
  const [offline, setOffline] = useState(() => typeof navigator !== 'undefined' ? !navigator.onLine : false)
  const resolvedTitle = title ?? titleMap[location.pathname] ?? titleMap['/dashboard'] ?? 'ฟีลด์เมต AI'
  const resolvedSubtitle = location.pathname === '/map' ? 'กรุงเทพมหานคร, ไทย' : 'ตำแหน่งปัจจุบัน'
  const shouldHideBottomNavigation = hideBottomNavigation || location.pathname === '/home'
  const filteredNavItems = navItems.filter((item) => {
    if (item.to === '/map') return canAccessAnyRoute(currentRole, ['map'])
    if (item.to === '/camera') return canAccessAnyRoute(currentRole, ['camera'])
    if (item.to === '/album') return canAccessAnyRoute(currentRole, ['album'])
    if (item.to === '/search') return canAccessAnyRoute(currentRole, ['search'])
    if (item.to === '/profile') return canAccessAnyRoute(currentRole, ['profile'])
    return true
  })

  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine)
    window.addEventListener('online', sync)
    window.addEventListener('offline', sync)
    return () => {
      window.removeEventListener('online', sync)
      window.removeEventListener('offline', sync)
    }
  }, [])

  return (
    <div className="app-shell" style={{ overflowX: 'clip' }}>
      <div className={`mobile-shell ${immersive ? 'mobile-shell-immersive' : ''}`}>
        <div className="container-safe">
          {offline && !immersive ? <div className="global-offline-banner">กำลังใช้งานแบบออฟไลน์ • มีข้อมูลแคชพร้อมใช้ • รอซิงก์ข้อมูล</div> : null}
          {!immersive ? (
            <TopNavigation
              title={resolvedTitle}
              subtitle={resolvedSubtitle}
              right={(
                <>
                  <IconButton label="ค้นหา" onClick={() => navigate('/search')}><span className="material-symbols-rounded" aria-hidden="true">search</span></IconButton>
                  <IconButton label="การแจ้งเตือน" onClick={() => navigate('/notifications')}><span className="material-symbols-rounded" aria-hidden="true">notifications</span></IconButton>
                  <button type="button" className="layout-avatar-button" onClick={() => navigate('/profile')} aria-label="เปิดโปรไฟล์">
                    <Avatar name={currentUser?.name || 'เจ้าหน้าที่ภาคสนาม'} size={40} />
                  </button>
                </>
              )}
            />
          ) : null}

          <main className={`page-shell ${immersive ? 'page-shell-immersive' : ''}`}>{children}</main>
        </div>

        {!hideAssistant ? <FloatingAssistant /> : null}
        {!shouldHideBottomNavigation ? <BottomNavigation items={filteredNavItems} /> : null}
      </div>
    </div>
  )
}
