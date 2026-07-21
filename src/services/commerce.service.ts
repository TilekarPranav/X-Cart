import { ENDPOINTS } from "@/api/endpoints"
import type {
  ApiResponse,
  Cart,
  Inventory,
  Order,
  Page,
  Payment,
} from "@/types/api"
import { http, unwrap } from "./http"

export const cartService = {
  async get(): Promise<Cart> {
    const { data } = await http.get<ApiResponse<Cart>>(ENDPOINTS.cart.base)
    return unwrap(data)
  },
  async add(payload: { productId: number; quantity: number }): Promise<Cart> {
    const { data } = await http.post<ApiResponse<Cart>>(ENDPOINTS.cart.add, payload)
    return unwrap(data)
  },
  async update(payload: { cartItemId: number; quantity: number }): Promise<Cart> {
    const { data } = await http.put<ApiResponse<Cart>>(ENDPOINTS.cart.update, payload)
    return unwrap(data)
  },
  async remove(cartItemId: number): Promise<Cart | string> {
    const { data } = await http.delete<ApiResponse<Cart>>(ENDPOINTS.cart.remove(cartItemId))
    return data.data ?? data.message
  },
  async clear(): Promise<string> {
    const { data } = await http.delete<ApiResponse<never>>(ENDPOINTS.cart.clear)
    return data.message
  },
}

export const orderService = {
  async list(page = 0, size = 10): Promise<Page<Order>> {
    const { data } = await http.get<ApiResponse<Page<Order>>>(ENDPOINTS.orders.base, { params: { page, size } })
    return unwrap(data)
  },
  async getById(id: number): Promise<Order> {
    const { data } = await http.get<ApiResponse<Order>>(ENDPOINTS.orders.byId(id))
    return unwrap(data)
  },
  async place(): Promise<Order> {
    const { data } = await http.post<ApiResponse<Order>>(ENDPOINTS.orders.base, {})
    return unwrap(data)
  },
  // NOTE: there is no PUT /orders/{id} on the backend. Order status changes
  // are admin-only and live at PUT /admin/orders/{id}/status -
  // use adminService.updateOrderStatus (see admin.service.ts) instead.
  async cancel(id: number): Promise<Order> {
    const { data } = await http.delete<ApiResponse<Order>>(ENDPOINTS.orders.byId(id))
    return unwrap(data)
  },
}

export const paymentService = {
  async getByOrder(orderId: number): Promise<Payment> {
    const { data } = await http.get<ApiResponse<Payment>>(ENDPOINTS.payments.byOrderId(orderId))
    return unwrap(data)
  },
  async pay(payload: { orderId: number; method?: string }): Promise<Payment> {
    const { data } = await http.post<ApiResponse<Payment>>(ENDPOINTS.payments.base, payload)
    return unwrap(data)
  },
}

export const inventoryService = {
  async get(productId: number): Promise<Inventory> {
    const { data } = await http.get<ApiResponse<Inventory>>(ENDPOINTS.inventory.byProductId(productId))
    return unwrap(data)
  },
  async update(payload: { productId: number; quantity: number }): Promise<Inventory> {
    const { data } = await http.put<ApiResponse<Inventory>>(ENDPOINTS.inventory.update, {
      productId: payload.productId,
      quantity: payload.quantity,
      operation: "SET",
    })
    return unwrap(data)
  },
}
