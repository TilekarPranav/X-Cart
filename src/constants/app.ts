/** App-wide constants and configuration. */

export const APP = {
  name: "X Cart",
  tagline: "Premium shopping, reimagined.",
  supportEmail: "support@xcart.shop",
} as const

/** When true, requests are served by the in-memory mock backend. */
export const USE_MOCK =
  (import.meta.env.VITE_USE_MOCK ?? "false") !== "false"

// Direct to the backend, not through Render's /api proxy: that proxy was
// tried and empirically ruled out — a direct curl request round-tripped the
// CSRF cookie correctly, while every attempt through the proxy silently lost
// it. If VITE_API_BASE_URL is set in Render's dashboard or CI env, remove it
// (or set it back to this same absolute URL) — leaving it at "/api" will
// reproduce the bug this comment is describing.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "https://xcart-ecommerce.onrender.com"

export const STORAGE_KEYS = {
  theme: "xcart.theme",
  recentSearches: "xcart.recentSearches",
  wishlist: "xcart.wishlist",
} as const

export const TRENDING_SEARCHES = [
  "Wireless earbuds",
  "Mechanical keyboard",
  "Running shoes",
  "Smart watch",
  "Air purifier",
  "Standing desk",
]

/** Free-delivery threshold used for UI messaging (mock). */
export const FREE_DELIVERY_THRESHOLD = 50

export const PAGE_SIZE = 12