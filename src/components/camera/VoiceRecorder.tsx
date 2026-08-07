import React, { memo } from 'react'

type VoiceRecorderProps = {
  recording: boolean
  seconds: number
  hasClip: boolean
  onRecord: () => void
  onStop: () => void
  onPlay: () => void
  onAttach: () => void
}

function formatSeconds(seconds: number) {
  const mins = String(Math.floor(seconds / 60)).padStart(2, '0')
  const secs = String(seconds % 60).padStart(2, '0')
  return `${mins}:${secs}`
}

function VoiceRecorder({ recording, seconds, hasClip, onRecord, onStop, onPlay, onAttach }: VoiceRecorderProps) {
  return (
    <section className="cam-voice">
      <div className="cam-section-title-row">
        <h3>Voice Note</h3>
        <span className={`cam-score ${recording ? 'is-warn' : ''}`}>{formatSeconds(seconds)}</span>
      </div>
      <div className="cam-voice-actions">
        {!recording ? <button type="button" onClick={onRecord}>Record</button> : <button type="button" onClick={onStop}>Stop</button>}
        <button type="button" onClick={onPlay} disabled={!hasClip}>Playback</button>
        <button type="button" onClick={onAttach} disabled={!hasClip}>Attach to Image</button>
      </div>
    </section>
  )
}

export default memo(VoiceRecorder)
