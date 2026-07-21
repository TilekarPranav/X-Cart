import { useState } from "react"
import { toast } from "sonner"
import { Eye } from "lucide-react"
import { formatCurrency, formatDate } from "@/utils/format"
import { useAdminOrders, useUpdateAdminOrderStatus } from "@/hooks/useAdmin"
import { getErrorMessage } from "@/services/http"
import type { Order, OrderStatus } from "@/types/api"
import { OrderStatusBadge } from "@/components/product/Widgets"
import { DataTable, Modal, Pagination, Select, type Column } from "@/components/ui"

// Mirrors the backend's order state machine so illegal transitions are disabled
// client-side rather than surfaced only after a failed request.
const ALLOWED_TRANSITIONS: Record<string, OrderStatus[]> = {
  PLACED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
}

export default function AdminOrdersPage() {
  const [page, setPage] = useState(0)
  const { data, isLoading } = useAdminOrders(page)
  const updateStatus = useUpdateAdminOrderStatus()
  const [viewing, setViewing] = useState<Order | null>(null)

  async function changeStatus(order: Order, status: string) {
    if (!status || status === order.status) return
    try {
      await updateStatus.mutateAsync({ id: order.id, status })
      toast.success(`Order #${order.id} updated to ${status.toLowerCase()}`)
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not update order status"))
    }
  }

  const columns: Column<Order>[] = [
    { key: "id", header: "Order", render: (o) => <span className="font-medium text-foreground">#{o.id}</span> },
    { key: "createdAt", header: "Date", render: (o) => formatDate(o.createdAt) },
    { key: "totalAmount", header: "Total", render: (o) => formatCurrency(o.totalAmount) },
    { key: "status", header: "Status", render: (o) => <OrderStatusBadge status={o.status} /> },
    {
      key: "transition",
      header: "Update Status",
      render: (o) => {
        const allowed = ALLOWED_TRANSITIONS[o.status] ?? []
        return (
          <Select
            aria-label={`Update status for order ${o.id}`}
            value=""
            onChange={(e) => changeStatus(o, e.target.value)}
            disabled={allowed.length === 0}
            options={[
              { value: "", label: allowed.length ? "Change to..." : "No transitions available" },
              ...allowed.map((s) => ({ value: s, label: s.charAt(0) + s.slice(1).toLowerCase() })),
            ]}
            className="h-9 min-w-[10rem] text-xs"
          />
        )
      },
    },
    {
      key: "actions",
      header: "",
      render: (o) => (
        <button onClick={() => setViewing(o)} className="rounded-lg p-2 hover:bg-muted" aria-label="View order">
          <Eye className="h-4 w-4 text-muted-foreground" />
        </button>
      ),
      className: "text-right",
    },
  ]

  return (
    <div>
      <h1 className="text-h3 font-display text-foreground">Orders</h1>
      <p className="mt-1 text-sm text-muted-foreground">Track and manage every order placed on X Cart.</p>

      <div className="mt-6">
        <DataTable columns={columns} rows={data?.content ?? []} loading={isLoading} emptyLabel="No orders yet." />
      </div>

      {data && data.totalPages > 1 && (
        <div className="mt-6">
          <Pagination page={page + 1} totalPages={data.totalPages} onChange={(p) => setPage(p - 1)} />
        </div>
      )}

      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing ? `Order #${viewing.id}` : undefined}>
        {viewing && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <OrderStatusBadge status={viewing.status} />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Placed</span>
              <span className="text-foreground">{formatDate(viewing.createdAt)}</span>
            </div>
            <ul className="divide-y divide-border rounded-lg border border-border">
              {viewing.items.map((item, i) => (
                <li key={i} className="flex justify-between p-3 text-sm">
                  <span className="text-foreground">
                    {item.productName} × {item.quantity}
                  </span>
                  <span className="text-muted-foreground">{formatCurrency(item.subtotal)}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between border-t border-border pt-3 text-base font-semibold text-foreground">
              <span>Total</span>
              <span>{formatCurrency(viewing.totalAmount)}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
