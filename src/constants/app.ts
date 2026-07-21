/** App-wide constants and configuration. */

export const APP = {
  name: "X Cart",
  tagline: "Premium shopping, reimagined.",
  supportEmail: "support@xcart.shop",
  currency: "USD",
} as const

/** When true, requests are served by the in-memory mock backend. */
export const USE_MOCK =
  (import.meta.env.VITE_USE_MOCK ?? "false") !== "false"

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "https://xcart-ecommerce.onrender.com"

export const STORAGE_KEYS = {
  accessToken: "xcart.accessToken",
  refreshToken: "xcart.refreshToken",
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
