import { Link, useNavigate } from "react-router-dom"
import { ShoppingBag, Trash2, ArrowRight } from "lucide-react"
import { formatCurrency } from "@/utils/format"
import { FREE_DELIVERY_THRESHOLD } from "@/constants/app"
import { useCart, useClearCart, useRemoveCartItem, useUpdateCartItem } from "@/hooks/useCommerce"
import { QuantityStepper } from "@/components/product/Widgets"
import { Button, EmptyState, Skeleton } from "@/components/ui"

export default function CartPage() {
  const navigate = useNavigate()
  const { data: cart, isLoading } = useCart()
  const updateItem = useUpdateCartItem()
  const removeItem = useRemoveCartItem()
  const clearCart = useClearCart()

  const items = cart?.items ?? []
  const total = cart?.totalAmount ?? 0
  const shipping = total > 0 && total < FREE_DELIVERY_THRESHOLD ? 9.99 : 0
  const tax = Math.round(total * 0.08 * 100) / 100
  const grandTotal = total + shipping + tax

  if (isLoading) {
    return (
      <div className="container py-10">
        <Skeleton className="mb-8 h-8 w-48" />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container py-16">
        <EmptyState
          icon={<ShoppingBag className="h-6 w-6" />}
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Let's fix that."
          action={<Button onClick={() => navigate("/products")}>Start shopping</Button>}
        />
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-h2 font-display text-foreground">Your Cart</h1>
        <button onClick={() => clearCart.mutate()} className="text-sm text-muted-foreground hover:text-destructive">
          Clear cart
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <div key={item.cartItemId} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-border bg-muted">
                <ShoppingBag className="h-8 w-8 text-muted-foreground/60" />
              </div>
              <div className="flex-1">
                <Link to={`/products/${item.productId}`} className="text-sm font-semibold text-foreground hover:text-primary">
                  {item.productName}
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">{formatCurrency(item.unitPrice)} each</p>
                <div className="mt-3 flex items-center justify-between">
                  <QuantityStepper
                    value={item.quantity}
                    onChange={(q) => updateItem.mutate({ cartItemId: item.cartItemId, quantity: q })}
                  />
                  <button
                    onClick={() => removeItem.mutate(item.cartItemId)}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" /> Remove
                  </button>
                </div>
              </div>
              <p className="w-24 shrink-0 text-right text-base font-semibold text-foreground">
                {formatCurrency(item.subtotal)}
              </p>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Order Summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-foreground">{shipping === 0 ? "Free" : formatCurrency(shipping)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated tax</span>
              <span className="text-foreground">{formatCurrency(tax)}</span>
            </div>
          </div>
          <div className="my-4 border-t border-border" />
          <div className="flex justify-between text-base font-semibold text-foreground">
            <span>Total</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>
          <Button size="lg" className="mt-6 w-full" onClick={() => navigate("/checkout")}>
            Proceed to Checkout <ArrowRight className="h-4 w-4" />
          </Button>
          <Link to="/products" className="mt-3 block text-center text-sm text-muted-foreground hover:text-foreground">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
