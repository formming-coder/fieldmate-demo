export type AppRole = 'Administrator' | 'Manager' | 'Reviewer' | 'Officer' | 'Viewer'

export const rolePriority: Record<AppRole, number> = {
  Administrator: 100,
  Manager: 80,
  Reviewer: 60,
  Officer: 40,
  Viewer: 20,
}

export function normalizeRole(input?: string | null): AppRole {
  const value = (input || '').trim().toLowerCase()

  if (value === 'administrator' || value === 'admin') return 'Administrator'
  if (value === 'manager') return 'Manager'
  if (value === 'reviewer') return 'Reviewer'
  if (value === 'viewer') return 'Viewer'
  return 'Officer'
}
