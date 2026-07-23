import { Link, useSearchParams } from "react-router-dom"
import { Package, ChevronRight } from "lucide-react"
import { formatCurrency, formatDate } from "@/utils/format"
import { useOrders } from "@/hooks/useCommerce"
import { OrderStatusBadge } from "@/components/product/Widgets"
import { EmptyState, Pagination, Skeleton } from "@/components/ui"
import { getPageMeta } from "@/utils/pagination"

export default function OrdersPage() {
  const [params, setParams] = useSearchParams()
  const page = Number(params.get("page") ?? 0)
  const { data, isLoading } = useOrders(page)

  function setPage(p: number) {
    const next = new URLSearchParams(params)
    next.set("page", String(p))
    setParams(next)
  }

  return (
    <div className="container py-10">
      <h1 className="text-h2 font-display text-foreground">Your Orders</h1>

      {isLoading ? (
        <div className="mt-8 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : !data || data.content.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<Package className="h-6 w-6" />}
            title="No orders yet"
            description="Once you place an order, it'll show up here."
          />
        </div>
      ) : (
        <>
          <div className="mt-8 space-y-4">
            {data.content.map((order) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-medium"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-sm font-semibold text-foreground">Order #{order.id}</p>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Placed {formatDate(order.createdAt)} · {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                  </p>
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                    {order.items.map((i) => i.productName).join(", ")}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-base font-semibold text-foreground">{formatCurrency(order.totalAmount)}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
          {getPageMeta(data).totalPages > 1 && (
            <div className="mt-8">
              <Pagination page={page + 1} totalPages={getPageMeta(data).totalPages} onChange={(p) => setPage(p - 1)} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
