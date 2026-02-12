import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

// Example API fetcher - replace with your actual API calls
const API_BASE = "/api"

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// Example query hook
export function useApiQuery<T>(key: string[], url: string) {
  return useQuery<T>({
    queryKey: key,
    queryFn: () => fetcher<T>(url),
  })
}

// Example mutation hook
export function useApiMutation<T, U>(url: string, method: "POST" | "PUT" | "DELETE" = "POST") {
  const queryClient = useQueryClient()

  return useMutation<T, Error, U>({
    mutationFn: (data) =>
      fetcher<T>(url, {
        method,
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries()
    },
  })
}

export { fetcher }