import axios, { type AxiosError } from "axios"
import { API_BASE_URL, USE_MOCK } from "@/constants/app"
import type { ApiResponse } from "@/types/api"
import { tokenStore } from "./token-store"
import { mockAdapter } from "./mock/server"

/** Single configured Axios instance for the whole app. */
export const http = axios.create({
  baseURL: USE_MOCK ? "" : API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 65_000, // Render free tier cold starts can take 30-60 seconds
})

if (USE_MOCK) {
  http.defaults.adapter = mockAdapter
}

// Request interceptor: inject the bearer token.
http.interceptors.request.use((config) => {
  const token = tokenStore.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: unwrap errors and handle 401.
http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
    const status = error.response?.status
    // 401: token expired/invalid. In a real app we'd call the refresh endpoint
    // here with the refresh token, then retry the original request once.
    if (status === 401 && tokenStore.getAccessToken()) {
      tokenStore.clear()
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        // soft redirect to login preserving the intended destination
        const next = encodeURIComponent(window.location.pathname)
        window.location.assign(`/login?next=${next}`)
      }
    }
    return Promise.reject(error)
  },
)

/** Extract the human-readable message from an API/Axios error. */
export function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  const err = error as AxiosError<ApiResponse<unknown>>
  return err?.response?.data?.message ?? err?.message ?? fallback
}

/** Unwrap the `data` field from the API envelope, throwing if absent. */
export function unwrap<T>(payload: ApiResponse<T>): T {
  if (payload.data === undefined) {
    throw new Error(payload.message || "Empty response")
  }
  return payload.data
}
