import { STORAGE_KEYS } from "@/constants/app"

/**
 * Token store.
 *
 * Both the access and refresh tokens are persisted in localStorage so the
 * session survives page reloads. In a hardened production setup the tokens
 * would live in httpOnly, Secure, SameSite cookies set by the backend.
 */

export const tokenStore = {
  getAccessToken(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.accessToken)
    } catch {
      return null
    }
  },
  setAccessToken(token: string | null) {
    try {
      if (token) localStorage.setItem(STORAGE_KEYS.accessToken, token)
      else localStorage.removeItem(STORAGE_KEYS.accessToken)
    } catch {
      /* storage unavailable */
    }
  },
  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.refreshToken)
    } catch {
      return null
    }
  },
  setRefreshToken(token: string | null) {
    try {
      if (token) localStorage.setItem(STORAGE_KEYS.refreshToken, token)
      else localStorage.removeItem(STORAGE_KEYS.refreshToken)
    } catch {
      /* storage unavailable */
    }
  },
  clear() {
    this.setAccessToken(null)
    this.setRefreshToken(null)
  },
}
