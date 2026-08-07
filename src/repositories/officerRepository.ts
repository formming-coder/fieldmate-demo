import { apiClient } from '../lib/http/client'
import { User } from '../types'

export const officerRepository = {
  async current() {
    const response = await apiClient.get<User>('/officers/me')
    return response.data
  },
}
