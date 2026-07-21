import { useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { SlidersHorizontal, X } from "lucide-react"
import { useCategories, useProducts } from "@/hooks/useCatalog"
import { useDebounce } from "@/hooks/useUtils"
import { ProductGrid } from "@/components/product/ProductGrid"
import { Button, Checkbox, Pagination, Select } from "@/components/ui"

type SortKey = "relevance" | "price-asc" | "price-desc" | "new"

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "new", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
]

export default function ProductListPage({ mode = "browse" }: { mode?: "browse" | "search" }) {
  const [params, setParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [inStockOnly, setInStockOnly] = useState(false)

  const nameQuery = mode === "search" ? params.get("q") ?? "" : ""
  const categoryId = params.get("categoryId") ? Number(params.get("categoryId")) : undefined
  const page = Number(params.get("page") ?? 0)
  const sort = (params.get("sort") as SortKey) ?? "relevance"

  const debouncedName = useDebounce(nameQuery, 200)
  const { data: categories } = useCategories()
  const { data, isLoading } = useProducts({ name: debouncedName, categoryId, page, size: 12 })

  const sortedFiltered = useMemo(() => {
    let list = data?.content ?? []
    if (inStockOnly) list = list.filter((p) => p.active)
    list = [...list]
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price)
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price)
    if (sort === "new") list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return list
  }, [data, sort, inStockOnly])

  function setParam(key: string, value: string | undefined) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== "page") next.delete("page")
    setParams(next)
  }

  const activeCategory = categories?.find((c) => c.id === categoryId)

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-h2 font-display text-foreground">
          {mode === "search" ? `Results for "${nameQuery}"` : activeCategory ? activeCategory.name : "All Products"}
        </h1>
        {data && <p className="mt-1 text-sm text-muted-foreground">{data.totalElements} products</p>}
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Filter sidebar */}
        <aside className={`lg:block lg:w-64 ${filtersOpen ? "block" : "hidden"}`}>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between lg:hidden">
              <h3 className="text-sm font-semibold text-foreground">Filters</h3>
              <button onClick={() => setFiltersOpen(false)} aria-label="Close filters">
                <X className="h-4 w-4" />
              </button>
            </div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Category</h3>
            <div className="space-y-2">
              <button
                onClick={() => setParam("categoryId", undefined)}
                className={`block text-sm ${!categoryId ? "font-semibold text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                All categories
              </button>
              {(categories ?? []).map((c) => (
                <button
                  key={c.id}
                  onClick={() => setParam("categoryId", String(c.id))}
                  className={`block text-sm ${categoryId === c.id ? "font-semibold text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {c.name}
                </button>
              ))}
            </div>
            <div className="my-5 border-t border-border" />
            <h3 className="mb-3 text-sm font-semibold text-foreground">Availability</h3>
            <Checkbox
              label="In stock only"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
            />
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          <div className="mb-5 flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setFiltersOpen((v) => !v)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
            <div className="ml-auto w-48">
              <Select
                aria-label="Sort by"
                value={sort}
                onChange={(e) => setParam("sort", e.target.value)}
                options={sortOptions.map((o) => ({ value: o.value, label: o.label }))}
              />
            </div>
          </div>

          <ProductGrid products={sortedFiltered} loading={isLoading} />

          {data && data.totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                page={page + 1}
                totalPages={data.totalPages}
                onChange={(p) => setParam("page", String(p - 1))}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
