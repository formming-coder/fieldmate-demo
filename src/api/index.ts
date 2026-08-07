import { Property } from '../types'
import { notificationRepository, officerRepository, propertyRepository, taskRepository } from '../repositories'

export async function fetchProperties() {
  return propertyRepository.list()
}

export async function fetchPropertyById(id: string) {
  return propertyRepository.getById(id)
}

export async function fetchTasks() {
  return taskRepository.list()
}

export async function fetchUser() {
  return officerRepository.current()
}

export async function fetchNotifications() {
  return notificationRepository.list()
}

export async function saveProperty(payload: Partial<Property>) {
  return propertyRepository.create(payload)
}

export function subscribeProperties(_cb: (p: Property) => void) {
  // Replaced by React Query cache invalidation and periodic refetch.
  return () => undefined
}
