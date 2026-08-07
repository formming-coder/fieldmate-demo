import React from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { colors } from '../../theme/colors'
import { radius } from '../../theme/radius'
import { spacing } from '../../theme/spacing'
import { shadow } from '../../theme/shadow'

export type BottomNavigationItem = {
  label: string
  to: string
  icon: React.ReactNode | string
}

export type BottomNavigationProps = {
  items: BottomNavigationItem[]
}

export function BottomNavigation({ items }: BottomNavigationProps) {
  return (
    <nav style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 30, padding: `${spacing[2]} ${spacing[3]} calc(${spacing[2]} + env(safe-area-inset-bottom))` }}>
      <div style={{ maxWidth: 430, margin: '0 auto', background: 'rgba(255,255,255,0.9)', border: `1px solid rgba(255,255,255,0.72)`, borderRadius: radius.extra, boxShadow: shadow.elevated, backdropFilter: 'blur(28px)', display: 'flex', justifyContent: 'space-between', padding: `${spacing[2]} ${spacing[1]}`, minHeight: 68, overflow: 'hidden' }}>
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} style={{ flex: 1, textDecoration: 'none', color: colors.muted, minWidth: 0 }}>
            {({ isActive }) => (
              <motion.div whileTap={{ scale: 0.96 }} animate={isActive ? { y: [0, -1, 0] } : { y: 0 }} transition={{ duration: 0.2 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: `${spacing[1]} 0`, color: isActive ? colors.secondary : colors.muted }}>
                <motion.div layout style={{ width: 42, height: 34, borderRadius: radius.large, background: isActive ? colors.primary : 'transparent', display: 'grid', placeItems: 'center', color: isActive ? colors.secondary : colors.muted }}>
                  {typeof item.icon === 'string' ? <span className="material-symbols-rounded" aria-hidden="true">{item.icon}</span> : item.icon}
                </motion.div>
                <span style={{ fontSize: 11, lineHeight: 1.2, fontWeight: isActive ? 700 : 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{item.label}</span>
              </motion.div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
