import { useParams } from "react-router-dom"
import { toast } from "sonner"
import { Check, Package, XCircle } from "lucide-react"
import { cn } from "@/utils/cn"
import { formatCurrency, formatDate } from "@/utils/format"
import { useOrder, usePayment, useCancelOrder } from "@/hooks/useCommerce"
import { getErrorMessage } from "@/services/http"
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/product/Widgets"
import { Button, ErrorMessage, Skeleton } from "@/components/ui"

const TIMELINE_STAGES = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"] as const
const CANCELLABLE_STATUSES = ["PLACED", "CONFIRMED"]

export default function OrderDetailPage() {
  const { id } = useParams()
  const orderId = Number(id)
  const { data: order, isLoading, isError } = useOrder(orderId)
  const { data: payment } = usePayment(orderId)
  const cancel = useCancelOrder()

  async function cancelOrder() {
    if (!order) return
    try {
      await cancel.mutateAsync(order.id)
      toast.success("Order cancelled")
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not cancel this order"))
    }
  }

  if (isLoading) {
    return (
      <div className="container py-10">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-6 h-40 w-full rounded-xl" />
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="container py-16">
        <ErrorMessage title="Order not found" description="We couldn't find this order." />
      </div>
    )
  }

  const isCancelled = order.status === "CANCELLED"
  const currentStageIndex = TIMELINE_STAGES.indexOf(order.status as (typeof TIMELINE_STAGES)[number])
  const canCancel = CANCELLABLE_STATUSES.includes(order.status)

  return (
    <div className="container py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-h2 font-display text-foreground">Order #{order.id}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Timeline */}
      <div className="mt-8 rounded-xl border border-border bg-card p-6">
        {isCancelled ? (
          <div className="flex items-center gap-3 text-destructive">
            <XCircle className="h-5 w-5" />
            <span className="text-sm font-medium">This order was cancelled.</span>
          </div>
        ) : (
          <div className="flex items-center">
            {TIMELINE_STAGES.map((stage, i) => (
              <div key={stage} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold",
                      i <= currentStageIndex
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    {i < currentStageIndex ? <Check className="h-4 w-4" /> : <Package className="h-3.5 w-3.5" />}
                  </div>
                  <span
                    className={cn(
                      "text-[11px] font-medium capitalize",
                      i <= currentStageIndex ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {stage.toLowerCase()}
                  </span>
                </div>
                {i < TIMELINE_STAGES.length - 1 && (
                  <div className={cn("mx-2 h-0.5 flex-1", i < currentStageIndex ? "bg-primary" : "bg-border")} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-foreground">Items</h2>
          <ul className="mt-4 divide-y divide-border rounded-xl border border-border">
            {order.items.map((item) => (
              <li key={item.productId} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.quantity} × {formatCurrency(item.unitPrice)}
                  </p>
                </div>
                <span className="text-sm font-semibold text-foreground">{formatCurrency(item.subtotal)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="h-fit space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground">Order Total</h3>
            <p className="mt-2 text-xl font-bold text-foreground">{formatCurrency(order.totalAmount)}</p>
          </div>
          {payment && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground">Payment</h3>
              <div className="mt-2 flex items-center justify-between">
                <PaymentStatusBadge status={payment.status} />
                <span className="text-xs text-muted-foreground">{payment.providerRef}</span>
              </div>
            </div>
          )}
          {canCancel && (
            <Button
              variant="destructive"
              className="w-full"
              loading={cancel.isPending}
              onClick={cancelOrder}
            >
              Cancel Order
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
