import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/api/query-keys"
import { adminService, notificationService } from "@/services/admin.service"
import { useAuth } from "@/context/AuthContext"

/* --------------------------- Notifications ----------------------------- */

export function useNotifications(page = 0) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.notifications(page),
    queryFn: () => notificationService.list(page),
    enabled: isAuthenticated,
  })
}

export function useMarkNotificationRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => notificationService.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  })
}

/* ------------------------------- Admin --------------------------------- */

export function useAdminDashboard() {
  return useQuery({ queryKey: queryKeys.admin.dashboard, queryFn: () => adminService.dashboard() })
}

export function useAdminUsers(page = 0) {
  return useQuery({
    queryKey: queryKeys.admin.users(page),
    queryFn: () => adminService.users(page),
    placeholderData: (prev) => prev,
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => adminService.deleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  })
}

export function useToggleUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, enable }: { id: number; enable: boolean }) =>
      enable ? adminService.enableUser(id) : adminService.disableUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  })
}

export function useAdminOrders(page = 0) {
  return useQuery({
    queryKey: queryKeys.admin.orders(page),
    queryFn: () => adminService.orders(page),
    placeholderData: (prev) => prev,
  })
}

export function useUpdateAdminOrderStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => adminService.updateOrderStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "orders"] })
      qc.invalidateQueries({ queryKey: queryKeys.admin.dashboard })
    },
  })
}
