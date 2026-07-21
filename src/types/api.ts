/**
 * Types mirror the backend API contract exactly.
 * Do not add fields the backend does not return. Any UI-only data is marked
 * with a `// TODO: backend endpoint pending` note where it is derived.
 */

export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
  timestamp: string
}

/**
 * Matches Spring Boot's default `Page<T>` JSON serialization (PageImpl),
 * which is a FLAT shape — totalElements/totalPages/number/size sit
 * alongside `content`, not nested under a `page` key. Confirmed against
 * the live backend response shape (e.g. GET /admin/users):
 * { content: [...], totalElements, totalPages, number, size, first, last, empty, numberOfElements, ... }
 *
 * If the backend later enables `@EnableSpringDataWebSupport(pageSerializationMode = VIA_DTO)`,
 * responses switch to a nested `{ content, page: { size, number, totalElements, totalPages } }`
 * shape instead — this type would need to change back if that flag is added.
 */
export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
  empty: boolean
  numberOfElements: number
}

/* ------------------------------- Auth ------------------------------- */

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  tokenType: string
  userId: number
  name: string
  email: string
}

export type Role = "ROLE_CUSTOMER" | "ROLE_ADMIN"

export interface AuthUser {
  id: number
  name: string
  email: string
  roles: string[]
}

/* ------------------------------ Users ------------------------------- */

export interface UserProfile {
  id: number
  name: string
  email: string
  roles: string[]
}

/* ---------------------------- Categories ---------------------------- */

export interface Category {
  id: number
  name: string
  description: string
  createdAt: string
}

/* ----------------------------- Products ----------------------------- */

export interface Product {
  id: number
  name: string
  description: string
  price: number
  imageUrl: string
  active: boolean
  categoryId: number
  categoryName: string
  createdAt: string
}

/* ------------------------------- Cart ------------------------------- */

export interface CartItem {
  cartItemId: number
  productId: number
  productName: string
  unitPrice: number
  quantity: number
  subtotal: number
}

export interface Cart {
  cartId: number
  items: CartItem[]
  totalAmount: number
}

/* ------------------------------ Orders ------------------------------ */

export type OrderStatus = "PLACED" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED"

export interface OrderItem {
  productId: number
  productName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface Order {
  id: number
  status: OrderStatus | string
  totalAmount: number
  items: OrderItem[]
  createdAt: string
}

/* ----------------------------- Payments ----------------------------- */

export type PaymentStatus = "SUCCESS" | "FAILED" | "PENDING" | string

export interface Payment {
  id: number
  orderId: number
  status: PaymentStatus
  amount: number
  providerRef: string
  createdAt: string
}

/* ---------------------------- Inventory ----------------------------- */

export interface Inventory {
  productId: number
  productName: string
  quantity: number
  inStock: boolean
}

/* ----------------------------- Reviews ------------------------------ */

export interface Review {
  id: number
  productId: number
  reviewerName: string
  rating: number
  comment: string
  createdAt: string
}

/* -------------------------- Notifications --------------------------- */

export interface AppNotification {
  id: number
  title: string
  message: string
  read: boolean
  createdAt: string
}

/* -------------------------- Admin dashboard ------------------------- */

export interface AdminDashboard {
  totalUsers: number
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  lowStockProductCount: number
  pendingOrderCount: number
}

export interface AdminUser {
  id: number
  name: string
  email: string
  roles: string[]
  enabled: boolean
}
