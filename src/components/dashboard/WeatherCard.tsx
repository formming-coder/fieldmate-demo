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
        <div className="dashboard-eyebrow">สภาพอากาศ</div>
        <div className="weather-temp">{temperature} องศา</div>
        <div className="weather-summary">{summary}</div>
      </div>
      <div className="weather-pill">โอกาสฝน {rainChance}%</div>
    </motion.section>
  )
}

export default memo(WeatherCard)
