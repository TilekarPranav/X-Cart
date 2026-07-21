import { useNavigate, useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { CheckCircle2, Package } from "lucide-react"
import { useOrder } from "@/hooks/useCommerce"
import { formatCurrency } from "@/utils/format"
import { Button, Skeleton } from "@/components/ui"

export default function OrderSuccessPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: order, isLoading } = useOrder(Number(id))

  return (
    <div className="container flex flex-col items-center py-16 text-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 14 }}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success"
      >
        <CheckCircle2 className="h-9 w-9" />
      </motion.div>
      <h1 className="mt-6 text-h2 font-display text-foreground">Order placed successfully!</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Thank you for shopping with X Cart. We&rsquo;ll send you a confirmation email with your order details shortly.
      </p>

      {isLoading ? (
        <Skeleton className="mt-8 h-32 w-full max-w-sm rounded-xl" />
      ) : order ? (
        <div className="mt-8 w-full max-w-sm rounded-xl border border-border bg-card p-6 text-left">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Order number</span>
            <span className="text-sm font-semibold text-foreground">#{order.id}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-sm font-semibold text-foreground">{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={() => navigate(`/orders/${id}`)}>
          <Package className="h-4 w-4" /> Track Order
        </Button>
        <Button variant="outline" onClick={() => navigate("/products")}>
          Continue Shopping
        </Button>
      </div>
    </div>
  )
}
