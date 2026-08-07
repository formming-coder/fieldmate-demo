import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attempt) => Math.min(15000, 1000 * Math.pow(2, attempt)),
      refetchOnWindowFocus: true,
      staleTime: 30000,
    },
    mutations: {
      retry: 1,
      retryDelay: 1200,
    },
  },
})
