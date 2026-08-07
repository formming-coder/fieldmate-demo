import { AxiosError, AxiosRequestConfig } from 'axios'
import { apiClient } from '../../lib/http/client'

export type ApiError = {
  status: number
  code: string
  message: string
  retryable: boolean
}

function toApiError(error: unknown): ApiError {
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as AxiosError<{ code?: string; message?: string }>
    const status = axiosError.response?.status || 0
    return {
      status,
      code: axiosError.response?.data?.code || 'API_ERROR',
      message: axiosError.response?.data?.message || axiosError.message || 'เกิดข้อผิดพลาดจากการเชื่อมต่อ API',
      retryable: status === 0 || status >= 500,
    }
  }

  return {
    status: 0,
    code: 'UNKNOWN_ERROR',
    message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ',
    retryable: true,
  }
}

async function request<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await apiClient.request<T>(config)
    return response.data
  } catch (error) {
    throw toApiError(error)
  }
}

export const apiService = {
  get: <T>(url: string, config?: AxiosRequestConfig) => request<T>({ ...config, method: 'get', url }),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => request<T>({ ...config, method: 'post', url, data }),
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => request<T>({ ...config, method: 'put', url, data }),
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => request<T>({ ...config, method: 'patch', url, data }),
  delete: <T>(url: string, config?: AxiosRequestConfig) => request<T>({ ...config, method: 'delete', url }),
}
