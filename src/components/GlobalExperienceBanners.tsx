import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export default function GlobalExperienceBanners() {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [isOffline, setIsOffline] = useState(() => (typeof navigator !== 'undefined' ? !navigator.onLine : false))

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallEvent(event as InstallPromptEvent)
    }

    const syncConnection = () => setIsOffline(!navigator.onLine)

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('online', syncConnection)
    window.addEventListener('offline', syncConnection)

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (!registration) return
        registration.addEventListener('updatefound', () => {
          if (registration.installing) {
            setUpdateAvailable(true)
          }
        })
      })
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('online', syncConnection)
      window.removeEventListener('offline', syncConnection)
    }
  }, [])

  const triggerInstall = async () => {
    if (!installEvent) return
    await installEvent.prompt()
    const choice = await installEvent.userChoice
    if (choice.outcome === 'accepted') {
      setInstallEvent(null)
    }
  }

  return (
    <AnimatePresence>
      {(installEvent || updateAvailable || isOffline) ? (
        <motion.div className="global-banner-stack" initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }}>
          {installEvent ? (
            <div className="global-banner">
              <div>
                <strong>ติดตั้งแอป Fieldmate AI</strong>
                <span>ใช้งานแบบแอปเต็มหน้าจอ พร้อมประสบการณ์เหมือน Native</span>
              </div>
              <button type="button" onClick={triggerInstall}>ติดตั้ง</button>
            </div>
          ) : null}

          {updateAvailable ? (
            <div className="global-banner">
              <div>
                <strong>มีเวอร์ชันใหม่พร้อมใช้งาน</strong>
                <span>รีเฟรชเพื่ออัปเดตประสิทธิภาพและประสบการณ์ล่าสุด</span>
              </div>
              <button type="button" onClick={() => window.location.reload()}>อัปเดต</button>
            </div>
          ) : null}

          {isOffline ? (
            <div className="global-banner">
              <div>
                <strong>ออฟไลน์ชั่วคราว</strong>
                <span>ระบบจะซิงก์ข้อมูลอัตโนมัติเมื่อกลับมาออนไลน์</span>
              </div>
              <button type="button" onClick={() => window.location.reload()}>ลองเชื่อมต่อใหม่</button>
            </div>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
