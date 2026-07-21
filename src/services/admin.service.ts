import { ENDPOINTS } from "@/api/endpoints"
import type {
  AdminDashboard,
  AdminUser,
  ApiResponse,
  AppNotification,
  Order,
  Page,
} from "@/types/api"
import { http, unwrap } from "./http"

export const notificationService = {
  async list(page = 0, size = 10): Promise<Page<AppNotification>> {
    const { data } = await http.get<ApiResponse<Page<AppNotification>>>(ENDPOINTS.notifications.base, {
      params: { page, size },
    })
    return unwrap(data)
  },
  async markRead(id: number): Promise<string> {
    const { data } = await http.put<ApiResponse<never>>(ENDPOINTS.notifications.read(id))
    return data.message
  },
}

export const adminService = {
  async dashboard(): Promise<AdminDashboard> {
    const { data } = await http.get<ApiResponse<AdminDashboard>>(ENDPOINTS.admin.dashboard)
    return unwrap(data)
  },
  async users(page = 0, size = 10): Promise<Page<AdminUser>> {
    const { data } = await http.get<ApiResponse<Page<AdminUser>>>(ENDPOINTS.admin.users, { params: { page, size } })
    return unwrap(data)
  },
  async deleteUser(id: number): Promise<string> {
    const { data } = await http.delete<ApiResponse<never>>(ENDPOINTS.admin.userById(id))
    return data.message
  },
  async disableUser(id: number): Promise<string> {
    const { data } = await http.put<ApiResponse<never>>(ENDPOINTS.admin.userDisable(id))
    return data.message
  },
  async enableUser(id: number): Promise<string> {
    const { data } = await http.put<ApiResponse<never>>(ENDPOINTS.admin.userEnable(id))
    return data.message
  },
  async orders(page = 0, size = 10): Promise<Page<Order>> {
    const { data } = await http.get<ApiResponse<Page<Order>>>(ENDPOINTS.admin.orders, { params: { page, size } })
    return unwrap(data)
  },
  async updateOrderStatus(id: number, status: string): Promise<string> {
    const { data } = await http.put<ApiResponse<never>>(ENDPOINTS.admin.orderStatus(id), { status })
    return data.message
  },
}
