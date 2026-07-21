import { PackageX } from "lucide-react"
import type { Product } from "@/types/api"
import { EmptyState, Skeleton } from "@/components/ui"
import { ProductCard } from "./ProductCard"

export function ProductGrid({
  products,
  loading,
  skeletonCount = 8,
}: {
  products?: Product[]
  loading?: boolean
  skeletonCount?: number
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-border">
            <Skeleton className="aspect-square w-full" />
            <div className="space-y-2 p-4">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        icon={<PackageX className="h-6 w-6" />}
        title="No products found"
        description="Try adjusting your filters or search terms."
      />
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}
