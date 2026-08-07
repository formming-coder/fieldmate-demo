import { AppRole, rolePriority } from '../../types/auth'

export type AppRouteKey =
  | 'home'
  | 'dashboard'
  | 'map'
  | 'gis'
  | 'routePlanner'
  | 'camera'
  | 'album'
  | 'sharedIntelligence'
  | 'search'
  | 'propertyDetail'
  | 'aiSummary'
  | 'assessment'
  | 'notifications'
  | 'profile'
  | 'settings'

const routeAccessMatrix: Record<AppRouteKey, AppRole[]> = {
  home: ['Administrator', 'Manager', 'Reviewer', 'Officer', 'Viewer'],
  dashboard: ['Administrator', 'Manager', 'Reviewer', 'Officer', 'Viewer'],
  map: ['Administrator', 'Manager', 'Reviewer', 'Officer', 'Viewer'],
  gis: ['Administrator', 'Manager', 'Reviewer', 'Officer'],
  routePlanner: ['Administrator', 'Manager', 'Reviewer', 'Officer'],
  camera: ['Administrator', 'Manager', 'Reviewer', 'Officer'],
  album: ['Administrator', 'Manager', 'Reviewer', 'Officer', 'Viewer'],
  sharedIntelligence: ['Administrator', 'Manager', 'Reviewer', 'Officer', 'Viewer'],
  search: ['Administrator', 'Manager', 'Reviewer', 'Officer', 'Viewer'],
  propertyDetail: ['Administrator', 'Manager', 'Reviewer', 'Officer', 'Viewer'],
  aiSummary: ['Administrator', 'Manager', 'Reviewer', 'Officer', 'Viewer'],
  assessment: ['Administrator', 'Manager', 'Reviewer', 'Officer'],
  notifications: ['Administrator', 'Manager', 'Reviewer', 'Officer', 'Viewer'],
  profile: ['Administrator', 'Manager', 'Reviewer', 'Officer', 'Viewer'],
  settings: ['Administrator', 'Manager'],
}

export function hasRole(role: AppRole, minimum: AppRole) {
  return rolePriority[role] >= rolePriority[minimum]
}

export function canAccessRoute(role: AppRole, route: AppRouteKey) {
  return routeAccessMatrix[route].includes(role)
}

export function canAccessAnyRoute(role: AppRole, routes: AppRouteKey[]) {
  return routes.some((route) => canAccessRoute(role, route))
}

export function getRouteAccessMatrix() {
  return routeAccessMatrix
}
