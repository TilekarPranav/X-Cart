import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from "axios"
import type {
  AdminDashboard,
  ApiResponse,
  AuthTokens,
  AuthUser,
  Cart,
  CartItem,
  Order,
  OrderStatus,
  Page,
  Payment,
  Product,
  Review,
} from "@/types/api"
import {
  adminUsers,
  categories,
  inventory,
  notifications,
  orders,
  payments,
  products,
  reviewsByProduct,
} from "./data"

/**
 * Lightweight in-memory mock backend implemented as an Axios adapter. It mirrors
 * the API contract's envelope, pagination and error messages so the UI behaves
 * exactly as it will against the real backend.
 */

const LATENCY = 420

function now() {
  return new Date().toISOString()
}

function ok<T>(data: T, message = "OK"): ApiResponse<T> {
  return { success: true, message, data, timestamp: now() }
}

function fail(message: string): ApiResponse<never> {
  return { success: false, message, timestamp: now() }
}

function paginate<T>(items: T[], page: number, size: number): Page<T> {
  const start = page * size
  const content = items.slice(start, start + size)
  const totalPages = Math.max(1, Math.ceil(items.length / size))
  return {
    content,
    size,
    number: page,
    totalElements: items.length,
    totalPages,
    first: page === 0,
    last: page >= totalPages - 1,
    empty: content.length === 0,
    numberOfElements: content.length,
  }
}

/* ------------------------------- Session ------------------------------- */

const KNOWN_USERS: Record<string, { id: number; name: string; roles: string[]; password: string }> = {
  "customer@xcart.shop": { id: 1, name: "Ava Customer", roles: ["ROLE_CUSTOMER"], password: "password" },
  "admin@xcart.shop": { id: 2, name: "Site Admin", roles: ["ROLE_ADMIN", "ROLE_CUSTOMER"], password: "admin123" },
}

let currentUser: AuthUser | null = null
let registeredExtra: Record<string, { id: number; name: string; roles: string[]; password: string }> = {}

const cart: Cart = { cartId: 1, items: [], totalAmount: 0 }
let cartItemSeq = 1

function recalcCart() {
  cart.totalAmount = cart.items.reduce((sum, i) => sum + i.subtotal, 0)
}

/* --------------------------- Route resolution -------------------------- */

interface Ctx {
  method: string
  path: string
  body: any
  params: URLSearchParams
}

type Handler = (ctx: Ctx, match: RegExpMatchArray) => { status: number; payload: ApiResponse<unknown> }

interface Route {
  method: string
  pattern: RegExp
  handler: Handler
}

const routes: Route[] = []
function route(method: string, pattern: RegExp, handler: Handler) {
  routes.push({ method, pattern, handler })
}

/* ------------------------------- Auth ---------------------------------- */

function tokensFor(user: { id: number; name: string }, email: string): AuthTokens {
  return {
    accessToken: `mock-access-${user.id}-${Date.now()}`,
    refreshToken: `mock-refresh-${user.id}`,
    tokenType: "Bearer",
    userId: user.id,
    name: user.name,
    email,
  }
}

route("post", /^\/auth\/login$/, ({ body }) => {
  const email = String(body?.email ?? "").toLowerCase()
  const found = KNOWN_USERS[email] ?? registeredExtra[email]
  if (!found || found.password !== body?.password) {
    return { status: 401, payload: fail("Invalid email or password") }
  }
  currentUser = { id: found.id, name: found.name, email, roles: found.roles }
  return { status: 200, payload: ok(tokensFor(found, email), "Logged in successfully") }
})

route("post", /^\/auth\/register$/, ({ body }) => {
  const email = String(body?.email ?? "").toLowerCase()
  if (KNOWN_USERS[email] || registeredExtra[email]) {
    return { status: 409, payload: fail("An account with this email already exists") }
  }
  const id = 100 + Object.keys(registeredExtra).length + 1
  const record = { id, name: body?.name ?? "New User", roles: ["ROLE_CUSTOMER"], password: body?.password }
  registeredExtra[email] = record
  currentUser = { id, name: record.name, email, roles: record.roles }
  return { status: 201, payload: ok(tokensFor(record, email), "Account created successfully") }
})

route("get", /^\/auth\/me$/, () => {
  if (!currentUser) return { status: 401, payload: fail("Not authenticated") }
  return { status: 200, payload: ok(currentUser) }
})

/* ------------------------------- Users --------------------------------- */

route("get", /^\/users\/profile$/, () => {
  if (!currentUser) return { status: 401, payload: fail("Not authenticated") }
  return { status: 200, payload: ok(currentUser) }
})

route("put", /^\/users\/profile$/, ({ body }) => {
  if (!currentUser) return { status: 401, payload: fail("Not authenticated") }
  currentUser = { ...currentUser, name: body?.name ?? currentUser.name }
  return { status: 200, payload: ok(currentUser, "Profile updated") }
})

route("put", /^\/users\/change-password$/, ({ body }) => {
  if (!body?.currentPassword || !body?.newPassword) {
    return { status: 400, payload: fail("Current and new password are required") }
  }
  return { status: 200, payload: { success: true, message: "Password changed successfully", timestamp: now() } }
})

/* ----------------------------- Categories ------------------------------ */

route("get", /^\/categories$/, () => ({ status: 200, payload: ok(categories) }))

route("post", /^\/categories$/, ({ body }) => {
  const cat = { id: Math.max(...categories.map((c) => c.id)) + 1, name: body.name, description: body.description, createdAt: now() }
  categories.push(cat)
  return { status: 201, payload: ok(cat, "Category created") }
})

route("put", /^\/categories\/(\d+)$/, ({ body }, m) => {
  const id = Number(m[1])
  const cat = categories.find((c) => c.id === id)
  if (!cat) return { status: 404, payload: fail("Category not found") }
  cat.name = body.name
  cat.description = body.description
  return { status: 200, payload: ok(cat, "Category updated") }
})

route("delete", /^\/categories\/(\d+)$/, (_c, m) => {
  const id = Number(m[1])
  const idx = categories.findIndex((c) => c.id === id)
  if (idx === -1) return { status: 404, payload: fail("Category not found") }
  categories.splice(idx, 1)
  return { status: 200, payload: { success: true, message: "Category deleted", timestamp: now() } }
})

/* ------------------------------ Products ------------------------------- */

route("get", /^\/products\/search$/, ({ params }) => {
  const q = (params.get("name") ?? "").toLowerCase()
  const category = params.get("categoryId")
  const page = Number(params.get("page") ?? 0)
  const size = Number(params.get("size") ?? 12)
  let list = products.filter((p) => p.name.toLowerCase().includes(q))
  if (category) list = list.filter((p) => p.categoryId === Number(category))
  return { status: 200, payload: ok(paginate<Product>(list, page, size)) }
})

route("get", /^\/products\/(\d+)\/reviews\/average$/, (_c, m) => {
  const id = Number(m[1])
  const list = reviewsByProduct[id] ?? []
  const avg = list.length ? list.reduce((s, r) => s + r.rating, 0) / list.length : 0
  return { status: 200, payload: ok(Math.round(avg * 10) / 10) }
})

route("get", /^\/products\/(\d+)\/reviews$/, (ctx, m) => {
  const id = Number(m[1])
  const page = Number(ctx.params.get("page") ?? 0)
  const size = Number(ctx.params.get("size") ?? 10)
  return { status: 200, payload: ok(paginate<Review>(reviewsByProduct[id] ?? [], page, size)) }
})

route("post", /^\/products\/(\d+)\/reviews$/, ({ body }, m) => {
  const id = Number(m[1])
  const list = (reviewsByProduct[id] ??= [])
  const review: Review = {
    id: Date.now(),
    productId: id,
    reviewerName: body.reviewerName,
    rating: body.rating,
    comment: body.comment,
    createdAt: now(),
  }
  list.unshift(review)
  return { status: 201, payload: ok(review, "Review submitted") }
})

route("get", /^\/products\/(\d+)$/, (_c, m) => {
  const p = products.find((x) => x.id === Number(m[1]))
  if (!p) return { status: 404, payload: fail("Product not found") }
  return { status: 200, payload: ok(p) }
})

route("get", /^\/products$/, ({ params }) => {
  const page = Number(params.get("page") ?? 0)
  const size = Number(params.get("size") ?? 12)
  return { status: 200, payload: ok(paginate<Product>(products, page, size)) }
})

route("post", /^\/products$/, ({ body }) => {
  const cat = categories.find((c) => c.id === Number(body.categoryId))
  const p: Product = {
    id: Math.max(...products.map((x) => x.id)) + 1,
    name: body.name,
    description: body.description,
    price: Number(body.price),
    imageUrl: body.imageUrl || "/products/backpack.png",
    active: true,
    categoryId: Number(body.categoryId),
    categoryName: cat?.name ?? "Uncategorized",
    createdAt: now(),
  }
  products.push(p)
  inventory[p.id] = 0
  return { status: 201, payload: ok(p, "Product created") }
})

route("put", /^\/products\/(\d+)$/, ({ body }, m) => {
  const p = products.find((x) => x.id === Number(m[1]))
  if (!p) return { status: 404, payload: fail("Product not found") }
  const cat = categories.find((c) => c.id === Number(body.categoryId))
  Object.assign(p, {
    name: body.name,
    description: body.description,
    price: Number(body.price),
    imageUrl: body.imageUrl,
    categoryId: Number(body.categoryId),
    categoryName: cat?.name ?? p.categoryName,
  })
  return { status: 200, payload: ok(p, "Product updated") }
})

route("delete", /^\/products\/(\d+)$/, (_c, m) => {
  const idx = products.findIndex((x) => x.id === Number(m[1]))
  if (idx === -1) return { status: 404, payload: fail("Product not found") }
  products.splice(idx, 1)
  return { status: 200, payload: { success: true, message: "Product deleted", timestamp: now() } }
})

/* -------------------------------- Cart --------------------------------- */

function cartItemFromProduct(productId: number, quantity: number): CartItem {
  const p = products.find((x) => x.id === productId)
  const unitPrice = p?.price ?? 0
  return {
    cartItemId: cartItemSeq++,
    productId,
    productName: p?.name ?? "Product",
    unitPrice,
    quantity,
    subtotal: unitPrice * quantity,
  }
}

route("get", /^\/cart$/, () => ({ status: 200, payload: ok(cart) }))

route("post", /^\/cart\/add$/, ({ body }) => {
  const existing = cart.items.find((i) => i.productId === Number(body.productId))
  if (existing) {
    existing.quantity += Number(body.quantity)
    existing.subtotal = existing.unitPrice * existing.quantity
  } else {
    cart.items.push(cartItemFromProduct(Number(body.productId), Number(body.quantity)))
  }
  recalcCart()
  return { status: 200, payload: ok(cart, "Item added to cart") }
})

route("put", /^\/cart\/update$/, ({ body }) => {
  const item = cart.items.find((i) => i.cartItemId === Number(body.cartItemId))
  if (!item) return { status: 404, payload: fail("Cart item not found") }
  item.quantity = Number(body.quantity)
  item.subtotal = item.unitPrice * item.quantity
  recalcCart()
  return { status: 200, payload: ok(cart, "Cart updated") }
})

route("delete", /^\/cart\/remove\/(\d+)$/, (_c, m) => {
  const idx = cart.items.findIndex((i) => i.cartItemId === Number(m[1]))
  if (idx === -1) return { status: 404, payload: fail("Cart item not found") }
  cart.items.splice(idx, 1)
  recalcCart()
  return { status: 200, payload: ok(cart, "Item removed") }
})

route("delete", /^\/cart\/clear$/, () => {
  cart.items = []
  recalcCart()
  return { status: 200, payload: { success: true, message: "Cart cleared", timestamp: now() } }
})

/* ------------------------------- Orders -------------------------------- */

const ALLOWED_TRANSITIONS: Record<string, OrderStatus[]> = {
  PLACED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
}

route("get", /^\/orders\/(\d+)$/, (_c, m) => {
  const o = orders.find((x) => x.id === Number(m[1]))
  if (!o) return { status: 404, payload: fail("Order not found") }
  return { status: 200, payload: ok(o) }
})

route("get", /^\/orders$/, ({ params }) => {
  const page = Number(params.get("page") ?? 0)
  const size = Number(params.get("size") ?? 10)
  const sorted = [...orders].sort((a, b) => b.id - a.id)
  return { status: 200, payload: ok(paginate<Order>(sorted, page, size)) }
})

route("post", /^\/orders$/, () => {
  if (cart.items.length === 0) {
    return { status: 400, payload: fail("Cannot place an order with an empty cart") }
  }
  const order: Order = {
    id: Math.max(...orders.map((o) => o.id)) + 1,
    status: "PLACED",
    totalAmount: cart.totalAmount,
    createdAt: now(),
    items: cart.items.map((i) => ({
      productId: i.productId,
      productName: i.productName,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      subtotal: i.subtotal,
    })),
  }
  orders.push(order)
  cart.items = []
  recalcCart()
  return { status: 201, payload: ok(order, "Order placed successfully") }
})

function transition(id: number, next: string) {
  const o = orders.find((x) => x.id === id)
  if (!o) return { status: 404, payload: fail("Order not found") }
  const allowed = ALLOWED_TRANSITIONS[o.status] ?? []
  if (!allowed.includes(next as OrderStatus)) {
    return { status: 409, payload: fail(`Cannot transition order from ${o.status} to ${next}`) }
  }
  o.status = next
  return { status: 200, payload: ok(o, `Order ${next.toLowerCase()}`) }
}

route("put", /^\/orders\/(\d+)$/, ({ body }, m) => transition(Number(m[1]), body?.status))

/* ------------------------------ Payments ------------------------------- */

route("get", /^\/payments\/(\d+)$/, (_c, m) => {
  const p = payments.find((x) => x.orderId === Number(m[1]))
  if (!p) return { status: 404, payload: fail("Payment not found") }
  return { status: 200, payload: ok(p) }
})

route("post", /^\/payments$/, ({ body }) => {
  const order = orders.find((o) => o.id === Number(body.orderId))
  if (!order) return { status: 404, payload: fail("Order not found") }
  if (order.status !== "PLACED") {
    return { status: 409, payload: fail("Order must be in PLACED status to process payment") }
  }
  const payment: Payment = {
    id: Date.now(),
    orderId: order.id,
    status: "SUCCESS",
    amount: order.totalAmount,
    providerRef: `pay_${Math.random().toString(16).slice(2, 9)}`,
    createdAt: now(),
  }
  payments.push(payment)
  order.status = "CONFIRMED"
  return { status: 201, payload: ok(payment, "Payment successful") }
})

/* ------------------------------ Inventory ------------------------------ */

function inventoryPayload(productId: number) {
  const p = products.find((x) => x.id === productId)
  const quantity = inventory[productId] ?? 0
  return { productId, productName: p?.name ?? "Product", quantity, inStock: quantity > 0 }
}

route("get", /^\/inventory\/(\d+)$/, (_c, m) => ({ status: 200, payload: ok(inventoryPayload(Number(m[1]))) }))

route("post", /^\/inventory\/update$/, ({ body }) => {
  inventory[Number(body.productId)] = Number(body.quantity)
  return { status: 200, payload: ok(inventoryPayload(Number(body.productId)), "Inventory updated") }
})

/* --------------------------- Notifications ----------------------------- */

route("get", /^\/notifications$/, ({ params }) => {
  const page = Number(params.get("page") ?? 0)
  const size = Number(params.get("size") ?? 10)
  return { status: 200, payload: ok(paginate(notifications, page, size)) }
})

route("put", /^\/notifications\/(\d+)\/read$/, (_c, m) => {
  const n = notifications.find((x) => x.id === Number(m[1]))
  if (!n) return { status: 404, payload: fail("Notification not found") }
  n.read = true
  return { status: 200, payload: { success: true, message: "Marked as read", timestamp: now() } }
})

/* ------------------------------- Admin --------------------------------- */

route("get", /^\/admin\/dashboard$/, () => {
  const dash: AdminDashboard = {
    totalUsers: adminUsers.length,
    totalProducts: products.length,
    totalOrders: orders.length,
    totalRevenue: orders.filter((o) => o.status !== "CANCELLED").reduce((s, o) => s + o.totalAmount, 0),
    lowStockProductCount: Object.values(inventory).filter((q) => q > 0 && q < 8).length,
    pendingOrderCount: orders.filter((o) => o.status === "PLACED").length,
  }
  return { status: 200, payload: ok(dash) }
})

route("get", /^\/admin\/users$/, ({ params }) => {
  const page = Number(params.get("page") ?? 0)
  const size = Number(params.get("size") ?? 10)
  return { status: 200, payload: ok(paginate(adminUsers, page, size)) }
})

route("delete", /^\/admin\/users\/(\d+)$/, (_c, m) => {
  const idx = adminUsers.findIndex((u) => u.id === Number(m[1]))
  if (idx === -1) return { status: 404, payload: fail("User not found") }
  adminUsers.splice(idx, 1)
  return { status: 200, payload: { success: true, message: "User deleted", timestamp: now() } }
})

route("put", /^\/admin\/users\/(\d+)\/disable$/, (_c, m) => {
  const u = adminUsers.find((x) => x.id === Number(m[1]))
  if (!u) return { status: 404, payload: fail("User not found") }
  u.enabled = false
  return { status: 200, payload: { success: true, message: "User disabled", timestamp: now() } }
})

route("put", /^\/admin\/users\/(\d+)\/enable$/, (_c, m) => {
  const u = adminUsers.find((x) => x.id === Number(m[1]))
  if (!u) return { status: 404, payload: fail("User not found") }
  u.enabled = true
  return { status: 200, payload: { success: true, message: "User enabled", timestamp: now() } }
})

route("get", /^\/admin\/orders$/, ({ params }) => {
  const page = Number(params.get("page") ?? 0)
  const size = Number(params.get("size") ?? 10)
  const sorted = [...orders].sort((a, b) => b.id - a.id)
  return { status: 200, payload: ok(paginate<Order>(sorted, page, size)) }
})

route("put", /^\/admin\/orders\/(\d+)\/status$/, ({ body }, m) => {
  const res = transition(Number(m[1]), body?.status)
  if (res.payload.success) {
    return { status: 200, payload: { success: true, message: `Order status updated to ${body?.status}`, timestamp: now() } }
  }
  return res
})

/* ------------------------------ Adapter -------------------------------- */

export const mockAdapter: AxiosAdapter = (config: InternalAxiosRequestConfig) => {
  return new Promise<AxiosResponse>((resolve, reject) => {
    const method = (config.method ?? "get").toLowerCase()
    const url = config.url ?? ""
    const [rawPath, queryString] = url.split("?")
    const path = rawPath.replace(/\/+$/, "") || "/"
    const params = new URLSearchParams(queryString ?? "")
    if (config.params) {
      Object.entries(config.params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) params.set(k, String(v))
      })
    }
    let body: any = config.data
    if (typeof body === "string") {
      try {
        body = JSON.parse(body)
      } catch {
        /* not json */
      }
    }

    const matched = routes.find((r) => r.method === method && r.pattern.test(path))

    setTimeout(() => {
      if (!matched) {
        const payload = fail(`No mock handler for ${method.toUpperCase()} ${path}`)
        return reject(buildError(config, 404, payload))
      }
      const match = path.match(matched.pattern) as RegExpMatchArray
      const { status, payload } = matched.handler({ method, path, body, params }, match)
      const response: AxiosResponse = {
        data: payload,
        status,
        statusText: status >= 200 && status < 300 ? "OK" : "Error",
        headers: {},
        config,
      }
      if (status >= 400) return reject(buildError(config, status, payload))
      resolve(response)
    }, LATENCY)
  })
}

function buildError(config: InternalAxiosRequestConfig, status: number, payload: ApiResponse<unknown>) {
  const error: any = new Error(payload.message)
  error.isAxiosError = true
  error.config = config
  error.response = {
    data: payload,
    status,
    statusText: "Error",
    headers: {},
    config,
  }
  return error
}
