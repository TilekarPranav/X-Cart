import axios, { type AxiosError } from "axios"
import { API_BASE_URL, USE_MOCK } from "@/constants/app"
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

// Response interceptor: handle 401 by redirecting to login. There's no stored
// token to check first — the cookie is the only source of truth, and it's
// httpOnly, so we can't inspect it from JS anyway. A 401 just means "not
// authenticated," full stop.
http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
    const status = error.response?.status
    if (
      status === 401 &&
      typeof window !== "undefined" &&
      !window.location.pathname.startsWith("/login") &&
      !window.location.pathname.startsWith("/admin/login")
    ) {
      const next = encodeURIComponent(window.location.pathname)
      window.location.assign(`/login?next=${next}`)
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