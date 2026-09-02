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
 * CSRF is handled explicitly below, NOT via axios's built-in withXSRFToken.
 * withXSRFToken reads the token straight out of document.cookie — which only
 * works when the cookie was set by the same site the page is running on.
 * Here it wasn't: the XSRF-TOKEN cookie is set by a response from
 * xcart-ecommerce.onrender.com, a different registrable site than
 * x-cart.onrender.com, so document.cookie on this page can never see it,
 * regardless of SameSite/Partitioned. Instead we fetch the token from the
 * response BODY of GET /auth/csrf (which the backend returns for exactly
 * this reason) and attach it to the header ourselves.
 */
export const http = axios.create({
  baseURL: USE_MOCK ? "" : API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 65_000, // Render free tier cold starts can take 30-60 seconds
  withCredentials: true,
})

if (USE_MOCK) {
  http.defaults.adapter = mockAdapter
}

/* ------------------------------- CSRF ----------------------------------- */

const CSRF_HEADER_NAME = "X-XSRF-TOKEN"
const SAFE_METHODS = new Set(["get", "head", "options"])

let csrfTokenPromise: Promise<string> | null = null

async function fetchCsrfToken(): Promise<string> {
  // Plain axios, not `http` — GET is a safe method so the request interceptor
  // below wouldn't touch it anyway, but using the raw client keeps this
  // bootstrap call obviously independent of the CSRF machinery it's priming.
  const { data } = await axios.get<ApiResponse<string>>(`${USE_MOCK ? "" : API_BASE_URL}${ENDPOINTS.auth.csrf}`, {
    withCredentials: true,
  })
  if (!data.data) throw new Error("CSRF token endpoint returned no token")
  return data.data
}

function getCsrfToken(): Promise<string> {
  if (!csrfTokenPromise) {
    csrfTokenPromise = fetchCsrfToken().catch((err) => {
      csrfTokenPromise = null // don't cache a failure — the next attempt should retry
      throw err
    })
  }
  return csrfTokenPromise
}

/**
 * Call after login/register/logout: those are the points where the backend's
 * authentication state changes, and if Spring Security ever starts rotating
 * the CSRF token on authentication change (it's not confirmed either way for
 * this app's custom login flow), a cached pre-login token would otherwise go
 * stale silently. Cheap to call defensively — worst case, one extra GET.
 */
export function invalidateCsrfToken() {
  csrfTokenPromise = null
}

http.interceptors.request.use(async (config) => {
  const method = (config.method || "get").toLowerCase()
  if (USE_MOCK || SAFE_METHODS.has(method)) return config
  if ((config.url || "").includes(ENDPOINTS.auth.csrf)) return config // avoid recursing on the fetch itself

  const token = await getCsrfToken()
  config.headers = config.headers ?? {}
  config.headers[CSRF_HEADER_NAME] = token
  return config
})

/* ---------------------------- 401 / refresh ------------------------------ */

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