import React, { memo } from 'react'
import { motion } from 'framer-motion'

type WeatherCardProps = {
  temperature: number
  rainChance: number
  summary: string
}

function WeatherCard({ temperature, rainChance, summary }: WeatherCardProps) {
  return (
    <motion.section className="dashboard-card weather-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div>
        <div className="dashboard-eyebrow">Weather</div>
        <div className="weather-temp">{temperature}°C</div>
        <div className="weather-summary">{summary}</div>
      </div>
      <div className="weather-pill">Rain {rainChance}%</div>
    </motion.section>
  )
}

export default memo(WeatherCard)
