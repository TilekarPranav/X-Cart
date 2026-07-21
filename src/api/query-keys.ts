import type { ProductQuery } from "@/services/catalog.service"

/** Centralized TanStack Query keys per resource for consistent invalidation. */
export const queryKeys = {
  auth: ["auth", "me"] as const,
  profile: ["users", "profile"] as const,
  categories: ["categories"] as const,
  products: {
    all: ["products"] as const,
    list: (q: ProductQuery) => ["products", "list", q] as const,
    detail: (id: number) => ["products", "detail", id] as const,
  },
  reviews: {
    list: (productId: number, page: number) => ["reviews", productId, page] as const,
    average: (productId: number) => ["reviews", "average", productId] as const,
  },
  cart: ["cart"] as const,
  orders: {
    list: (page: number) => ["orders", "list", page] as const,
    detail: (id: number) => ["orders", "detail", id] as const,
  },
  payment: (orderId: number) => ["payment", orderId] as const,
  inventory: (productId: number) => ["inventory", productId] as const,
  notifications: (page: number) => ["notifications", page] as const,
  admin: {
    dashboard: ["admin", "dashboard"] as const,
    users: (page: number) => ["admin", "users", page] as const,
    orders: (page: number) => ["admin", "orders", page] as const,
  },
}
