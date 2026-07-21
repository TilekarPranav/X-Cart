import { Link } from "react-router-dom"
import { Users, Package, ShoppingCart, DollarSign, AlertTriangle, Clock, ArrowUpRight } from "lucide-react"
import { formatCurrency, formatDate } from "@/utils/format"
import { useAdminDashboard, useAdminOrders } from "@/hooks/useAdmin"
import { OrderStatusBadge } from "@/components/product/Widgets"
import { Skeleton } from "@/components/ui"

export default function AdminDashboardPage() {
  const { data: dash, isLoading } = useAdminDashboard()
  const { data: recentOrders, isLoading: ordersLoading } = useAdminOrders(0)

  const stats = [
    { label: "Total Revenue", value: dash ? formatCurrency(dash.totalRevenue) : "—", icon: DollarSign, tone: "primary" as const },
    { label: "Total Orders", value: dash?.totalOrders ?? "—", icon: ShoppingCart, tone: "default" as const },
    { label: "Total Products", value: dash?.totalProducts ?? "—", icon: Package, tone: "default" as const },
    { label: "Total Users", value: dash?.totalUsers ?? "—", icon: Users, tone: "default" as const },
    {
      label: "Pending Orders",
      value: dash?.pendingOrderCount ?? "—",
      icon: Clock,
      tone: (dash?.pendingOrderCount ?? 0) > 0 ? ("warning" as const) : ("default" as const),
    },
    {
      label: "Low Stock Items",
      value: dash?.lowStockProductCount ?? "—",
      icon: AlertTriangle,
      tone: (dash?.lowStockProductCount ?? 0) > 0 ? ("warning" as const) : ("default" as const),
    },
  ]

  return (
    <div>
      <h1 className="text-h3 font-display text-foreground">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">An overview of how X Cart is performing.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`rounded-xl border p-5 ${
              s.tone === "warning" ? "border-warning/30 bg-warning/5" : "border-border bg-card"
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                  s.tone === "primary"
                    ? "bg-primary/10 text-primary"
                    : s.tone === "warning"
                      ? "bg-warning/15 text-warning"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                <s.icon className="h-4 w-4" />
              </span>
            </div>
            {isLoading ? (
              <Skeleton className="mt-4 h-7 w-20" />
            ) : (
              <p className="mt-4 text-2xl font-bold text-foreground">{s.value}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Recent Orders</h2>
          <Link to="/admin/orders" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            View all <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="space-y-3">
          {ordersLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
          ) : (recentOrders?.content ?? []).length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            (recentOrders?.content ?? []).slice(0, 5).map((o) => (
              <div key={o.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-foreground">Order #{o.id}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(o.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <OrderStatusBadge status={o.status} />
                  <span className="w-20 text-right text-sm font-semibold text-foreground">
                    {formatCurrency(o.totalAmount)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
