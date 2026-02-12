import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

// Example API functions - replace with actual API calls
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// Example query hook
export function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: () => fetchJson<{ id: string; name: string; email: string }>(`${API_BASE}/user`),
  })
}

// Example mutation hook
export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { name?: string; email?: string }) =>
      fetchJson(`${API_BASE}/user`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] })
    },
  })
}