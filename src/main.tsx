import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'
import './styles/app.css'
import { AppErrorBoundary } from './lib/errors/AppErrorBoundary'
import { apiClient } from './lib/http/client'
import { flushOfflineQueue } from './lib/offline/queue'
import { queryClient } from './lib/query/client'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </AppErrorBoundary>
  </React.StrictMode>
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // ignore registration issues outside production-ready hosting
    })
  })
}

const flushQueue = () => flushOfflineQueue((config) => apiClient.request(config))
window.addEventListener('online', () => {
  void flushQueue()
})
window.setInterval(() => {
  if (navigator.onLine) {
    void flushQueue()
  }
}, 30000)
