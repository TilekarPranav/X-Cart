import { Heart } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useWishlist } from "@/context/WishlistContext"
import { useProducts } from "@/hooks/useCatalog"
import { ProductGrid } from "@/components/product/ProductGrid"
import { Button, EmptyState } from "@/components/ui"

// TODO: backend endpoint pending — there is no /wishlist resource in the API
// contract yet, so ids are persisted client-side and hydrated from the
// products list. Once a real endpoint exists, swap this for a dedicated hook.
export default function WishlistPage() {
  const navigate = useNavigate()
  const { ids, clear } = useWishlist()
  const { data, isLoading } = useProducts({ size: 100 })

  const wishlistedProducts = (data?.content ?? []).filter((p) => ids.includes(p.id))

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-h2 font-display text-foreground">Wishlist</h1>
        {ids.length > 0 && (
          <button onClick={clear} className="text-sm text-muted-foreground hover:text-destructive">
            Clear all
          </button>
        )}
      </div>

      {!isLoading && ids.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<Heart className="h-6 w-6" />}
            title="Your wishlist is empty"
            description="Tap the heart icon on any product to save it for later."
            action={<Button onClick={() => navigate("/products")}>Browse products</Button>}
          />
        </div>
      ) : (
        <div className="mt-8">
          <ProductGrid products={wishlistedProducts} loading={isLoading} />
        </div>
      )}
    </div>
  )
}
