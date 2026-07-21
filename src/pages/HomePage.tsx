import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRight, Truck, ShieldCheck, RotateCcw, Sparkles } from "lucide-react"
import { useCategories, useProducts } from "@/hooks/useCatalog"
import { ProductGrid } from "@/components/product/ProductGrid"
import { Button, Skeleton } from "@/components/ui"

const perks = [
  { icon: Truck, title: "Free delivery", description: "On orders over $50" },
  { icon: ShieldCheck, title: "Secure checkout", description: "256-bit encrypted payments" },
  { icon: RotateCcw, title: "Easy returns", description: "30-day return window" },
  { icon: Sparkles, title: "Curated quality", description: "Hand-picked, tested products" },
]

const testimonials = [
  { name: "Priya S.", quote: "Fast shipping and the product quality is exactly as described. My go-to store now.", role: "Verified buyer" },
  { name: "Jordan M.", quote: "Checkout took under a minute and support answered my question in five.", role: "Verified buyer" },
  { name: "Alex T.", quote: "The best mix of premium feel and fair pricing I've found online.", role: "Verified buyer" },
]

const gridContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const gridItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
}

export default function HomePage() {
  const navigate = useNavigate()
  const { data: categories, isLoading: categoriesLoading } = useCategories()
  const { data: featured, isLoading: featuredLoading } = useProducts({ size: 8 })
  const { data: newArrivals, isLoading: newLoading } = useProducts({ size: 4 })

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-brand">
        <div className="container relative z-10 grid gap-8 py-16 sm:py-24 lg:grid-cols-2 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col justify-center"
          >
            <span className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              New season, new favorites
            </span>
            <h1 className="text-display font-display text-white">
              Premium shopping,
              <br />
              reimagined.
            </h1>
            <p className="mt-4 max-w-md text-body-lg text-white/85">
              Curated tech, home, and lifestyle essentials — fast delivery, secure checkout, effortless returns.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" variant="secondary" onClick={() => navigate("/products")}>
                Shop now <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 bg-white/5 text-white hover:bg-white/15"
                onClick={() => navigate("/categories")}
              >
                Browse categories
              </Button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="hidden items-center justify-center lg:flex"
          >
            <div className="grid grid-cols-2 gap-4">
              {(featured?.content ?? []).slice(0, 4).map((p) => (
                <div key={p.id} className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                  <div className="flex h-24 w-32 items-center justify-center rounded-xl bg-white/20 text-xs text-white/70">
                    {p.categoryName}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-16 top-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
      </section>

      {/* Perks */}
      <section className="border-b border-border bg-surface-elevated">
        <div className="container grid grid-cols-2 gap-6 py-8 sm:grid-cols-4">
          {perks.map((p) => (
            <div key={p.title} className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <p.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{p.title}</p>
                <p className="text-xs text-muted-foreground">{p.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container py-14">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-h2 font-display text-foreground">Shop by category</h2>
          <Link to="/categories" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>
        {categoriesLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        ) : (
          <motion.div
            variants={gridContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8"
          >
            {(categories ?? []).map((c) => (
              <motion.div key={c.id} variants={gridItem}>
                <Link
                  to={`/products?categoryId=${c.id}`}
                  className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card p-3 text-center transition-all hover:-translate-y-0.5 hover:shadow-medium"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {c.name.charAt(0)}
                  </span>
                  <span className="text-xs font-medium text-foreground">{c.name}</span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* Featured products */}
      <section className="container py-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-h2 font-display text-foreground">Trending now</h2>
          <Link to="/products" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>
        <ProductGrid products={featured?.content} loading={featuredLoading} />
      </section>

      {/* New arrivals */}
      <section className="container py-14">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-h2 font-display text-foreground">New arrivals</h2>
          <Link to="/products?sort=new" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>
        <ProductGrid products={newArrivals?.content} loading={newLoading} skeletonCount={4} />
      </section>

      {/* Testimonials */}
      <section className="bg-surface-elevated py-14">
        <div className="container">
          <h2 className="mb-8 text-center text-h2 font-display text-foreground">Loved by shoppers</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-xl border border-border bg-card p-6 shadow-soft">
                <p className="text-sm text-foreground">&ldquo;{t.quote}&rdquo;</p>
                <p className="mt-4 text-sm font-semibold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
