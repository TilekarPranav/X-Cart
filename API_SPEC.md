# Xcart Backend Integration Spec

**Backend base URL:** `https://xcart-ecommerce.onrender.com`

**Important:** This backend runs on Render's free tier and spins down after inactivity. The first request after idle time takes 30-60 seconds (cold start) — this is expected, not an error. Show a "waking up the server, this may take a minute" loading state on first request, and use a 60+ second timeout rather than failing fast.

**CORS is confirmed working** (`Access-Control-Allow-Origin: *`) — a CORS error means a frontend request config issue, not a backend problem.

**Every response is wrapped:**
```json
{ "success": true, "message": "string", "data": {}, "timestamp": "iso-date" }
```
Always unwrap `.data` on success. Show `.message` on failure.

**Test admin account:** `admin@xcart.com` / `password123` (already has ROLE_ADMIN)

---

## Phase 1 — Auth + API Client Foundation

Build/update a shared API client that:
- Sends requests to the base URL above
- Stores the JWT from login/register responses
- Attaches `Authorization: Bearer <token>` to every authenticated call automatically
- Handles 401/expired token by prompting re-login, not crashing

| Method | Endpoint | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/auth/register` | No | `{name, email, password}` | Returns `{accessToken, refreshToken, tokenType, userId, name, email}` |
| POST | `/auth/login` | No | `{email, password}` | Same response shape |
| GET | `/auth/me` | Yes | — | Returns `{id, name, email, roles}` |

**Tasks:** Wire login/register forms to these endpoints. Store token (memory or secure storage). Test: register a new user, log in, call `/auth/me`, confirm token persists across page navigation.

---

## Phase 2 — Categories, Products, Inventory, Images

| Method | Endpoint | Auth | Body / Params |
|---|---|---|---|
| GET | `/categories` | No | — |
| POST | `/categories` | Admin | `{name, description}` |
| PUT | `/categories/{id}` | Admin | `{name, description}` |
| DELETE | `/categories/{id}` | Admin | — |
| GET | `/products/{id}` | No | — |
| GET | `/products/search` | No | `?name=&categoryId=&minPrice=&maxPrice=&page=0&size=10&sort=name,asc` — all optional, returns paginated `Page` object (`content`, `totalPages`, `totalElements`) |
| POST | `/products` | Admin | `{name, description, price, imageUrl, categoryId}` |
| PUT | `/products/{id}` | Admin | same shape |
| DELETE | `/products/{id}` | Admin | — |
| POST | `/products/images` | Admin | multipart form-data, field name `file` → returns `{data: "/products/images/xyz.jpg"}`, prepend base URL to display |
| GET | `/products/images/{filename}` | No | serves raw image |
| GET | `/inventory/{productId}` | No | returns `{productId, productName, quantity, inStock}` |
| PUT | `/inventory/update` | Admin | `{productId, quantity, operation: "SET"|"ADD"|"REDUCE"}` |

**Tasks:** Wire product grid/search/detail pages to real data, remove all mock data. Wire admin product/category CRUD forms. Wire image upload in the admin product form. Test: search with filters, view a product, check its stock.

---

## Phase 3 — Cart, Orders, Payments

| Method | Endpoint | Auth | Body |
|---|---|---|---|
| GET | `/cart` | Yes | — returns `{cartId, items:[{cartItemId, productId, productName, unitPrice, quantity, subtotal}], totalAmount}` |
| POST | `/cart/add` | Yes | `{productId, quantity}` |
| PUT | `/cart/update` | Yes | `{cartItemId, quantity}` |
| DELETE | `/cart/remove/{cartItemId}` | Yes | — |
| DELETE | `/cart/clear` | Yes | — |
| POST | `/orders` | Yes | no body — converts current cart to an order |
| GET | `/orders` | Yes | `?page=0&size=10` — own history |
| GET | `/orders/{id}` | Owner/Admin | — |
| DELETE | `/orders/{id}` | Yes | cancels if status allows |
| POST | `/payments` | Yes | `{orderId}` — simulated gateway, ~80% succeed |
| GET | `/payments/{orderId}` | Yes | — |

**Tasks:** Wire cart page (add/remove/update quantity), checkout flow (place order → pay), order history page. Test: add items, adjust quantity, place an order, pay for it (may fail ~20% of the time by design — retry), view it in order history.

---

## Phase 4 — Reviews, Notifications, Admin Panel

| Method | Endpoint | Auth | Body |
|---|---|---|---|
| POST | `/products/{productId}/reviews` | Yes | `{rating: 1-5, comment}` |
| GET | `/products/{productId}/reviews` | No | `?page=0&size=10` |
| GET | `/products/{productId}/reviews/average` | No | returns a plain number |
| PUT | `/reviews/{id}` | Owner | — |
| DELETE | `/reviews/{id}` | Owner/Admin | — |
| GET | `/notifications` | Yes | `?page=0&size=10` |
| PUT | `/notifications/{id}/read` | Yes | — |
| GET | `/admin/users` | Admin | `?page=0&size=10` |
| PUT | `/admin/users/{id}/disable` | Admin | — |
| PUT | `/admin/users/{id}/enable` | Admin | — |
| DELETE | `/admin/users/{id}` | Admin | — |
| GET | `/admin/orders` | Admin | `?page=0&size=10` |
| PUT | `/admin/orders/{id}/status` | Admin | `{status: "PLACED"|"CONFIRMED"|"SHIPPED"|"DELIVERED"|"CANCELLED"}` |
| GET | `/admin/dashboard` | Admin | returns `{totalUsers, totalProducts, totalOrders, totalRevenue, lowStockProductCount, pendingOrderCount}` |

**Tasks:** Wire product reviews UI, notifications list, and the full admin panel (dashboard stats, user management, order management). Confirm non-admin users can't see/trigger admin-only actions — attempting one directly should show a clear permission error, not fail silently. Test using the admin account listed at the top of this doc.

---

## Final Step — After All 4 Phases

Give a summary: what was wired up, what was tested, what passed, what was fixed, and anything unresolved.
