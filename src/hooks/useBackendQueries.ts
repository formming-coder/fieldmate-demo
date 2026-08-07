import { useMutation, useQuery } from '@tanstack/react-query'
import {
  assessmentRepository,
  notificationRepository,
  officerRepository,
  propertyRepository,
  taskRepository,
} from '../repositories'
import { AssessmentInput } from '../repositories/assessmentRepository'
import { Property } from '../types'

export const queryKeys = {
  properties: ['properties'] as const,
  property: (id: string) => ['property', id] as const,
  tasks: ['tasks'] as const,
  notifications: ['notifications'] as const,
  officer: ['officer', 'me'] as const,
}

export function usePropertiesQuery() {
  return useQuery({
    queryKey: queryKeys.properties,
    queryFn: () => propertyRepository.list(),
  })
}

export function usePropertyQuery(id?: string) {
  return useQuery({
    queryKey: queryKeys.property(id || ''),
    queryFn: () => propertyRepository.getById(id || ''),
    enabled: Boolean(id),
  })
}

export function useTasksQuery() {
  return useQuery({
    queryKey: queryKeys.tasks,
    queryFn: () => taskRepository.list(),
  })
}

export function useNotificationsQuery() {
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: () => notificationRepository.list(),
  })
}

export function useCurrentOfficerQuery() {
  return useQuery({
    queryKey: queryKeys.officer,
    queryFn: () => officerRepository.current(),
  })
}

export function useSavePropertyMutation() {
  return useMutation({
    mutationFn: (payload: Partial<Property>) => propertyRepository.create(payload),
  })
}

export function useCreateAssessmentMutation() {
  return useMutation({
    mutationFn: (payload: AssessmentInput) => assessmentRepository.create(payload),
  })
}
