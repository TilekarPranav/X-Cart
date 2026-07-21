import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/api/query-keys"
import {
  cartService,
  inventoryService,
  orderService,
  paymentService,
} from "@/services/commerce.service"
import { useAuth } from "@/context/AuthContext"

/* -------------------------------- Cart --------------------------------- */

export function useCart() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.cart,
    queryFn: () => cartService.get(),
    enabled: isAuthenticated,
  })
}

export function useAddToCart() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { productId: number; quantity: number }) => cartService.add(payload),
    onSuccess: (cart) => qc.setQueryData(queryKeys.cart, cart),
  })
}

export function useUpdateCartItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { cartItemId: number; quantity: number }) => cartService.update(payload),
    onSuccess: (cart) => qc.setQueryData(queryKeys.cart, cart),
  })
}

export function useRemoveCartItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (cartItemId: number) => cartService.remove(cartItemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.cart }),
  })
}

export function useClearCart() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => cartService.clear(),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.cart }),
  })
}

/* ------------------------------- Orders -------------------------------- */

export function useOrders(page = 0) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: queryKeys.orders.list(page),
    queryFn: () => orderService.list(page),
    enabled: isAuthenticated,
    placeholderData: (prev) => prev,
  })
}

export function useOrder(id: number) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => orderService.getById(id),
    enabled: id > 0,
  })
}

export function usePlaceOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => orderService.place(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] })
      qc.invalidateQueries({ queryKey: queryKeys.cart })
    },
  })
}

// NOTE: order status updates are admin-only (PUT /admin/orders/{id}/status).
// Use useUpdateAdminOrderStatus from @/hooks/useAdmin instead.

export function useCancelOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => orderService.cancel(id),
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: ["orders"] })
      qc.invalidateQueries({ queryKey: queryKeys.orders.detail(id) })
    },
  })
}

/* ------------------------------ Payments ------------------------------- */

export function usePayment(orderId: number) {
  return useQuery({
    queryKey: queryKeys.payment(orderId),
    queryFn: () => paymentService.getByOrder(orderId),
    enabled: orderId > 0,
    retry: false,
  })
}

export function usePay() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { orderId: number; method?: string }) => paymentService.pay(payload),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.payment(vars.orderId) })
      qc.invalidateQueries({ queryKey: ["orders"] })
    },
  })
}

/* ----------------------------- Inventory ------------------------------- */

export function useInventory(productId: number) {
  return useQuery({
    queryKey: queryKeys.inventory(productId),
    queryFn: () => inventoryService.get(productId),
    enabled: productId > 0,
  })
}

export function useUpdateInventory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { productId: number; quantity: number }) => inventoryService.update(payload),
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: queryKeys.inventory(vars.productId) }),
  })
}
