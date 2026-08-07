export type Property = {
  id: string
  owner: string
  province: string
  latitude: number
  longitude: number
  marketPrice: number
  appraisalPrice: number
  status: 'inspected' | 'pending' | 'archived' | string
  type?: string
  lastInspection: string
  images: string[]
}

export type Task = {
  id: string
  title: string
  propertyId: string
  scheduledAt: string
  status: string
}

export type User = {
  id: string
  name: string
  role?: string
  email?: string
  avatar?: string | null
}

export type Notification = {
  id: string
  title: string
  body: string
  createdAt: string
  read: boolean
}
