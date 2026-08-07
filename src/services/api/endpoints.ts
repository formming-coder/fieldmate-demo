export const apiEndpoints = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    profile: '/user/profile',
  },
  properties: {
    list: '/properties',
    create: '/properties',
    update: (id: string) => `/properties/${id}`,
    remove: (id: string) => `/properties/${id}`,
    search: '/search/properties',
    versions: (id: string) => `/properties/${id}/versions`,
    restoreVersion: (id: string, versionId: string) => `/properties/${id}/versions/${versionId}/restore`,
    timeline: (id: string) => `/properties/${id}/timeline`,
  },
  photos: {
    upload: '/photos/upload',
  },
  assessments: {
    create: '/assessment',
  },
  notifications: {
    list: '/notifications',
    readAll: '/notifications/read-all',
    markRead: (id: string) => `/notifications/${id}/read`,
    remove: (id: string) => `/notifications/${id}`,
  },
  shared: {
    list: '/shared',
  },
  ai: {
    ocr: '/ai/ocr',
    summary: '/ai/property-summary',
    comparable: '/ai/comparable-recommendation',
    price: '/ai/price-suggestion',
    risk: '/ai/risk-analysis',
    caption: '/ai/image-caption',
  },
  audit: {
    create: '/audit/logs',
  },
}
