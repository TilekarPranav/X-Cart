import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useCategories } from "@/hooks/useCatalog"
import { Skeleton } from "@/components/ui"

const gridContainer = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const gridItem = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories()

  return (
    <div className="container py-10">
      <h1 className="text-h2 font-display text-foreground">All Categories</h1>
      <p className="mt-1 text-sm text-muted-foreground">Browse the full X Cart catalog by category.</p>

      {isLoading ? (
        <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : (
        <motion.div
          variants={gridContainer}
          initial="hidden"
          animate="show"
          className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4"
        >
          {(categories ?? []).map((c) => (
            <motion.div key={c.id} variants={gridItem}>
              <Link
                to={`/products?categoryId=${c.id}`}
                className="flex h-32 flex-col justify-between rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-medium"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {c.name.charAt(0)}
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{c.name}</p>
                  <p className="line-clamp-1 text-xs text-muted-foreground">{c.description}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
