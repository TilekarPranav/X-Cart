import { Link } from "react-router-dom"
import { Heart, ShoppingCart } from "lucide-react"
import type { Product } from "@/types/api"
import { formatCurrency, formatImageUrl } from "@/utils/format"
import { cn } from "@/utils/cn"
import { Badge, Button, Rating } from "@/components/ui"
import { useWishlist } from "@/context/WishlistContext"
import { useAddToCart } from "@/hooks/useCommerce"

export function ProductCard({ product }: { product: Product }) {
  const { has, toggle } = useWishlist()
  const addToCart = useAddToCart()
  const wished = has(product.id)
  const rating = 3.5 + ((product.id % 3) * 0.5)

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-md">
      <Link to={`/products/${product.id}`} className="relative block aspect-square overflow-hidden bg-muted">
        <img
          src={formatImageUrl(product.imageUrl)}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-contain p-6 transition-transform duration-300 group-hover:scale-105"
        />
        {!product.active && (
          <Badge variant="secondary" className="absolute left-3 top-3">
            Out of stock
          </Badge>
        )}
      </Link>
      <button
        onClick={() => toggle(product.id)}
        aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={wished}
        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/80 backdrop-blur transition-colors hover:bg-background"
      >
        <Heart className={cn("h-4 w-4", wished ? "fill-destructive text-destructive" : "text-muted-foreground")} />
      </button>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{product.categoryName}</p>
        <Link
          to={`/products/${product.id}`}
          className="mt-1 line-clamp-2 text-sm font-semibold text-foreground hover:text-primary"
        >
          {product.name}
        </Link>
        <Rating value={rating} size={13} className="mt-2" />
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-lg font-bold text-foreground">{formatCurrency(product.price)}</span>
          <Button
            size="icon"
            className="h-9 w-9"
            disabled={!product.active}
            loading={addToCart.isPending}
            onClick={() => addToCart.mutate({ productId: product.id, quantity: 1 })}
            aria-label="Add to cart"
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
