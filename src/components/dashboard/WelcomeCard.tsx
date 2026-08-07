import React, { memo } from 'react'

type WelcomeCardProps = {
  hours: string
  location: string
  weather: string
  summary: string
}

function WelcomeCard({ hours, location, weather, summary }: WelcomeCardProps) {
  return (
    <section className="db-card db-welcome-card">
      <div>
        <div className="db-eyebrow">Welcome back</div>
        <h2>Today's summary</h2>
        <p>{summary}</p>
      </div>
      <div className="db-welcome-grid">
        <div><span>Working hours</span><strong>{hours}</strong></div>
        <div><span>Location</span><strong>{location}</strong></div>
        <div><span>Weather</span><strong>{weather}</strong></div>
      </div>
    </section>
  )
}

export default memo(WelcomeCard)
