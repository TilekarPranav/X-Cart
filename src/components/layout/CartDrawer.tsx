import { Link, useNavigate } from "react-router-dom"
import { ShoppingBag, Trash2 } from "lucide-react"
import { formatCurrency } from "@/utils/format"
import { FREE_DELIVERY_THRESHOLD } from "@/constants/app"
import { useAuth } from "@/context/AuthContext"
import { useCart, useRemoveCartItem, useUpdateCartItem } from "@/hooks/useCommerce"
import { Button, Drawer, EmptyState, Skeleton } from "@/components/ui"
import { QuantityStepper } from "@/components/product/Widgets"

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { isAuthenticated } = useAuth()
  const { data: cart, isLoading } = useCart()
  const updateItem = useUpdateCartItem()
  const removeItem = useRemoveCartItem()
  const navigate = useNavigate()

  const items = cart?.items ?? []
  const total = cart?.totalAmount ?? 0
  const remainingForFreeShipping = Math.max(0, FREE_DELIVERY_THRESHOLD - total)

  function goToCheckout() {
    onClose()
    navigate("/checkout")
  }

  return (
    <Drawer open={open} onClose={onClose} title="Your Cart" side="right">
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          {!isAuthenticated ? (
            <EmptyState
              icon={<ShoppingBag className="h-6 w-6" />}
              title="Log in to see your cart"
              description="Sign in to add items and check out."
              action={
                <Button
                  onClick={() => {
                    onClose()
                    navigate("/login")
                  }}
                >
                  Log in
                </Button>
              }
            />
          ) : isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-16 w-16 shrink-0 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={<ShoppingBag className="h-6 w-6" />}
              title="Your cart is empty"
              description="Browse our catalog and add something you love."
              action={
                <Button
                  onClick={() => {
                    onClose()
                    navigate("/products")
                  }}
                >
                  Start shopping
                </Button>
              }
            />
          ) : (
            <>
              {remainingForFreeShipping > 0 && (
                <div className="mb-4 rounded-lg bg-accent/10 px-3 py-2 text-xs text-accent-foreground">
                  Add <strong>{formatCurrency(remainingForFreeShipping)}</strong> more for free delivery.
                </div>
              )}
              <ul className="space-y-4">
                {items.map((item) => (
                  <li key={item.cartItemId} className="flex gap-3">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
                      IMG
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/products/${item.productId}`}
                          onClick={onClose}
                          className="line-clamp-2 text-sm font-medium text-foreground hover:text-primary"
                        >
                          {item.productName}
                        </Link>
                        <button
                          onClick={() => removeItem.mutate(item.cartItemId)}
                          aria-label="Remove item"
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <QuantityStepper
                          value={item.quantity}
                          onChange={(q) => updateItem.mutate({ cartItemId: item.cartItemId, quantity: q })}
                        />
                        <span className="text-sm font-semibold text-foreground">{formatCurrency(item.subtotal)}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {isAuthenticated && items.length > 0 && (
          <div className="border-t border-border p-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-base font-semibold text-foreground">{formatCurrency(total)}</span>
            </div>
            <Button className="w-full" size="lg" onClick={goToCheckout}>
              Checkout
            </Button>
            <Link
              to="/cart"
              onClick={onClose}
              className="mt-2 block text-center text-xs text-muted-foreground hover:text-foreground"
            >
              View full cart
            </Link>
          </div>
        )}
      </div>
    </Drawer>
  )
}
