import { AuthStorage, AuthUser } from './AuthStorage'

const DAY_IN_MS = 24 * 60 * 60 * 1000

const demoUser: AuthUser = {
  id: 'demo-officer',
  name: 'นีนา รัตนกุล',
  email: 'demo@fieldmate.ai',
  role: 'Officer',
  department: 'ฝ่ายประเมินหลักประกัน',
  avatar: null,
}

export async function createDemoSession(rememberMe: boolean) {
  const expiresAt = Date.now() + (rememberMe ? 30 * DAY_IN_MS : DAY_IN_MS)

  return AuthStorage.write({
    user: demoUser,
    token: `demo-session-${crypto.randomUUID()}`,
    expiresAt,
    provider: 'demo',
    rememberMe,
  })
}
