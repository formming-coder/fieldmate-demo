import React from 'react'

type State = {
  hasError: boolean
  message: string
}

export class AppErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่คาดคิดในแอปพลิเคชัน'
    return { hasError: true, message }
  }

  componentDidCatch(error: unknown) {
    // Keep logging minimal and centralized for production observability.
    console.error('Application error boundary', error)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#f6f7fb' }}>
        <div style={{ width: 'min(560px, 100%)', borderRadius: 16, background: '#fff', padding: 24, boxShadow: '0 8px 28px rgba(16,22,34,.1)' }}>
          <div style={{ fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', color: '#6f7890', marginBottom: 8 }}>เกิดข้อผิดพลาด</div>
          <h1 style={{ margin: 0, fontSize: 22, color: '#1d2435' }}>ระบบทำงานไม่สำเร็จ</h1>
          <p style={{ color: '#4b556d' }}>{this.state.message}</p>
          <button type="button" onClick={() => window.location.reload()} style={{ border: 0, borderRadius: 10, background: '#1d2435', color: '#fff', padding: '10px 14px', cursor: 'pointer' }}>
            โหลดแอปใหม่
          </button>
        </div>
      </div>
    )
  }
}
