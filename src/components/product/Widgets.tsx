import { useState } from "react"
import { Minus, Plus, Star } from "lucide-react"
import type { OrderStatus, PaymentStatus } from "@/types/api"
import { cn } from "@/utils/cn"
import { Badge } from "@/components/ui"

/* ------------------------------ QuantityStepper ------------------------------ */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
}: {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
}) {
  return (
    <div className="inline-flex items-center rounded-lg border border-border">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className="flex h-9 w-9 items-center justify-center rounded-l-lg text-foreground transition-colors hover:bg-muted disabled:opacity-40"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-10 text-center text-sm font-medium tabular-nums">{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
        className="flex h-9 w-9 items-center justify-center rounded-r-lg text-foreground transition-colors hover:bg-muted disabled:opacity-40"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}

/* ------------------------------ StarRatingInput ------------------------------ */
export function StarRatingInput({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const star = i + 1
        const filled = star <= (hover || value)
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            aria-label={`Rate ${star} stars`}
            className="p-0.5"
          >
            <Star className={cn("h-6 w-6", filled ? "fill-warning text-warning" : "fill-muted text-muted")} />
          </button>
        )
      })}
    </div>
  )
}

/* ----------------------------- OrderStatusBadge ------------------------------ */
const orderStatusMap: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "secondary" }> = {
  PLACED: { label: "Placed", variant: "warning" },
  CONFIRMED: { label: "Confirmed", variant: "default" },
  SHIPPED: { label: "Shipped", variant: "default" },
  DELIVERED: { label: "Delivered", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
}
export function OrderStatusBadge({ status }: { status: OrderStatus | string }) {
  const s = orderStatusMap[status] ?? { label: status, variant: "secondary" as const }
  return <Badge variant={s.variant}>{s.label}</Badge>
}

const paymentStatusMap: Record<string, { label: string; variant: "success" | "warning" | "destructive" }> = {
  SUCCESS: { label: "Paid", variant: "success" },
  PENDING: { label: "Pending", variant: "warning" },
  FAILED: { label: "Failed", variant: "destructive" },
  REFUNDED: { label: "Refunded", variant: "warning" },
}
export function PaymentStatusBadge({ status }: { status: PaymentStatus | string }) {
  const s = paymentStatusMap[status] ?? { label: status, variant: "warning" as const }
  return <Badge variant={s.variant}>{s.label}</Badge>
}
