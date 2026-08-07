import React, { memo } from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'

const items = [
  { to: '/map', label: 'แผนที่', icon: 'map' },
  { to: '/camera', label: 'กล้อง AI', icon: 'photo_camera' },
  { to: '/assessment', label: 'ประเมิน', icon: 'assignment' },
  { to: '/shared-intelligence', label: 'ข้อมูลกลาง', icon: 'hub' },
  { to: '/profile', label: 'โปรไฟล์', icon: 'person' },
]

function BottomNavigation() {
  return (
    <nav className="home-bottom-nav" aria-label="Primary navigation">
      <div className="home-bottom-nav-inner">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} className="home-tab-link">
            {({ isActive }) => (
              <motion.div className={`home-tab ${isActive ? 'is-active' : ''}`} whileTap={{ scale: 0.96 }} animate={isActive ? { y: [0, -1, 1, 0] } : { y: 0 }} transition={{ duration: 0.22 }}>
                {isActive ? <motion.span layoutId="tab-indicator" className="home-tab-indicator" /> : null}
                <span className="home-tab-icon material-symbols-rounded" aria-hidden="true">{item.icon}</span>
                <span className="home-tab-label">{item.label}</span>
              </motion.div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default memo(BottomNavigation)
