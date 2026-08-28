import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios"
import { API_BASE_URL, USE_MOCK } from "@/constants/app"
import { ENDPOINTS } from "@/api/endpoints"
import type { ApiResponse } from "@/types/api"
import { mockAdapter } from "./mock/server"

/**
 * Single configured Axios instance for the whole app.
 *
 * Auth is cookie-based (httpOnly accessToken/refreshToken set by the backend),
 * not header-based — there is no token for JS to read or attach manually.
 * `withCredentials` is required for the browser to send/receive those cookies
 * at all, since the frontend (x-cart.onrender.com) and backend
 * (xcart-ecommerce.onrender.com) are different origins/sites.
 *
 * `withXSRFToken: true` is required (not just the default) because Axios only
 * auto-attaches the XSRF header for same-origin requests unless told
 * otherwise — and this app is intentionally cross-origin. The cookie/header
 * names match Spring Security's CookieCsrfTokenRepository.withHttpOnlyFalse()
 * defaults, so no further configuration is needed on that side.
 */
export const http = axios.create({
  baseURL: USE_MOCK ? "" : API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 65_000, // Render free tier cold starts can take 30-60 seconds
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
})

if (USE_MOCK) {
  http.defaults.adapter = mockAdapter
}

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

function processQueue(error: AxiosError | null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve()
    }
  })
  failedQueue = []
}

function redirectToLogin() {
  if (
    typeof window !== "undefined" &&
    !window.location.pathname.startsWith("/login") &&
    !window.location.pathname.startsWith("/admin/login")
  ) {
    const next = encodeURIComponent(window.location.pathname + window.location.search)
    window.location.assign(`/login?next=${next}`)
  }
}

// Response interceptor: handle 401 with silent token refresh attempt before redirecting
http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined
    const status = error.response?.status
    const requestUrl = originalRequest?.url || ""

    const isAuthEndpoint =
      requestUrl.includes(ENDPOINTS.auth.login) ||
      requestUrl.includes(ENDPOINTS.auth.register) ||
      requestUrl.includes(ENDPOINTS.auth.refresh)

    if (status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => http(originalRequest))
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        await http.post(ENDPOINTS.auth.refresh)
        processQueue(null)
        return http(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError as AxiosError)
        redirectToLogin()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    if (status === 401 && isAuthEndpoint && !requestUrl.includes(ENDPOINTS.auth.login)) {
      redirectToLogin()
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