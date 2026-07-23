import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Heart, ShoppingCart, Truck, ShieldCheck, RotateCcw, Star } from "lucide-react"
import { formatCurrency, formatDate, formatImageUrl } from "@/utils/format"
import { reviewSchema, type ReviewValues } from "@/utils/schemas"
import { useProduct, useProducts, useReviewAverage, useReviews, useCreateReview } from "@/hooks/useCatalog"
import { useInventory } from "@/hooks/useCommerce"
import { useAddToCart } from "@/hooks/useCommerce"
import { useWishlist } from "@/context/WishlistContext"
import { useAuth } from "@/context/AuthContext"
import { getErrorMessage } from "@/services/http"
import { Badge, Button, ErrorMessage, Input, Rating, Skeleton, Tabs, Textarea } from "@/components/ui"
import { QuantityStepper, StarRatingInput } from "@/components/product/Widgets"
import { ProductGrid } from "@/components/product/ProductGrid"
import { getPageMeta } from "@/utils/pagination"

export default function ProductDetailPage() {
  const { id } = useParams()
  const productId = Number(id)
  const { data: product, isLoading, isError } = useProduct(productId)
  const { data: inventory } = useInventory(productId)
  const { data: reviewsPage } = useReviews(productId)
  const { data: average } = useReviewAverage(productId)
  const { data: related } = useProducts({ categoryId: product?.categoryId, size: 4 })

  const { isAuthenticated } = useAuth()
  const { has, toggle } = useWishlist()
  const addToCart = useAddToCart()
  const createReview = useCreateReview(productId)

  const [quantity, setQuantity] = useState(1)
  const [tab, setTab] = useState("description")

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReviewValues>({ resolver: zodResolver(reviewSchema), defaultValues: { rating: 0 } })

  async function onSubmitReview(values: ReviewValues) {
    try {
      await createReview.mutateAsync(values)
      toast.success("Review submitted — thanks for sharing!")
      reset({ reviewerName: "", rating: 0, comment: "" })
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not submit your review"))
    }
  }

  if (isLoading) {
    return (
      <div className="container grid gap-8 py-8 lg:grid-cols-2">
        <Skeleton className="aspect-square rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-10 w-1/4" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="container py-16">
        <ErrorMessage title="Product not found" description="This product may have been removed." />
      </div>
    )
  }

  const wished = has(product.id)
  const outOfStock = !product.active || (inventory && !inventory.inStock)

  return (
    <div className="container py-8">
      <nav className="mb-6 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          Home
        </Link>{" "}
        /{" "}
        <Link to={`/products?categoryId=${product.categoryId}`} className="hover:text-foreground">
          {product.categoryName}
        </Link>{" "}
        / <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted">
            <img
              src={formatImageUrl(product.imageUrl)}
              alt={product.name}
              className="h-full w-full object-contain p-10"
            />
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{product.categoryName}</p>
          <h1 className="mt-1 text-h2 font-display text-foreground">{product.name}</h1>
          <div className="mt-2 flex items-center gap-2">
            <Rating value={average ?? 0} count={getPageMeta(reviewsPage).totalElements} />
          </div>
          <p className="mt-4 text-h3 font-bold text-foreground">{formatCurrency(product.price)}</p>
          <p className="mt-2 text-sm text-muted-foreground">{product.description}</p>

          <div className="mt-4">
            {outOfStock ? (
              <Badge variant="destructive">Out of stock</Badge>
            ) : (
              <Badge variant="success">In stock{inventory ? ` · ${inventory.quantity} left` : ""}</Badge>
            )}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <QuantityStepper value={quantity} onChange={setQuantity} max={inventory?.quantity ?? 99} />
            <Button
              size="lg"
              className="flex-1"
              disabled={outOfStock}
              loading={addToCart.isPending}
              onClick={() => {
                if (!isAuthenticated) {
                  toast.error("Please log in to add items to your cart")
                  return
                }
                addToCart.mutate(
                  { productId: product.id, quantity },
                  { onSuccess: () => toast.success("Added to cart") },
                )
              }}
            >
              <ShoppingCart className="h-4 w-4" /> Add to Cart
            </Button>
            <button
              onClick={() => toggle(product.id)}
              aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border hover:bg-muted"
            >
              <Heart className={wished ? "h-5 w-5 fill-destructive text-destructive" : "h-5 w-5 text-muted-foreground"} />
            </button>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4" /> Free delivery
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Secure payment
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" /> 30-day returns
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-14">
        <Tabs
          items={[
            { value: "description", label: "Description" },
            { value: "specifications", label: "Specifications" },
            { value: "reviews", label: `Reviews (${getPageMeta(reviewsPage).totalElements})` },
          ]}
          value={tab}
          onChange={setTab}
        />
        <div className="py-6">
          {tab === "description" && <p className="max-w-2xl text-sm leading-relaxed text-foreground">{product.description}</p>}
          {tab === "specifications" && (
            <dl className="grid max-w-md grid-cols-2 gap-y-3 text-sm">
              <dt className="text-muted-foreground">Category</dt>
              <dd className="text-foreground">{product.categoryName}</dd>
              <dt className="text-muted-foreground">Added</dt>
              <dd className="text-foreground">{formatDate(product.createdAt)}</dd>
              <dt className="text-muted-foreground">Status</dt>
              <dd className="text-foreground">{product.active ? "Active" : "Discontinued"}</dd>
            </dl>
          )}
          {tab === "reviews" && (
            <div className="grid gap-10 lg:grid-cols-2">
              <div className="space-y-5">
                {(reviewsPage?.content ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground">No reviews yet — be the first to share your thoughts.</p>
                )}
                {(reviewsPage?.content ?? []).map((r) => (
                  <div key={r.id} className="border-b border-border pb-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">{r.reviewerName}</p>
                      <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>
                    </div>
                    <Rating value={r.rating} size={13} className="mt-1" />
                    <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSubmit(onSubmitReview)} className="space-y-4 rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-semibold text-foreground">Write a review</h3>
                <div>
                  <p className="mb-1.5 text-sm font-medium text-foreground">Your rating</p>
                  <StarRatingInput value={watch("rating") ?? 0} onChange={(v) => setValue("rating", v, { shouldValidate: true })} />
                  {errors.rating && <p className="mt-1.5 text-xs text-destructive">{errors.rating.message}</p>}
                </div>
                <Input label="Your name" placeholder="Jane Doe" error={errors.reviewerName?.message} {...register("reviewerName")} />
                <Textarea
                  label="Your review"
                  rows={4}
                  placeholder="What did you like or dislike?"
                  error={errors.comment?.message}
                  {...register("comment")}
                />
                <Button type="submit" loading={createReview.isPending} className="w-full">
                  <Star className="h-4 w-4" /> Submit review
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Related products */}
      {(related?.content?.length ?? 0) > 1 && (
        <div className="mt-14">
          <h2 className="mb-6 text-h3 font-display text-foreground">You may also like</h2>
          <ProductGrid products={related?.content.filter((p) => p.id !== product.id).slice(0, 4)} />
        </div>
      )}
    </div>
  )
}
