import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import FloatingAssistant from './FloatingAssistant'
import { Avatar, BottomNavigation, IconButton, TopNavigation } from './ui'

const titleMap: Record<string, string> = {
  '/home': 'หน้าหลัก',
  '/dashboard': 'ภาพรวม',
  '/map': 'แผนที่',
  '/camera': 'ถ่ายภาพ',
  '/album': 'อัลบั้ม',
  '/shared-intelligence': 'ข้อมูลกลาง',
  '/search': 'ค้นหา',
  '/property': 'ทรัพย์สิน',
  '/notifications': 'แจ้งเตือน',
  '/profile': 'โปรไฟล์',
  '/settings': 'การตั้งค่า',
  '/gis': 'GIS Intelligence',
  '/route-planner': 'Route Planner',
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
  const [offline, setOffline] = useState(() => typeof navigator !== 'undefined' ? !navigator.onLine : false)
  const resolvedTitle = title ?? titleMap[location.pathname] ?? titleMap['/dashboard'] ?? 'Fieldmate AI'
  const resolvedSubtitle = location.pathname === '/map' ? 'กรุงเทพมหานคร, ไทย' : 'ตำแหน่งปัจจุบัน'
  const shouldHideBottomNavigation = hideBottomNavigation || location.pathname === '/home'

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
    <div className="app-shell">
      <div className={`mobile-shell ${immersive ? 'mobile-shell-immersive' : ''}`}>
        <div className="container-safe">
          {offline && !immersive ? <div className="global-offline-banner">Offline mode active • Cached data available • Sync queued</div> : null}
          {!immersive ? (
            <TopNavigation
              title={resolvedTitle}
              subtitle={resolvedSubtitle}
              right={(
                <>
                  <IconButton label="ค้นหา" onClick={() => navigate('/search')}><span className="material-symbols-rounded" aria-hidden="true">search</span></IconButton>
                  <IconButton label="การแจ้งเตือน" onClick={() => navigate('/notifications')}><span className="material-symbols-rounded" aria-hidden="true">notifications</span></IconButton>
                  <button type="button" className="layout-avatar-button" onClick={() => navigate('/profile')} aria-label="Open profile">
                    <Avatar name="Field Officer" size={40} />
                  </button>
                </>
              )}
            />
          ) : null}

          <main className={`page-shell ${immersive ? 'page-shell-immersive' : ''}`}>{children}</main>
        </div>

        {!hideAssistant ? <FloatingAssistant /> : null}
        {!shouldHideBottomNavigation ? <BottomNavigation items={navItems} /> : null}
      </div>
    </div>
  )
}
