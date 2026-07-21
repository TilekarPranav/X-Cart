/** Centralized endpoint constants — no inline magic strings across services. */

export const ENDPOINTS = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    me: "/auth/me",
  },
  users: {
    profile: "/users/profile",
    changePassword: "/users/change-password",
  },
  products: {
    base: "/products",
    byId: (id: number | string) => `/products/${id}`,
    search: "/products/search",
    reviews: (id: number | string) => `/products/${id}/reviews`,
    reviewsAverage: (id: number | string) => `/products/${id}/reviews/average`,
  },
  reviews: {
    byId: (id: number | string) => `/reviews/${id}`,
  },
  categories: {
    base: "/categories",
    byId: (id: number | string) => `/categories/${id}`,
  },
  cart: {
    base: "/cart",
    add: "/cart/add",
    update: "/cart/update",
    remove: (cartItemId: number | string) => `/cart/remove/${cartItemId}`,
    clear: "/cart/clear",
  },
  orders: {
    base: "/orders",
    byId: (id: number | string) => `/orders/${id}`,
  },
  payments: {
    base: "/payments",
    byOrderId: (orderId: number | string) => `/payments/${orderId}`,
  },
  inventory: {
    byProductId: (productId: number | string) => `/inventory/${productId}`,
    update: "/inventory/update",
  },
  notifications: {
    base: "/notifications",
    read: (id: number | string) => `/notifications/${id}/read`,
  },
  admin: {
    dashboard: "/admin/dashboard",
    users: "/admin/users",
    userDisable: (id: number | string) => `/admin/users/${id}/disable`,
    userEnable: (id: number | string) => `/admin/users/${id}/enable`,
    userById: (id: number | string) => `/admin/users/${id}`,
    orders: "/admin/orders",
    orderStatus: (id: number | string) => `/admin/orders/${id}/status`,
  },
} as const
