import { apiClient } from '../lib/http/client'
import { isDevelopmentMode } from '../config/env'
import mockUsers from '../mock/users.json'
import { User } from '../types'

export const officerRepository = {
  async current() {
    if (isDevelopmentMode) {
      return (mockUsers as User[])[0]
    }

    const response = await apiClient.get<User>('/officers/me')
    return response.data
  },
}
